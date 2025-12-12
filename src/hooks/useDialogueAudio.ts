"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  initializeClient,
  isClientInitialized,
  generateDialogue,
  generateLinePreview,
  generateSpeech,
} from "@/lib/elevenlabs/client";
import {
  getCachedAudio,
  setCachedAudio,
  cleanupExpiredCache,
} from "@/lib/audioCache";
import { makeDialogueAudioCacheKey, makeLineAudioCacheKey } from "@/lib/audioCacheKeys";
import { stripAudioTags, toDialogueTurns, getSpeakerForLine } from "@/lib/dialogue";
import type { Dialogue } from "@/types/dialogue";

interface UseDialogueAudioOptions {
  apiKey: string | null;
  dialogue: Dialogue | null;
  modelMode: "fast" | "full";
  onAutoPlay?: (audioRef: React.RefObject<HTMLAudioElement | null>) => void;
}

interface UseDialogueAudioResult {
  // State
  isGenerating: boolean;
  generatingLineId: string | null;
  audioUrl: string | null;
  generatedAudio: Blob | null;
  isDialogueCached: boolean;

  // Actions
  generateLine: (lineId: string) => Promise<void>;
  generateAll: () => Promise<void>;
  downloadAudio: (filename: string) => void;

  // Refs
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

/**
 * Hook for managing audio generation, caching, and playback
 * Encapsulates all the complex audio lifecycle logic
 */
export function useDialogueAudio({
  apiKey,
  dialogue,
  modelMode,
  onAutoPlay,
}: UseDialogueAudioOptions): UseDialogueAudioResult {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatingLineId, setGeneratingLineId] = React.useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [isDialogueCached, setIsDialogueCached] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Cleanup expired cache entries on mount
  React.useEffect(() => {
    cleanupExpiredCache().then((deleted) => {
      if (deleted > 0) {
        console.log(`Cleaned up ${deleted} expired audio cache entries`);
      }
    });
  }, []);

  // Cleanup audio URL on unmount
  React.useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Check if full dialogue is cached
  React.useEffect(() => {
    async function checkCache() {
      if (!dialogue || dialogue.lines.length === 0) {
        setIsDialogueCached(false);
        return;
      }
      const modelId = "eleven_v3";
      const turns = toDialogueTurns(dialogue);
      const cacheKey = await makeDialogueAudioCacheKey({ turns, modelId });
      const cached = await getCachedAudio(cacheKey);
      setIsDialogueCached(cached !== null);
    }
    checkCache();
  }, [dialogue]);

  // Helper to set audio and auto-play
  const setAudioWithAutoPlay = React.useCallback((blob: Blob, delay: number = 50) => {
    setGeneratedAudio(blob);

    // Revoke old URL and create new one
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);

    // Auto-play
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.warn("Auto-play failed:", err);
        });
      }
      onAutoPlay?.(audioRef);
    }, delay);
  }, [audioUrl, onAutoPlay]);

  // Generate a single line
  const generateLine = React.useCallback(async (lineId: string) => {
    if (!apiKey) {
      toast.error("Set your API key first");
      return;
    }

    if (!dialogue) {
      toast.error("No dialogue loaded");
      return;
    }

    const line = dialogue.lines.find((l) => l.id === lineId);
    if (!line || !line.text.trim()) {
      toast.error("Line has no text");
      return;
    }

    const speaker = getSpeakerForLine(dialogue, lineId);
    if (!speaker?.voiceId) {
      toast.error("Speaker has no voice assigned");
      return;
    }

    const modelId = modelMode === "fast" ? "eleven_flash_v2_5" : "eleven_v3";

    // For Fast mode, strip audio tags since regular TTS doesn't support them
    const textToGenerate = modelMode === "fast" ? stripAudioTags(line.text) : line.text;

    if (modelMode === "fast" && !textToGenerate.trim()) {
      toast.error("Line only contains audio tags - no text to generate");
      return;
    }

    const cacheKey = await makeLineAudioCacheKey({
      text: textToGenerate,
      voiceId: speaker.voiceId,
      modelId,
    });

    // Check cache first
    const cachedBlob = await getCachedAudio(cacheKey);
    if (cachedBlob) {
      setAudioWithAutoPlay(cachedBlob);
      toast.success("Playing cached audio");
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratingLineId(lineId);

      if (!isClientInitialized()) {
        initializeClient(apiKey);
      }

      // Fast mode uses regular TTS, Full uses Dialogue API
      const audio = modelMode === "fast"
        ? await generateSpeech(textToGenerate, speaker.voiceId, { modelId })
        : await generateLinePreview(textToGenerate, speaker.voiceId, { modelId });

      // Cache the audio
      void setCachedAudio(cacheKey, audio);

      setAudioWithAutoPlay(audio, 100);
      toast.success("Line generated successfully");
    } catch (error) {
      console.error("Failed to generate line:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate audio";
      toast.error("Generation failed", {
        description: errorMessage,
        duration: Infinity,
        closeButton: true,
      });
    } finally {
      setIsGenerating(false);
      setGeneratingLineId(null);
    }
  }, [apiKey, dialogue, modelMode, setAudioWithAutoPlay]);

  // Generate full dialogue
  const generateAll = React.useCallback(async () => {
    if (!apiKey) {
      toast.error("Set your API key first");
      return;
    }

    if (!dialogue || dialogue.lines.length === 0) {
      toast.error("Add some dialogue lines first");
      return;
    }

    // Validate all lines
    for (const line of dialogue.lines) {
      if (!line.text.trim()) {
        toast.error("All lines must have text");
        return;
      }
      const speaker = dialogue.speakers.find((s) => s.id === line.speakerId);
      if (!speaker?.voiceId) {
        toast.error(`Speaker "${speaker?.name || 'Unknown'}" has no voice assigned`);
        return;
      }
    }

    // Always use Dialogue API with eleven_v3 for natural conversation flow
    const modelId = "eleven_v3";
    const turns = toDialogueTurns(dialogue);
    const cacheKey = await makeDialogueAudioCacheKey({ turns, modelId });

    if (modelMode === "fast") {
      toast.info("Using Full quality for dialogue (natural conversation flow)");
    }

    // Check cache first
    const cachedBlob = await getCachedAudio(cacheKey);
    if (cachedBlob) {
      setAudioWithAutoPlay(cachedBlob);
      toast.success("Playing cached dialogue");
      return;
    }

    try {
      setIsGenerating(true);

      if (!isClientInitialized()) {
        initializeClient(apiKey);
      }

      const inputs = dialogue.lines.map((line) => {
        const speaker = dialogue.speakers.find((s) => s.id === line.speakerId);
        return {
          text: line.text,
          voiceId: speaker!.voiceId,
        };
      });

      const audio = await generateDialogue(inputs, { modelId });

      // Cache the audio
      void setCachedAudio(cacheKey, audio);
      setIsDialogueCached(true);

      setAudioWithAutoPlay(audio, 100);
      toast.success("Dialogue generated successfully");
    } catch (error) {
      console.error("Failed to generate dialogue:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate audio";
      toast.error("Generation failed", {
        description: errorMessage,
        duration: Infinity,
        closeButton: true,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, dialogue, modelMode, setAudioWithAutoPlay]);

  // Download the generated audio
  const downloadAudio = React.useCallback((filename: string) => {
    if (!generatedAudio || !audioUrl) {
      toast.error("No audio to download");
      return;
    }

    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${filename.replace(/[^a-z0-9]/gi, "_")}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Audio downloaded");
  }, [generatedAudio, audioUrl]);

  return {
    isGenerating,
    generatingLineId,
    audioUrl,
    generatedAudio,
    isDialogueCached,
    generateLine,
    generateAll,
    downloadAudio,
    audioRef,
  };
}
