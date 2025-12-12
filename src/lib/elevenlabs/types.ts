// SDK-specific types for ElevenLabs integration

/**
 * Options for generating dialogue audio
 */
export interface GenerateDialogueOptions {
  outputFormat?: 
    | 'mp3_22050_32'
    | 'mp3_24000_48'
    | 'mp3_44100_32'
    | 'mp3_44100_64'
    | 'mp3_44100_96'
    | 'mp3_44100_128'
    | 'mp3_44100_192'
    | 'pcm_8000'
    | 'pcm_16000'
    | 'pcm_22050'
    | 'pcm_24000'
    | 'pcm_32000'
    | 'pcm_44100'
    | 'pcm_48000';
  modelId?: string;
  timeoutInSeconds?: number;
}

/**
 * Input for a single dialogue turn
 */
export interface DialogueInput {
  text: string;
  voiceId: string;
}

/**
 * Error thrown by ElevenLabs client operations
 */
export class ElevenLabsClientError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'ElevenLabsClientError';
  }
}

/**
 * Simplified model information
 */
export interface ModelInfo {
  model_id: string;
  name: string;
  can_do_text_to_speech?: boolean;
  can_do_voice_conversion?: boolean;
  token_cost_factor?: number;
  description?: string;
}
