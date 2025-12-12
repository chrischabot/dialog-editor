"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Download,
  Loader2,
  Volume2,
  Sparkles,
} from "lucide-react";

interface PreviewPaneProps {
  audioUrl: string | null;
  isGenerating: boolean;
  selectedLineId: string | null;
  characterCount: number;
  onGenerateLine: () => void;
  onGenerateAll: () => void;
  onDownload: () => void;
}

export function PreviewPane({
  audioUrl,
  isGenerating,
  selectedLineId,
  characterCount,
  onGenerateLine,
  onGenerateAll,
  onDownload,
}: PreviewPaneProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize audio element when audioUrl changes
  useEffect(() => {
    if (!audioUrl) {
      audioRef.current = null;
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSeekStart = () => {
    isSeekingRef.current = true;
  };

  const handleSeekEnd = () => {
    isSeekingRef.current = false;
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const estimatedCost = (characterCount * 0.00003).toFixed(4);
  const isHighCharacterCount = characterCount > 10000;
  const hasLines = characterCount > 0;

  return (
    <div className="h-20 border-t border-gray-alpha-200 bg-gray-alpha-50 flex items-center px-6 gap-6">
      {/* Left: Audio Player */}
      <div className="flex items-center gap-3 min-w-[300px]">
        {audioUrl ? (
          <>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={togglePlayPause}
              className="flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1 flex items-center gap-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                onPointerDown={handleSeekStart}
                onPointerUp={handleSeekEnd}
                className="flex-1"
              />
            </div>

            <div className="text-xs text-gray-600 tabular-nums flex-shrink-0 w-20 text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <Volume2 className="h-4 w-4" />
            <span className="text-xs">No audio loaded</span>
          </div>
        )}
      </div>

      {/* Center: Status */}
      <div className="flex-1 flex items-center justify-center gap-2">
        {isGenerating ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating audio...</span>
          </div>
        ) : audioUrl ? (
          <div className="flex items-center gap-2">
            <Badge variant="success">Audio ready</Badge>
            <span className="text-xs text-gray-600">
              Duration: {formatTime(duration)}
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Click Generate to create audio
          </div>
        )}
      </div>

      {/* Right: Actions and Info */}
      <div className="flex items-center gap-3">
        {/* Character count and cost estimate */}
        <div className="flex items-center gap-2">
          <Badge
            variant={isHighCharacterCount ? "warning" : "secondary"}
            className="tabular-nums"
          >
            {characterCount.toLocaleString()} chars
          </Badge>
          <span className="text-xs text-gray-500">
            ~${estimatedCost}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onGenerateLine}
            disabled={!selectedLineId || isGenerating}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Generate Line
          </Button>

          <Button
            size="sm"
            onClick={onGenerateAll}
            disabled={!hasLines || isGenerating}
            loading={isGenerating}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Generate All
          </Button>

          {audioUrl && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onDownload}
              disabled={isGenerating}
              title="Download audio"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
