"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const addMemory = useAction(api.memories.addMemory);

  const startRecording = useCallback(async () => {
    console.log("[VoiceRecorder] Starting recording...");
    try {
      console.log("[VoiceRecorder] Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[VoiceRecorder] Microphone access granted");

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      console.log("[VoiceRecorder] MediaRecorder created with mimeType:", mediaRecorder.mimeType);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log("[VoiceRecorder] Audio chunk received, size:", event.data.size);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        console.log("[VoiceRecorder] Recording stopped, total blob size:", audioBlob.size);
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      console.log("[VoiceRecorder] Recording started");
    } catch (error) {
      console.error("[VoiceRecorder] Failed to start recording:", error);
      alert("Could not access microphone. Please grant permission.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log("[VoiceRecorder] Stop recording requested");
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("[VoiceRecorder] Recording stopped");
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    console.log("[VoiceRecorder] Processing audio, blob size:", audioBlob.size);
    setIsProcessing(true);
    try {
      // Send to smallest.ai for transcription
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      console.log("[VoiceRecorder] Sending to /api/transcribe...");
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      console.log("[VoiceRecorder] Transcribe response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[VoiceRecorder] Transcription failed:", errorText);
        throw new Error("Transcription failed");
      }

      const { text } = await response.json();
      console.log("[VoiceRecorder] Transcription result:", text);

      if (text && text.trim()) {
        console.log("[VoiceRecorder] Adding voice memory to Convex...");
        await addMemory({ rawText: text, source: "voice" });
        console.log("[VoiceRecorder] Voice memory added successfully");
      } else {
        console.warn("[VoiceRecorder] Empty transcription received");
      }
    } catch (error) {
      console.error("[VoiceRecorder] Failed to process audio:", error);
      alert("Failed to process audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    console.log("[VoiceRecorder] Submitting text memory:", textInput);
    setIsProcessing(true);
    try {
      console.log("[VoiceRecorder] Calling addMemory action...");
      await addMemory({ rawText: textInput, source: "text" });
      console.log("[VoiceRecorder] Text memory added successfully");
      setTextInput("");
    } catch (error) {
      console.error("[VoiceRecorder] Failed to add memory:", error);
      alert("Failed to add memory. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Add Memory</h2>

      {/* Voice Recording Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isProcessing ? (
            <svg
              className="w-8 h-8 text-white animate-spin"
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
          ) : isRecording ? (
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-center text-gray-600 mb-6">
        {isRecording
          ? "Recording... Click to stop"
          : isProcessing
          ? "Processing..."
          : "Click to record a memory"}
      </p>

      {/* Text Input Fallback */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-500 mb-2">Or type a memory:</p>
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your memory here..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !textInput.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
