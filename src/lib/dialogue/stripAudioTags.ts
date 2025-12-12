/**
 * Strip audio tags from text
 * Audio tags like [excited], [whispers], [laughs], etc. are only supported by the Dialogue API
 * Regular TTS (Fast mode) doesn't support them, so we need to strip them
 */
export function stripAudioTags(text: string): string {
  return text
    .replace(/\[[\w\s-]+\]/g, "") // Remove opening tags like [excited]
    .replace(/\[\/[\w\s-]+\]/g, "") // Remove closing tags like [/excited]
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
}
