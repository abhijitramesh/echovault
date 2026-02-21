"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Memory {
  _id: string;
  summary: string;
  rawText: string;
  people: string[];
  tasks: string[];
  topics: string[];
  score?: number;
}

interface SearchResult {
  answer: string;
  memories: Memory[];
}

export default function SearchChat() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const searchMemories = useAction(api.search.searchMemories);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    console.log("[SearchChat] Starting search for query:", query);
    setIsSearching(true);
    setResult(null);

    try {
      console.log("[SearchChat] Calling searchMemories action...");
      const searchResult = await searchMemories({ query });
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Ask Your Memories</h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What tasks do I have? What did I discuss with John?"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSearching}
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSearching ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Searching...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* AI Answer */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <p className="text-gray-800 whitespace-pre-wrap">{result.answer}</p>
            </div>
          </div>

          {/* Related Memories */}
          {result.memories.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Based on {result.memories.length} memor{result.memories.length === 1 ? "y" : "ies"}:
              </h3>
              <div className="space-y-2">
                {result.memories.map((memory) => (
                  <div
                    key={memory._id}
                    className="bg-gray-50 rounded-lg p-3 text-sm"
                  >
                    <p className="font-medium text-gray-700">{memory.summary}</p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                      {memory.rawText}
                    </p>
                    {memory.score !== undefined && (
                      <span className="text-xs text-gray-400">
                        Relevance: {Math.round(memory.score * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
