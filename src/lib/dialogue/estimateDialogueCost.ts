import type { Dialogue, DialogueLine } from "@/types/dialogue";

/**
 * Cost estimation result
 */
export interface DialogueCostEstimate {
  characterCount: number;
  estimatedCredits: number;
  creditsPerChar: number;
}

/**
 * Calculate character count for a dialogue, excluding audio tags
 * Audio tags don't count toward credits - they're instructions, not content
 */
export function calculateCharacterCount(lines: DialogueLine[]): number {
  return lines.reduce((acc: number, line: DialogueLine) => {
    // Remove audio tags from character count (they don't count toward credits)
    const plainText = line.text
      .replace(/\[[\w\s-]+\]/g, "")
      .replace(/\[\/[\w\s-]+\]/g, "");
    return acc + plainText.length;
  }, 0);
}

/**
 * Estimate the cost of generating a dialogue
 *
 * Credit costs per character:
 * - eleven_v3 (Full): 1 credit per character
 * - eleven_flash_v2_5 (Fast): 0.5 credits per character
 */
export function estimateDialogueCost(
  dialogue: Dialogue,
  modelMode: "fast" | "full"
): DialogueCostEstimate {
  const characterCount = calculateCharacterCount(dialogue.lines);
  const creditsPerChar = modelMode === "fast" ? 0.5 : 1;
  const estimatedCredits = characterCount * creditsPerChar;

  return {
    characterCount,
    estimatedCredits,
    creditsPerChar,
  };
}
