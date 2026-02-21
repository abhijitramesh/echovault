import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Vector search with Claude synthesis
export const searchMemories = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[search.searchMemories] Starting search for query:", args.query);

    // Generate embedding for the query
    console.log("[search.searchMemories] Generating query embedding...");
    const queryEmbedding = await generateEmbedding(args.query);
    console.log("[search.searchMemories] Query embedding generated");

    // Perform vector search with higher limit
    console.log("[search.searchMemories] Performing vector search...");
    const vectorResults = await ctx.vectorSearch("memories", "by_embedding", {
      vector: queryEmbedding,
      limit: 10,
    });
    console.log("[search.searchMemories] Vector search returned", vectorResults.length, "results");

    // Also do text-based search for people/topics mentioned in the query
    console.log("[search.searchMemories] Performing text-based search...");
    const textResults = await ctx.runQuery(api.search.searchByText, {
      query: args.query,
    });
    console.log("[search.searchMemories] Text search returned", textResults.length, "results");

    // Combine and deduplicate results
    const allResultIds = new Set<string>();
    const combinedResults: any[] = [];

    // Add vector results first (they're usually more relevant)
    for (const result of vectorResults) {
      allResultIds.add(result._id);
      combinedResults.push({ _id: result._id, _score: result._score });
    }

    // Add text results that aren't already included
    for (const result of textResults) {
      if (!allResultIds.has(result._id)) {
        allResultIds.add(result._id);
        combinedResults.push({ _id: result._id, _score: 0.7 }); // Give them a decent score
      }
    }

    console.log("[search.searchMemories] Combined results:", combinedResults.length);

    if (combinedResults.length === 0) {
      console.log("[search.searchMemories] No results found");
      return {
        answer: "I couldn't find any relevant memories for your query.",
        memories: [],
      };
    }

    // Fetch full memory documents
    console.log("[search.searchMemories] Fetching full memory documents...");
    const memories = await Promise.all(
      combinedResults.slice(0, 10).map(async (result) => {
        const memory = await ctx.runQuery(api.search.getMemoryById, {
          id: result._id,
        });
        console.log("[search.searchMemories] Fetched memory:", result._id, "score:", result._score);
        return { ...memory, score: result._score };
      })
    );

    // Use Claude to synthesize an answer
    console.log("[search.searchMemories] Synthesizing answer with Claude...");
    const answer = await synthesizeWithClaude(args.query, memories);
    console.log("[search.searchMemories] Answer synthesized, length:", answer.length);

    return {
      answer,
      memories: memories.filter(Boolean),
    };
  },
});

// Internal query to get memory by ID
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getMemoryById = query({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Text-based search for people, topics, and keywords
export const searchByText = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const queryLower = args.query.toLowerCase();

    // Extract potential names (capitalized words)
    const words = args.query.split(/\s+/);
    const potentialNames = words.filter(w => w.length > 2 && w[0] === w[0].toUpperCase());

    console.log("[search.searchByText] Searching for:", queryLower);
    console.log("[search.searchByText] Potential names:", potentialNames);

    // Get all memories
    const allMemories = await ctx.db.query("memories").collect();

    // Filter memories that match the query
    const matches = allMemories.filter(memory => {
      // Check if any people match
      const peopleMatch = memory.people.some(person =>
        person.toLowerCase().includes(queryLower) ||
        potentialNames.some(name => person.toLowerCase().includes(name.toLowerCase()))
      );

      // Check if any topics match
      const topicsMatch = memory.topics.some(topic =>
        topic.toLowerCase().includes(queryLower)
      );

      // Check if any tasks match
      const tasksMatch = memory.tasks.some(task =>
        task.toLowerCase().includes(queryLower)
      );

      // Check if any decisions match
      const decisionsMatch = memory.decisions.some(decision =>
        decision.toLowerCase().includes(queryLower)
      );

      // Check if summary or raw text contains the query
      const textMatch =
        memory.summary.toLowerCase().includes(queryLower) ||
        memory.rawText.toLowerCase().includes(queryLower);

      return peopleMatch || topicsMatch || tasksMatch || decisionsMatch || textMatch;
    });

    console.log("[search.searchByText] Found", matches.length, "text-based matches");

    // Return sorted by creation time (most recent first)
    return matches
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  },
});

// Helper: Generate embedding with OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  console.log("[search.generateEmbedding] Generating embedding for:", text.slice(0, 50));

  const rawApiKey = process.env.OPENAI_API_KEY;
  // Clean the API key: trim, remove quotes, remove newlines and carriage returns
  const apiKey = rawApiKey
    ?.trim()
    .replace(/^["']|["']$/g, '')
    .replace(/[\r\n]/g, '');

  console.log("[search.generateEmbedding] OpenAI API key debug:", {
    present: !!apiKey,
    length: apiKey?.length,
    prefix: apiKey?.slice(0, 7),
  });

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set in Convex dashboard");
  }

  if (!apiKey.startsWith("sk-")) {
    throw new Error("OPENAI_API_KEY appears invalid. Should start with 'sk-'");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  console.log("[search.generateEmbedding] OpenAI response status:", response.status);

  const data = await response.json();

  if (!response.ok) {
    console.error("[search.generateEmbedding] OpenAI API error:", data);
    throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
  }

  console.log("[search.generateEmbedding] Embedding generated successfully");
  return data.data[0].embedding;
}

// Helper: Synthesize answer with Claude
async function synthesizeWithClaude(
  query: string,
  memories: any[]
): Promise<string> {
  console.log("[search.synthesizeWithClaude] Synthesizing answer for query:", query);
  console.log("[search.synthesizeWithClaude] Using", memories.length, "memories for context");

  const memoriesContext = memories
    .map(
      (m, i) =>
        `Memory ${i + 1}:
Summary: ${m.summary}
Full text: ${m.rawText}
People: ${m.people?.join(", ") || "None"}
Tasks: ${m.tasks?.join(", ") || "None"}
Topics: ${m.topics?.join(", ") || "None"}
Decisions: ${m.decisions?.join(", ") || "None"}`
    )
    .join("\n\n");

  const rawApiKey = process.env.ANTHROPIC_API_KEY;
  // Clean the API key: trim, remove quotes, remove newlines and carriage returns
  const apiKey = rawApiKey
    ?.trim()
    .replace(/^["']|["']$/g, '')
    .replace(/[\r\n]/g, '');

  console.log("[search.synthesizeWithClaude] Anthropic API key debug:", {
    present: !!apiKey,
    length: apiKey?.length,
    prefix: apiKey?.slice(0, 7),
  });

  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    throw new Error("ANTHROPIC_API_KEY is missing or invalid");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a personal memory assistant. Based on the user's memories below, answer their question.

User's Question: "${query}"

Relevant Memories:
${memoriesContext}

Provide a helpful, conversational answer based on the memories. If the memories don't contain enough information to fully answer, say so. Be concise but complete.`,
        },
      ],
    }),
  });

  console.log("[search.synthesizeWithClaude] Claude response status:", response.status);

  const data = await response.json();

  if (!response.ok) {
    console.error("[search.synthesizeWithClaude] Claude API error:", data);
    throw new Error(`Claude API error: ${data.error?.message || "Unknown error"}`);
  }

  const answer = data.content[0].text;
  console.log("[search.synthesizeWithClaude] Answer generated:", answer.slice(0, 100));

  return answer;
}
