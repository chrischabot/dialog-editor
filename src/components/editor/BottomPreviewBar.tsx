"use client";

import * as React from "react";
import { Play, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomPreviewBarProps {
  audioUrl: string | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isGenerating: boolean;
  hasAudio: boolean;
  hasSelectedLine: boolean;
  hasLines: boolean;
  isDialogueCached: boolean;
  disabled: boolean;
  onDownload: () => void;
  onGenerateLine: () => void;
  onGenerateAll: () => void;
}

/**
 * Bottom bar with audio player and generation controls
 */
export function BottomPreviewBar({
  audioUrl,
  audioRef,
  isGenerating,
  hasAudio,
  hasSelectedLine,
  hasLines,
  isDialogueCached,
  disabled,
  onDownload,
  onGenerateLine,
  onGenerateAll,
}: BottomPreviewBarProps) {
  return (
    <div className="border-t border-gray-alpha-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {/* Left: Audio player */}
        <div className="flex items-center gap-3 flex-1">
          {audioUrl ? (
            <audio ref={audioRef} controls src={audioUrl} className="h-10 flex-1 max-w-md" />
          ) : (
            <div className="flex-1 text-sm text-gray-500">
              {isGenerating ? "Generating audio..." : "Generate audio to preview"}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={onDownload}
            disabled={!hasAudio || isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="secondary"
            onClick={onGenerateLine}
            disabled={isGenerating || !hasSelectedLine || disabled}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Generate Line
          </Button>
          <Button
            onClick={onGenerateAll}
            disabled={isGenerating || !hasLines || disabled}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isDialogueCached ? "Play All" : "Generate All"}
          </Button>
        </div>
      </div>
    </div>
  );
}
