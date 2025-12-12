"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Speaker, ElevenLabsVoice } from "@/types/dialogue";

// Speaker colors preset
const SPEAKER_COLOR_PRESETS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

export interface SpeakerFormValues {
  name: string;
  voiceId: string;
  color: string;
}

interface SpeakerEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speaker: Speaker | null;
  voices: ElevenLabsVoice[];
  canRemove: boolean;
  onSubmit: (values: SpeakerFormValues) => void;
  onRemove?: () => void;
}

/**
 * Dialog for creating and editing speakers
 * Returns form values via onSubmit - container handles success/error toasts
 */
export function SpeakerEditDialog({
  open,
  onOpenChange,
  speaker,
  voices,
  canRemove,
  onSubmit,
  onRemove,
}: SpeakerEditDialogProps) {
  const [name, setName] = React.useState(speaker?.name || "");
  const [voiceId, setVoiceId] = React.useState(speaker?.voiceId || "");
  const [color, setColor] = React.useState(speaker?.color || SPEAKER_COLOR_PRESETS[0]);
  const [errors, setErrors] = React.useState<{ name?: string; voiceId?: string }>({});

  React.useEffect(() => {
    if (speaker) {
      setName(speaker.name);
      setVoiceId(speaker.voiceId);
      setColor(speaker.color);
    } else {
      // Reset for new speaker
      setName("");
      setVoiceId("");
      setColor(SPEAKER_COLOR_PRESETS[0]);
    }
    setErrors({});
  }, [speaker, open]);

  const handleSubmit = () => {
    const newErrors: { name?: string; voiceId?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Speaker name is required";
    }
    if (!voiceId) {
      newErrors.voiceId = "Voice selection is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ name: name.trim(), voiceId, color });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{speaker ? "Edit Speaker" : "Add Speaker"}</DialogTitle>
          <DialogDescription>
            Configure the speaker&apos;s name, voice, and color indicator.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Speaker name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select
              value={voiceId}
              onValueChange={(value) => {
                setVoiceId(value);
                if (errors.voiceId) setErrors((prev) => ({ ...prev, voiceId: undefined }));
              }}
            >
              <SelectTrigger className={errors.voiceId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a voice..." />
              </SelectTrigger>
              <SelectContent>
                {voices.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">No voices available</div>
                ) : (
                  voices.map((voice) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.voiceId && (
              <p className="text-xs text-red-500">{errors.voiceId}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {SPEAKER_COLOR_PRESETS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    color === presetColor
                      ? "border-foreground scale-110"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            {speaker && canRemove && onRemove && (
              <Button variant="destructive" onClick={onRemove}>
                Remove Speaker
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { SPEAKER_COLOR_PRESETS };
