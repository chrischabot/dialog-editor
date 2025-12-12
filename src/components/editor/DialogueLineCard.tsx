"use client";

import * as React from "react";
import { Play, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DialogueLine, Speaker } from "@/types/dialogue";

interface DialogueLineCardProps {
  line: DialogueLine;
  speaker: Speaker | null;
  speakers: Speaker[];
  isSelected: boolean;
  isGenerating: boolean;
  disabled: boolean;
  onSelect: () => void;
  onTextChange: (text: string) => void;
  onSpeakerChange: (speakerId: string) => void;
  onGenerate: () => void;
  onDelete: () => void;
  onCursorChange?: (position: number) => void;
}

/**
 * A single dialogue line card with speaker selector, text input,
 * and action buttons for preview and delete
 */
export function DialogueLineCard({
  line,
  speaker,
  speakers,
  isSelected,
  isGenerating,
  disabled,
  onSelect,
  onTextChange,
  onSpeakerChange,
  onGenerate,
  onDelete,
  onCursorChange,
}: DialogueLineCardProps) {
  const handleCursorChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    onCursorChange?.(target.selectionStart ?? target.value.length);
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative rounded-2xl border bg-background p-4 transition-all cursor-pointer",
        isSelected
          ? "border-foreground ring-1 ring-foreground"
          : "border-gray-alpha-200 hover:border-gray-alpha-300"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-6 w-6 rounded-full shrink-0 mt-1"
          style={{ backgroundColor: speaker?.color ?? "#9ca3af" }}
        />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <Select
              value={line.speakerId}
              onValueChange={onSpeakerChange}
            >
              <SelectTrigger
                className="h-auto w-auto border-0 bg-transparent p-0 text-sm font-medium shadow-none focus:ring-0 hover:bg-gray-alpha-100 rounded px-1.5 py-0.5 -ml-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue>
                  {speaker?.name || "Select speaker"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {speakers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={line.text}
            onChange={(e) => {
              onTextChange(e.target.value);
              handleCursorChange(e);
            }}
            placeholder="Enter dialogue line..."
            className="min-h-[80px] resize-none border-0 rounded-none focus:border-0 focus:ring-0 focus-visible:ring-0 bg-transparent p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleCursorChange(e);
            }}
            onKeyUp={handleCursorChange}
            onSelect={handleCursorChange}
            onFocus={(e) => {
              onSelect();
              handleCursorChange(e);
            }}
          />
        </div>
        <div className={cn(
          "flex gap-1 transition-opacity",
          isGenerating ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerate();
                }}
                disabled={isGenerating || disabled}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview line</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete line</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
