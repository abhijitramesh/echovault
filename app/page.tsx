import VoiceRecorder from "@/components/VoiceRecorder";
import MemoryList from "@/components/MemoryList";
import SearchChat from "@/components/SearchChat";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Personal Memory Engine
          </h1>
          <p className="text-gray-600 mt-1">
            Record, store, and search your memories with AI
          </p>
        </header>

        <div className="grid gap-6">
          {/* Voice/Text Input */}
          <VoiceRecorder />

          {/* Search & Chat */}
          <SearchChat />

          {/* Memory List */}
          <MemoryList />
        </div>
      </div>
    </div>
  );
}
