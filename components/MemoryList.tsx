"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Mic, Type, Cpu, Clock, Database, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Memory {
  _id: string;
  _creationTime: number;
  summary: string;
  rawText: string;
  people: string[];
  tasks: string[];
  topics: string[];
  decisions: string[];
  createdAt: number;
  source: "voice" | "text" | "mcp";
}

const sourceIcon: Record<Memory["source"], typeof Mic> = {
  voice: Mic,
  text: Type,
  mcp: Cpu,
};

const sourceLabel: Record<Memory["source"], string> = {
  voice: "Voice",
  text: "Text",
  mcp: "MCP",
};

function MemoryCard({ memory, index }: { memory: Memory; index: number }) {
  const SourceIcon = sourceIcon[memory.source];
  const timestamp = new Date(memory.createdAt).toLocaleString();

  return (
    <div
      className="group rounded-md cursor-pointer transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-3 glitch-hover"
      style={{
        border: '1px solid #3f3f46',
        background: '#27272a',
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(14, 231, 231, 0.4)';
        e.currentTarget.style.boxShadow = '0 0 25px rgba(14, 231, 231, 0.08), inset 0 1px 0 rgba(14, 231, 231, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#3f3f46';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-mono text-xs font-semibold leading-snug tracking-wide" style={{ color: '#d4d4d8' }}>
            {memory.summary}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 rounded-sm px-2 py-0.5" style={{ border: '1px solid #52525b', background: '#1f1f23' }}>
            <SourceIcon className="size-2.5" style={{ color: '#3f3f46' }} />
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.15em]" style={{ color: '#3f3f46' }}>
              {sourceLabel[memory.source]}
            </span>
          </div>
        </div>

        {/* Text preview */}
        <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: '#52525b' }}>
          {memory.rawText}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {memory.people.map((person) => (
            <span
              key={person}
              className="neon-tag-cyan rounded-sm px-2 py-0.5 font-mono text-[9px] tracking-wide"
            >
              {person}
            </span>
          ))}
          {memory.tasks.map((task) => (
            <span
              key={task}
              className="neon-tag-amber rounded-sm px-2 py-0.5 font-mono text-[9px] tracking-wide flex items-center gap-1"
            >
              <CheckSquare className="size-2" />
              {task}
            </span>
          ))}
          {memory.topics.map((topic) => (
            <span
              key={topic}
              className="neon-tag-purple rounded-sm px-2 py-0.5 font-mono text-[9px] tracking-wide"
            >
              {topic}
            </span>
          ))}
          {memory.decisions.map((decision) => (
            <span
              key={decision}
              className="neon-tag-pink rounded-sm px-2 py-0.5 font-mono text-[9px] tracking-wide"
            >
              {decision}
            </span>
          ))}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5">
          <Clock className="size-2.5" style={{ color: '#3f3f46' }} />
          <span className="font-mono text-[10px] tracking-wide" style={{ color: '#3f3f46' }}>{timestamp}</span>
        </div>
      </div>
    </div>
  );
}

function MemorySkeletonCard() {
  return (
    <div className="rounded-md p-4 space-y-3" style={{ border: '1px solid #3f3f46', background: '#27272a' }}>
      <div className="flex items-start justify-between">
        <div className="h-3 rounded-sm animate-pulse" style={{ width: '60%', background: '#3f3f46' }} />
        <div className="h-3 w-10 rounded-sm animate-pulse" style={{ background: '#3f3f46' }} />
      </div>
      <div className="h-2.5 rounded-sm animate-pulse" style={{ width: '100%', background: '#52525b' }} />
      <div className="h-2.5 rounded-sm animate-pulse" style={{ width: '80%', background: '#52525b' }} />
      <div className="flex gap-1.5">
        <div className="h-3.5 w-12 rounded-sm animate-pulse" style={{ background: '#3f3f46' }} />
        <div className="h-3.5 w-16 rounded-sm animate-pulse" style={{ background: '#3f3f46' }} />
        <div className="h-3.5 w-14 rounded-sm animate-pulse" style={{ background: '#3f3f46' }} />
      </div>
      <div className="h-2.5 w-16 rounded-sm animate-pulse" style={{ background: '#52525b' }} />
    </div>
  );
}

export default function MemoryList() {
  const memories = useQuery(api.memories.list);

  console.log("[MemoryList] Memories query state:", {
    isLoading: memories === undefined,
    count: memories?.length ?? 0,
  });

  const isLoading = memories === undefined;

  return (
    <div className="neon-card rounded-md overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #3f3f46' }}>
        <div className="flex items-center gap-2.5">
          <Database className="size-4" style={{ color: '#a855f7' }} />
          <h2 className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: '#a855f7', textShadow: '0 0 10px rgba(168, 85, 247, 0.4)' }}>
            Memory Archive
          </h2>
        </div>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: '#3f3f46' }}>
          {isLoading ? "[ Loading ]" : `[ ${memories.length} nodes ]`}
        </span>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <MemorySkeletonCard key={i} />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-md mb-5 box-glow-cyan" style={{ border: '1px solid rgba(14, 231, 231, 0.2)', background: 'rgba(14, 231, 231, 0.04)' }}>
              <Database className="size-7" style={{ color: '#3f3f46' }} />
            </div>
            <h3 className="font-mono text-sm font-semibold tracking-wide mb-2" style={{ color: '#d4d4d8' }}>
              No memory nodes detected
            </h3>
            <p className="font-mono text-[11px] max-w-xs tracking-wide" style={{ color: '#3f3f46' }}>
              Begin capturing neural inputs to populate the memory archive.
            </p>
          </div>
        ) : (
          <div className={cn("grid gap-3", memories.length > 1 && "sm:grid-cols-2")}>
            {memories.map((memory, i) => (
              <MemoryCard key={memory._id} memory={memory} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
