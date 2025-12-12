import type { Dialogue, DialogueLine, Speaker } from "@/types/dialogue";

/**
 * Turn structure for ElevenLabs Dialogue API
 */
export interface DialogueTurn {
  text: string;
  voiceId: string;
}

/**
 * Convert a dialogue into the turns format expected by ElevenLabs API
 * This is used both for cache key generation and API payload creation
 */
export function toDialogueTurns(dialogue: Dialogue): DialogueTurn[] {
  return dialogue.lines.map((line: DialogueLine) => {
    const speaker = dialogue.speakers.find((s: Speaker) => s.id === line.speakerId);
    return {
      text: line.text,
      voiceId: speaker?.voiceId ?? "",
    };
  });
}

/**
 * Get speaker for a specific line
 */
export function getSpeakerForLine(
  dialogue: Dialogue,
  lineId: string
): Speaker | null {
  const line = dialogue.lines.find((l) => l.id === lineId);
  if (!line) return null;
  return dialogue.speakers.find((s) => s.id === line.speakerId) || null;
}
