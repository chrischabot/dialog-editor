"use client";

import * as React from "react";
import { Plus, Play, Trash2 } from "lucide-react";
import { Speaker, ElevenLabsVoice, DEFAULT_SPEAKER_COLORS } from "@/types/dialogue";
import {
  StackedList,
  StackedListItem,
  StackedListAddButton,
} from "@/components/ui/stacked-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SpeakerPanelProps {
  speakers: Speaker[];
  voices: ElevenLabsVoice[];
  onAddSpeaker: (name: string, voiceId: string, color: string) => void;
  onUpdateSpeaker: (id: string, updates: Partial<Speaker>) => void;
  onRemoveSpeaker: (id: string) => void;
}

export function SpeakerPanel({
  speakers,
  voices,
  onAddSpeaker,
  onUpdateSpeaker,
  onRemoveSpeaker,
}: SpeakerPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSpeaker, setEditingSpeaker] = React.useState<Speaker | null>(null);
  const [speakerName, setSpeakerName] = React.useState("");
  const [selectedVoiceId, setSelectedVoiceId] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState<string>(DEFAULT_SPEAKER_COLORS[0]);

  // Get voice name from ID
  const getVoiceName = (voiceId: string) => {
    const voice = voices.find((v) => v.voice_id === voiceId);
    return voice?.name || "Unknown Voice";
  };

  // Get voice preview URL
  const getVoicePreviewUrl = (voiceId: string) => {
    const voice = voices.find((v) => v.voice_id === voiceId);
    return voice?.preview_url;
  };

  // Open dialog for adding a new speaker
  const handleAddClick = () => {
    setEditingSpeaker(null);
    setSpeakerName("");
    setSelectedVoiceId(voices[0]?.voice_id || "");
    // Find an unused color
    const usedColors = new Set(speakers.map((s) => s.color));
    const availableColor = DEFAULT_SPEAKER_COLORS.find((c) => !usedColors.has(c));
    setSelectedColor((availableColor || DEFAULT_SPEAKER_COLORS[0]) as string);
    setIsDialogOpen(true);
  };

  // Open dialog for editing a speaker
  const handleEditClick = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setSpeakerName(speaker.name);
    setSelectedVoiceId(speaker.voiceId);
    setSelectedColor(speaker.color);
    setIsDialogOpen(true);
  };

  // Save speaker (add or update)
  const handleSave = () => {
    if (!speakerName.trim() || !selectedVoiceId) return;

    if (editingSpeaker) {
      // Update existing speaker
      onUpdateSpeaker(editingSpeaker.id, {
        name: speakerName.trim(),
        voiceId: selectedVoiceId,
        color: selectedColor,
      });
    } else {
      // Add new speaker
      onAddSpeaker(speakerName.trim(), selectedVoiceId, selectedColor);
    }

    setIsDialogOpen(false);
  };

  // Remove speaker
  const handleRemove = () => {
    if (editingSpeaker && speakers.length > 1) {
      onRemoveSpeaker(editingSpeaker.id);
      setIsDialogOpen(false);
    }
  };

  // Play voice preview
  const handlePlayPreview = () => {
    const previewUrl = getVoicePreviewUrl(selectedVoiceId);
    if (previewUrl) {
      const audio = new Audio(previewUrl);
      audio.play();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-sm font-semibold text-foreground">Speakers</h3>
        <Badge variant="secondary">{speakers.length}</Badge>
      </div>

      {/* Speaker List */}
      <StackedList>
        {speakers.map((speaker) => (
          <StackedListItem
            key={speaker.id}
            icon={
              <div
                className="w-4 h-4 rounded-full shrink-0 ml-1 mr-2"
                style={{ backgroundColor: speaker.color }}
              />
            }
            onClick={() => handleEditClick(speaker)}
          >
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground line-clamp-1">
                {speaker.name}
              </span>
              <span className="text-xs text-gray-500 line-clamp-1">
                {getVoiceName(speaker.voiceId)}
              </span>
            </div>
          </StackedListItem>
        ))}

        {/* Add Speaker Button */}
        <StackedListAddButton
          icon={<Plus className="w-4 h-4 mr-2 ml-1" />}
          onClick={handleAddClick}
        >
          Add speaker
        </StackedListAddButton>
      </StackedList>

      {/* Edit/Add Speaker Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSpeaker ? "Edit Speaker" : "Add Speaker"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="speaker-name">Name</Label>
              <Input
                id="speaker-name"
                placeholder="Speaker name"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Voice Selector */}
            <div className="grid gap-2">
              <Label htmlFor="speaker-voice">Voice</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedVoiceId}
                  onValueChange={setSelectedVoiceId}
                >
                  <SelectTrigger id="speaker-voice" className="flex-1">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={handlePlayPreview}
                  disabled={!getVoicePreviewUrl(selectedVoiceId)}
                  title="Preview voice"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Color Picker */}
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_SPEAKER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    style={{
                      backgroundColor: color,
                      border:
                        selectedColor === color
                          ? "3px solid currentColor"
                          : "3px solid transparent",
                    }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            {/* Remove Speaker Button (only for editing, only if more than 1 speaker) */}
            {editingSpeaker && speakers.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                className="w-full sm:w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Speaker
              </Button>
            )}

            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!speakerName.trim() || !selectedVoiceId}
                className="flex-1"
              >
                {editingSpeaker ? "Save" : "Add"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
