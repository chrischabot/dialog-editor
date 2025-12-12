"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogueLineCard } from "./DialogueLineCard";
import type { Dialogue, Speaker } from "@/types/dialogue";

interface ScriptPanelProps {
  dialogue: Dialogue;
  selectedLineId: string | null;
  generatingLineId: string | null;
  isGenerating: boolean;
  disabled: boolean;
  onSelectLine: (lineId: string) => void;
  onUpdateLine: (lineId: string, text: string) => void;
  onChangeLineSpeaker: (lineId: string, speakerId: string) => void;
  onGenerateLine: (lineId: string) => void;
  onDeleteLine: (lineId: string) => void;
  onAddLine: () => void;
  onCursorChange?: (lineId: string, position: number) => void;
}

/**
 * Center panel showing the dialogue script with editable lines
 */
export function ScriptPanel({
  dialogue,
  selectedLineId,
  generatingLineId,
  isGenerating,
  disabled,
  onSelectLine,
  onUpdateLine,
  onChangeLineSpeaker,
  onGenerateLine,
  onDeleteLine,
  onAddLine,
  onCursorChange,
}: ScriptPanelProps) {
  const getSpeakerForLine = (speakerId: string): Speaker | null => {
    return dialogue.speakers.find((s) => s.id === speakerId) || null;
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-alpha-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Script</h2>
          <span className="text-xs text-gray-400">
            {dialogue.lines.length} {dialogue.lines.length === 1 ? "line" : "lines"}
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3 max-w-3xl mx-auto pt-1">
          {dialogue.lines.map((line) => (
            <DialogueLineCard
              key={line.id}
              line={line}
              speaker={getSpeakerForLine(line.speakerId)}
              speakers={dialogue.speakers}
              isSelected={selectedLineId === line.id}
              isGenerating={generatingLineId === line.id}
              disabled={disabled}
              onSelect={() => onSelectLine(line.id)}
              onTextChange={(text) => onUpdateLine(line.id, text)}
              onSpeakerChange={(speakerId) => onChangeLineSpeaker(line.id, speakerId)}
              onGenerate={() => onGenerateLine(line.id)}
              onDelete={() => onDeleteLine(line.id)}
              onCursorChange={(position) => onCursorChange?.(line.id, position)}
            />
          ))}
          <Button
            variant="secondary"
            onClick={onAddLine}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add line
          </Button>
        </div>
      </ScrollArea>
    </main>
  );
}
