"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  StackedList,
  StackedListItem,
  StackedListAddButton,
} from "@/components/ui/stacked-list";
import type { Speaker, ElevenLabsVoice } from "@/types/dialogue";

interface SpeakersPanelProps {
  speakers: Speaker[];
  voices: ElevenLabsVoice[];
  onEditSpeaker: (speaker: Speaker) => void;
  onAddSpeaker: () => void;
}

/**
 * Left sidebar panel showing the list of speakers
 */
export function SpeakersPanel({
  speakers,
  voices,
  onEditSpeaker,
  onAddSpeaker,
}: SpeakersPanelProps) {
  return (
    <aside className="w-[280px] border-r border-gray-alpha-200 bg-background flex flex-col">
      <div className="p-4 border-b border-gray-alpha-200">
        <h2 className="text-sm font-medium text-gray-500">Speakers</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <StackedList>
          {speakers.map((speaker) => (
            <StackedListItem
              key={speaker.id}
              onClick={() => onEditSpeaker(speaker)}
              icon={
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: speaker.color }}
                />
              }
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium truncate">{speaker.name}</span>
                <span className="text-xs text-gray-500 truncate">
                  {voices.find((v) => v.voice_id === speaker.voiceId)?.name || "Voice"}
                </span>
              </div>
            </StackedListItem>
          ))}
          <StackedListAddButton
            onClick={onAddSpeaker}
            icon={<Plus className="h-4 w-4 text-gray-400" />}
          >
            Add speaker
          </StackedListAddButton>
        </StackedList>
      </ScrollArea>
    </aside>
  );
}
