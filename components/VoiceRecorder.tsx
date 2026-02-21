"use client";

import { useState, useRef, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Mic, Plus, Loader2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const handleRecord = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleAddMemory = useCallback(async () => {
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
  }, [textInput, addMemory]);

  return (
    <div className="neon-card rounded-md overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #3f3f46' }}>
        <div className="flex items-center gap-2.5">
          <Radio className="size-4" style={{ color: '#0ee7e7' }} />
          <h2 className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase glow-cyan-subtle" style={{ color: '#0ee7e7' }}>
            Memory Capture
          </h2>
        </div>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: isRecording ? '#ff2d55' : isProcessing ? '#eab308' : '#3f3f46' }}>
          {isRecording ? "[ REC ]" : isProcessing ? "[ Encoding ]" : "[ Standby ]"}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div className="relative">
          <textarea
            placeholder="> enter neural input stream_"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isProcessing}
            className="neon-input w-full min-h-32 resize-none rounded-md px-4 py-3 font-mono text-sm leading-relaxed"
            style={{ background: '#1f1f23' }}
          />
          {isRecording && (
            <div className="absolute bottom-3 left-4 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: '#ff2d55' }} />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: '#ff2d55' }} />
                </span>
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase glow-pink" style={{ color: '#ff2d7b' }}>
                  Recording
                </span>
              </div>
              {/* Waveform */}
              <div className="flex items-center gap-[3px]">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[2px] rounded-full"
                    style={{
                      height: '3px',
                      background: '#0ee7e7',
                      boxShadow: '0 0 4px #0ee7e7',
                      animation: `wave-bar ${0.3 + Math.random() * 0.5}s ease-in-out ${i * 0.04}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRecord}
            disabled={isProcessing}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-md h-11 font-mono text-[11px] font-semibold tracking-[0.15em] uppercase transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
              isRecording ? "cyber-btn-pink" : "cyber-btn"
            )}
          >
            <Mic className={cn("size-3.5", isRecording && "animate-pulse")} />
            {isRecording ? "Terminate" : "Voice Input"}
          </button>
          <button
            onClick={handleAddMemory}
            disabled={!textInput.trim() || isProcessing}
            className="flex-1 flex items-center justify-center gap-2 rounded-md h-11 font-mono text-[11px] font-semibold tracking-[0.15em] uppercase transition-all cursor-pointer cyber-btn disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Encoding...
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                Store Memory
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
