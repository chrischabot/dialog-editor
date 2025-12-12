/**
 * Core TypeScript types for Dialogue Director
 * A visual composition tool for ElevenLabs v3 Text to Dialogue API
 */

// ============================================================================
// Speaker Types
// ============================================================================

/**
 * Represents a voice/character in the dialogue
 */
export interface Speaker {
  id: string;
  name: string;
  voiceId: string;
  color: string; // Hex color for UI differentiation (e.g., "#3B82F6")
}

// ============================================================================
// Audio Tag Types
// ============================================================================

/**
 * Categories of audio tags available in ElevenLabs v3
 */
export type TagCategory =
  | 'emotion'    // excited, nervous, sad, angry, happy
  | 'delivery'   // whispers, shouts, sarcastically, mumbles
  | 'character'  // British accent, pirate voice, robot voice
  | 'sound'      // laughs, sighs, clears throat, gasps
  | 'narrative'  // pauses, hesitates, cheerfully, sarcastically
  | 'pacing'     // pause, slowly, quickly, rapid-fire
  | 'dialogue';  // interrupting, overlapping, cuts in

/**
 * Definition of an audio tag with metadata for UI display
 */
export interface AudioTag {
  id: string;
  tag: string;           // Tag name as used in API (e.g., "whispers", "excited")
  displayName: string;   // Human-readable name (e.g., "Whispers", "Excited")
  category: TagCategory;
  description: string;   // What the tag does
  example: string;       // Example usage in context
  syntax: 'inline';      // All tags use [tag] inline syntax per SDK findings
}

// ============================================================================
// Dialogue Line Types
// ============================================================================

/**
 * A single line of dialogue with speaker, text, and audio tags
 */
export interface DialogueLine {
  id: string;
  speakerId: string;      // Reference to Speaker.id
  text: string;           // Text content with inline tags (e.g., "[excited]Hello![/excited]")
  generatedAudio?: string; // Base64 encoded audio or blob URL
  isGenerating?: boolean;  // True while API call is in progress
}

// ============================================================================
// Dialogue Document Types
// ============================================================================

/**
 * Complete dialogue document with all speakers and lines
 */
export interface Dialogue {
  id: string;
  title: string;
  description?: string;
  speakers: Speaker[];
  lines: DialogueLine[];
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

// ============================================================================
// ElevenLabs API Types
// ============================================================================

/**
 * Voice object from ElevenLabs API
 */
export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
  preview_url?: string;
  description?: string;
}

/**
 * A single turn in the Text to Dialogue API payload
 */
export interface DialogueTurn {
  text: string;
  voice_id: string;
}

/**
 * Request payload for ElevenLabs Text to Dialogue API
 */
export interface TextToDialogueRequest {
  model_id: string; // e.g., "eleven_v3"
  dialogue: DialogueTurn[];
}

/**
 * User subscription information from ElevenLabs API
 */
export interface UserSubscriptionInfo {
  character_count: number;
  character_limit: number;
  can_extend_character_limit?: boolean;
  allowed_to_extend_character_limit?: boolean;
  next_character_count_reset_unix?: number;
  voice_limit?: number;
  max_voice_add_edits?: number;
  voice_add_edit_counter?: number;
  professional_voice_limit?: number;
  can_extend_voice_limit?: boolean;
  can_use_instant_voice_cloning?: boolean;
  can_use_professional_voice_cloning?: boolean;
  currency?: string;
  status?: string;
  tier?: string;
  character_refresh_period?: string;
  next_invoice?: {
    amount_due_cents: number;
    next_payment_attempt_unix: number;
  };
}

// ============================================================================
// Store State Types
// ============================================================================

/**
 * UI state for text selection
 */
export interface TextSelection {
  start: number;
  end: number;
}

/**
 * Main application state shape
 */
export interface DialogueState {
  // Core data
  dialogue: Dialogue;
  apiKey: string | null;
  voices: ElevenLabsVoice[];

  // UI state
  selectedLineId: string | null;
  selectedText: TextSelection | null;
  isGenerating: boolean;
  generatedAudio: Blob | null;

  // Actions
  setApiKey: (key: string) => void;
  setVoices: (voices: ElevenLabsVoice[]) => void;

  // Speaker actions
  addSpeaker: (name: string, voiceId: string, color: string) => void;
  updateSpeaker: (id: string, updates: Partial<Speaker>) => void;
  removeSpeaker: (id: string) => void;

  // Line actions
  addLine: (speakerId: string, text?: string) => void;
  updateLine: (id: string, text: string) => void;
  removeLine: (id: string) => void;
  reorderLines: (fromIndex: number, toIndex: number) => void;

  // Tag actions
  applyTag: (lineId: string, tag: AudioTag, position: number) => void;
  removeTag: (lineId: string, tagIndex: number) => void;

  // Selection actions
  setSelectedLine: (id: string | null) => void;
  setSelectedText: (selection: TextSelection | null) => void;

  // Generation actions
  generateLinePreview: (lineId: string) => Promise<void>;
  generateFullDialogue: () => Promise<void>;

  // Utility actions
  loadTemplate: (templateId: string) => void;
  exportAsJson: () => string;
  reset: () => void;
}

// ============================================================================
// Template Types
// ============================================================================

/**
 * Template line definition (before instantiation)
 */
export interface TemplateLine {
  speakerIndex: number; // Index into template speakers array
  text: string;
}

/**
 * Pre-built dialogue template
 */
export interface DialogueTemplate {
  id: string;
  title: string;
  description: string;
  speakers: Omit<Speaker, 'id' | 'color'>[]; // Name and voiceId only
  lines: TemplateLine[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Character count and cost estimation
 */
export interface CostEstimate {
  characterCount: number;      // Total characters (excluding tag markup)
  estimatedCredits: number;    // Estimated API credits
  modelId: string;             // Model used for estimation
}

/**
 * Tag category metadata for UI rendering
 */
export interface TagCategoryMeta {
  label: string;
  icon: string; // Lucide icon name
  description: string;
}

/**
 * Audio playback state
 */
export interface AudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  lineId?: string; // Which line is currently playing (if per-line preview)
}

/**
 * Error state for API operations
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid Speaker
 */
export function isSpeaker(value: unknown): value is Speaker {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'voiceId' in value &&
    'color' in value
  );
}

/**
 * Check if a value is a valid DialogueLine
 */
export function isDialogueLine(value: unknown): value is DialogueLine {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'speakerId' in value &&
    'text' in value
  );
}

/**
 * Check if a value is a valid Dialogue
 */
export function isDialogue(value: unknown): value is Dialogue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'speakers' in value &&
    'lines' in value &&
    'createdAt' in value &&
    'updatedAt' in value
  );
}

// ============================================================================
// Exported Type Maps
// ============================================================================

/**
 * Mapping of tag categories to their metadata
 */
export const TAG_CATEGORY_META: Record<TagCategory, TagCategoryMeta> = {
  emotion: {
    label: 'Emotions',
    icon: 'Heart',
    description: 'Emotional states and feelings'
  },
  delivery: {
    label: 'Delivery Style',
    icon: 'Mic',
    description: 'How the text should be spoken'
  },
  character: {
    label: 'Character Voices',
    icon: 'User',
    description: 'Character accents and voice styles'
  },
  sound: {
    label: 'Sound Effects',
    icon: 'Volume2',
    description: 'Non-verbal sounds and effects'
  },
  narrative: {
    label: 'Narrative Control',
    icon: 'Clock',
    description: 'Timing and flow control'
  },
  pacing: {
    label: 'Pacing',
    icon: 'Gauge',
    description: 'Speed and emphasis variations'
  },
  dialogue: {
    label: 'Dialogue Flow',
    icon: 'MessageSquare',
    description: 'Multi-speaker dialogue interactions'
  }
};

// ============================================================================
// Constants
// ============================================================================

/**
 * Default speaker colors (Material Design palette)
 */
export const DEFAULT_SPEAKER_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
] as const;

/**
 * ElevenLabs model IDs
 */
export const ELEVENLABS_MODELS = {
  V3: 'eleven_turbo_v2_5',
  MULTILINGUAL_V2: 'eleven_multilingual_v2',
  TURBO_V2: 'eleven_turbo_v2'
} as const;

/**
 * Character limits and pricing
 */
export const PRICING_CONFIG = {
  CHARACTERS_PER_CREDIT: 1000, // Approximate - verify with actual pricing
  WARNING_THRESHOLD: 5000,      // Warn when approaching high character count
  MAX_CHARACTERS: 50000         // Safety limit
} as const;
