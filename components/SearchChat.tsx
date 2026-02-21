"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, Cpu, Loader2, ChevronRight, Terminal } from "lucide-react";

interface Memory {
  _id: string;
  summary: string;
  rawText: string;
  people?: string[];
  tasks?: string[];
  topics?: string[];
  score?: number;
}

interface SearchResult {
  answer: string;
  memories: Memory[];
}

const exampleQuestions = [
  "What did I discuss with Sarah last week?",
  "What tasks am I working on?",
  "What decisions have I made recently?",
  "Summarize my meetings this month",
];

export default function SearchChat() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const searchMemories = useAction(api.search.searchMemories);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    console.log("[SearchChat] Starting search for query:", q);
    setQuery(q);
    setIsSearching(true);
    setResult(null);

    try {
      console.log("[SearchChat] Calling searchMemories action...");
      const searchResult = await searchMemories({ query: q });
      console.log("[SearchChat] Search result received:", {
        answerLength: searchResult.answer?.length,
        memoriesFound: searchResult.memories?.length,
      });
      console.log("[SearchChat] Answer:", searchResult.answer);
      setResult(searchResult);
    } catch (error) {
      console.error("[SearchChat] Search failed:", error);
      setResult({
        answer: "Sorry, I couldn't search your memories. Please try again.",
        memories: [],
      });
    } finally {
      setIsSearching(false);
      console.log("[SearchChat] Search complete");
    }
  };

  return (
    <div className="neon-card rounded-md overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #3f3f46' }}>
        <div className="flex items-center gap-2.5">
          <Terminal className="size-4" style={{ color: '#ff2d7b' }} />
          <h2 className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase glow-pink" style={{ color: '#ff2d7b' }}>
            Query Interface
          </h2>
        </div>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: '#3f3f46' }}>
          {isSearching ? "[ Searching ]" : "[ Awaiting ]"}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Search bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: '#3f3f46' }} />
            <input
              type="text"
              placeholder="> query your memory vault_"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={isSearching}
              className="neon-input w-full h-11 rounded-md pl-10 pr-4 font-mono text-sm disabled:opacity-40"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isSearching}
            className="h-11 px-6 rounded-md font-mono text-[11px] font-semibold tracking-[0.15em] uppercase cyber-btn cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSearching ? <Loader2 className="size-4 animate-spin" /> : "Execute"}
          </button>
        </div>

        {/* Example queries */}
        {!result && !isSearching && (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: '#3f3f46' }}>
              Suggested Queries:
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSearch(question)}
                  className="rounded-md px-3 py-1.5 font-mono text-[10px] tracking-wide cursor-pointer transition-all neon-tag-cyan hover:shadow-[0_0_12px_rgba(14,231,231,0.15)]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isSearching && (
          <div className="flex flex-col gap-4">
            <div className="rounded-md p-5" style={{ background: 'rgba(14, 231, 231, 0.04)', border: '1px solid rgba(14, 231, 231, 0.15)' }}>
              <div className="flex items-center gap-2.5 mb-4">
                <Loader2 className="size-3.5 animate-spin" style={{ color: '#0ee7e7' }} />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase glow-cyan-subtle" style={{ color: '#0ee7e7' }}>
                  Processing neural query...
                </span>
              </div>
              <div className="space-y-2">
                {[100, 85, 65].map((w, i) => (
                  <div
                    key={i}
                    className="h-2 rounded-sm animate-pulse"
                    style={{ width: `${w}%`, background: 'rgba(14, 231, 231, 0.1)', animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-md p-3 flex items-center gap-3" style={{ border: '1px solid #3f3f46', background: '#27272a' }}>
                  <div className="h-3 w-3 rounded-sm animate-pulse" style={{ background: '#3f3f46' }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 rounded-sm animate-pulse" style={{ width: '70%', background: '#3f3f46', animationDelay: `${i * 150}ms` }} />
                    <div className="h-2 rounded-sm animate-pulse" style={{ width: '30%', background: '#52525b', animationDelay: `${i * 200}ms` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isSearching && (
          <div className="flex flex-col gap-5 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
            {/* AI Answer */}
            <div className="rounded-md p-5 box-glow-cyan" style={{ background: 'rgba(14, 231, 231, 0.03)', border: '1px solid rgba(14, 231, 231, 0.15)' }}>
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ border: '1px solid rgba(14, 231, 231, 0.3)', background: 'rgba(14, 231, 231, 0.08)' }}>
                  <Cpu className="size-4" style={{ color: '#0ee7e7' }} />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase mb-2 glow-cyan-subtle" style={{ color: '#0ee7e7' }}>
                    Neural Response
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>
                    {result.answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Related memories */}
            {result.memories && result.memories.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: '#3f3f46' }}>
                  Linked Memory Nodes
                </p>
                {result.memories.map((memory) => (
                  <div
                    key={memory._id}
                    className="group flex items-center justify-between rounded-md p-3.5 cursor-pointer transition-all glitch-hover"
                    style={{ border: '1px solid #3f3f46', background: '#27272a' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(14, 231, 231, 0.4)';
                      e.currentTarget.style.background = 'rgba(14, 231, 231, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#3f3f46';
                      e.currentTarget.style.background = '#27272a';
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ChevronRight className="size-3 transition-colors shrink-0" style={{ color: '#3f3f46' }} />
                      <span className="font-mono text-xs truncate" style={{ color: '#d4d4d8' }}>{memory.summary}</span>
                    </div>
                    {memory.score !== undefined && (
                      <span className="font-mono text-[10px] shrink-0 ml-3" style={{ color: '#3f3f46' }}>
                        {Math.round(memory.score * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
