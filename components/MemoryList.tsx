"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function MemoryList() {
  const memories = useQuery(api.memories.list);

  console.log("[MemoryList] Memories query state:", {
    isLoading: memories === undefined,
    count: memories?.length ?? 0,
  });

  if (memories === undefined) {
    console.log("[MemoryList] Loading memories...");
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Memories</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    console.log("[MemoryList] No memories found");
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Memories</h2>
        <p className="text-gray-500 text-center py-8">
          No memories yet. Add one above!
        </p>
      </div>
    );
  }

  console.log("[MemoryList] Rendering", memories.length, "memories");

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Memories</h2>
      <div className="space-y-4">
        {memories.map((memory) => (
          <div
            key={memory._id}
            className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-medium text-gray-900">{memory.summary}</p>
              <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                {new Date(memory.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {memory.rawText}
            </p>

            <div className="flex flex-wrap gap-2">
              {memory.people.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {memory.people.map((person, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {person}
                    </span>
                  ))}
                </div>
              )}

              {memory.tasks.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {memory.tasks.map((task, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full"
                    >
                      {task}
                    </span>
                  ))}
                </div>
              )}

              {memory.topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {memory.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {memory.decisions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {memory.decisions.map((decision, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {decision}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center text-xs text-gray-400">
              <span
                className={`px-1.5 py-0.5 rounded ${
                  memory.source === "voice"
                    ? "bg-red-50 text-red-600"
                    : memory.source === "mcp"
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {memory.source}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
