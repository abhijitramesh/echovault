import VoiceRecorder from "@/components/VoiceRecorder";
import MemoryList from "@/components/MemoryList";
import SearchChat from "@/components/SearchChat";
import { Hexagon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen cyber-grid scanlines relative">
      {/* Ambient neon glow blobs */}
      <div className="fixed top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none" style={{ background: 'rgba(14, 231, 231, 0.06)' }} />
      <div className="fixed bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none" style={{ background: 'rgba(255, 45, 123, 0.05)' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] pointer-events-none" style={{ background: 'rgba(168, 85, 247, 0.03)' }} />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b sticky top-0 z-20" style={{ borderColor: '#3f3f46', background: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(20px)' }}>
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-md box-glow-cyan" style={{ border: '1px solid rgba(14, 231, 231, 0.3)', background: 'rgba(14, 231, 231, 0.06)' }}>
                <Hexagon className="size-5" style={{ color: '#0ee7e7' }} />
              </div>
              <div>
                <h1 className="font-mono text-sm font-bold tracking-[0.25em] uppercase glow-cyan flicker" style={{ color: '#0ee7e7' }}>
                  EchoVault
                </h1>
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: '#71717a' }}>
                  Neural Memory Interface v2.1
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: '#71717a' }}>
                <span>Sys:</span>
                <span className="glow-cyan-subtle" style={{ color: '#0ee7e7' }}>Nominal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full status-dot" style={{ background: '#0ee7e7' }} />
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase glow-cyan-subtle" style={{ color: '#0ee7e7' }}>Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-3xl px-4 py-8 flex flex-col gap-8 pb-20">
          <VoiceRecorder />
          <SearchChat />
          <MemoryList />
        </main>

        {/* Footer */}
        <footer className="border-t" style={{ borderColor: '#3f3f46', background: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: '#3f3f46' }}>
            <span>EchoVault Neural Engine</span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#0ee7e7', boxShadow: '0 0 6px #0ee7e7' }} />
              Encryption: AES-256
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
