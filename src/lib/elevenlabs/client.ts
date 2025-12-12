/**
 * ElevenLabs SDK Client Wrapper
 *
 * A singleton wrapper around the @elevenlabs/elevenlabs-js SDK (v2.27.0)
 * providing type-safe access to Text to Dialogue, voice management, and user info.
 *
 * Key implementation notes:
 * - Stream handling: Converts chunks to avoid SharedArrayBuffer issues
 * - Default timeout: 240s, use longer for big dialogues
 * - maxRetries defaults to 2 (can be configured)
 * - Model ID for dialogue: eleven_v3
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { ElevenLabsVoice, UserSubscriptionInfo } from '@/types/dialogue';
import {
  ElevenLabsClientError,
  type DialogueInput,
  type GenerateDialogueOptions,
} from './types';
import { logger } from './logger';

// Re-export logger for convenience
export { logger } from './logger';

// Singleton client instance
let client: ElevenLabsClient | null = null;

/**
 * Initialize or reinitialize the ElevenLabs client with an API key
 *
 * @param apiKey - ElevenLabs API key (xi-api-key)
 * @param options - Optional client configuration
 * @param options.maxRetries - Number of retries (default: 2)
 * @param options.timeoutInSeconds - Request timeout in seconds (default: 240)
 */
export function initializeClient(
  apiKey: string,
  options?: {
    maxRetries?: number;
    timeoutInSeconds?: number;
  }
): void {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new ElevenLabsClientError('API key cannot be empty', 'INVALID_API_KEY');
  }

  logger.info('Initializing ElevenLabs client', {
    maxRetries: options?.maxRetries ?? 2,
    timeoutInSeconds: options?.timeoutInSeconds ?? 240,
  });

  try {
    client = new ElevenLabsClient({
      apiKey: apiKey.trim(),
      maxRetries: options?.maxRetries ?? 2,
      timeoutInSeconds: options?.timeoutInSeconds ?? 240,
    });
    logger.info('ElevenLabs client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize ElevenLabs client', error);
    throw new ElevenLabsClientError(
      `Failed to initialize ElevenLabs client: ${error instanceof Error ? error.message : String(error)}`,
      'INITIALIZATION_ERROR'
    );
  }
}

/**
 * Check if the client has been initialized
 *
 * @returns true if client is initialized, false otherwise
 */
export function isClientInitialized(): boolean {
  return client !== null;
}

/**
 * Get the initialized client instance
 *
 * @throws {ElevenLabsClientError} if client is not initialized
 */
function getClient(): ElevenLabsClient {
  if (!client) {
    throw new ElevenLabsClientError(
      'ElevenLabs client not initialized. Call initializeClient() first.',
      'CLIENT_NOT_INITIALIZED'
    );
  }
  return client;
}

/**
 * Validate an API key by making a test request to the user endpoint
 *
 * @param apiKey - ElevenLabs API key to validate
 * @returns true if the API key is valid, false otherwise
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.trim().length === 0) {
    logger.warn('API key validation failed: empty key');
    return false;
  }

  logger.debug('Validating API key...');

  try {
    // Create a temporary client for validation
    const tempClient = new ElevenLabsClient({
      apiKey: apiKey.trim(),
      maxRetries: 0, // No retries for validation
    });

    // Make a simple request to verify the key works
    await tempClient.user.get();
    logger.info('API key validated successfully');
    return true;
  } catch (error) {
    logger.error('API key validation failed', error);
    // Any error means the key is invalid
    return false;
  }
}

/**
 * Fetch all available voices from ElevenLabs
 *
 * @param options - Optional parameters
 * @param options.showLegacy - Include legacy voices (default: false)
 * @returns Array of available voices
 * @throws {ElevenLabsClientError} on API errors
 */
export async function fetchVoices(options?: {
  showLegacy?: boolean;
}): Promise<ElevenLabsVoice[]> {
  const elevenClient = getClient();

  const endpoint = '/v1/voices';
  logger.request('GET', endpoint, { showLegacy: options?.showLegacy ?? false });
  const startTime = Date.now();

  try {
    const response = await elevenClient.voices.getAll({
      showLegacy: options?.showLegacy ?? false,
    });

    // Map SDK voice response to our ElevenLabsVoice type
    type RawVoice = {
      voice_id?: string;
      voiceId?: string;
      name?: string;
      category?: string;
      labels?: Record<string, string>;
      preview_url?: string;
      previewUrl?: string;
      description?: string;
    };

    const voices = (response.voices as unknown as RawVoice[]).map((voice) => ({
      voice_id: voice.voice_id ?? voice.voiceId ?? '',
      name: voice.name ?? '',
      category: voice.category,
      labels: voice.labels,
      preview_url: voice.preview_url ?? voice.previewUrl,
      description: voice.description,
    }));

    logger.response('GET', endpoint, 200, { voiceCount: voices.length }, Date.now() - startTime);
    return voices;
  } catch (error) {
    logger.response('GET', endpoint, 500, { error: error instanceof Error ? error.message : String(error) }, Date.now() - startTime);
    throw new ElevenLabsClientError(
      `Failed to fetch voices: ${error instanceof Error ? error.message : String(error)}`,
      'FETCH_VOICES_ERROR'
    );
  }
}

/**
 * Generate dialogue audio from multiple speakers using Text to Dialogue API
 *
 * Important notes from SDK_FINDINGS.md:
 * - Uses eleven_v3 model (only model supporting Text to Dialogue)
 * - Stream chunks are converted to avoid SharedArrayBuffer issues
 * - Default timeout is 240s, increase for longer dialogues
 *
 * @param inputs - Array of dialogue turns with text and voice ID
 * @param options - Optional generation parameters
 * @returns Audio blob (MP3 format by default)
 * @throws {ElevenLabsClientError} on generation errors
 */
export async function generateDialogue(
  inputs: DialogueInput[],
  options?: GenerateDialogueOptions
): Promise<Blob> {
  const elevenClient = getClient();

  if (!inputs || inputs.length === 0) {
    logger.error('generateDialogue called with no inputs');
    throw new ElevenLabsClientError(
      'At least one dialogue input is required',
      'INVALID_INPUT'
    );
  }

  // Validate inputs
  for (const input of inputs) {
    if (!input.text || input.text.trim().length === 0) {
      logger.error('generateDialogue input has empty text');
      throw new ElevenLabsClientError(
        'Dialogue input text cannot be empty',
        'INVALID_INPUT'
      );
    }
    if (!input.voiceId || input.voiceId.trim().length === 0) {
      logger.error('generateDialogue input has no voice ID');
      throw new ElevenLabsClientError(
        'Dialogue input must have a valid voice ID',
        'INVALID_INPUT'
      );
    }
  }

  const endpoint = '/v1/text-to-dialogue';
  const totalChars = inputs.reduce((sum, i) => sum + i.text.length, 0);

  // Convert to SDK format
  const sdkInputs = inputs.map((input) => ({
    text: input.text,
    voiceId: input.voiceId,
  }));

  const requestPayload = {
    inputs: sdkInputs,
    modelId: options?.modelId ?? 'eleven_v3',
    outputFormat: options?.outputFormat ?? 'mp3_44100_128',
  };

  logger.request('POST', endpoint, {
    ...requestPayload,
    _meta: { lines: inputs.length, totalCharacters: totalChars },
  });

  const startTime = Date.now();

  try {
    // Call the text-to-dialogue endpoint
    const stream = await elevenClient.textToDialogue.convert(
      requestPayload,
      {
        timeoutInSeconds: options?.timeoutInSeconds ?? 300, // 5 minutes for longer dialogues
      }
    );

    logger.debug('Receiving audio stream...');

    // Convert stream chunks to avoid SharedArrayBuffer issues
    // This is critical per SDK_FINDINGS.md
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
      const copy = new Uint8Array(chunk);
      chunks.push(copy);
      totalBytes += copy.length;
    }

    const result = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    // Create blob with appropriate MIME type
    const mimeType = options?.outputFormat?.startsWith('mp3')
      ? 'audio/mpeg'
      : 'audio/wav';

    const elapsed = Date.now() - startTime;
    logger.response('POST', endpoint, 200, {
      audioSize: `${(result.byteLength / 1024).toFixed(1)}KB`,
      mimeType,
    }, elapsed);

    return new Blob([result], { type: mimeType });
  } catch (error) {
    logger.response('POST', endpoint, 500, {
      error: error instanceof Error ? error.message : String(error),
    }, Date.now() - startTime);
    throw new ElevenLabsClientError(
      `Failed to generate dialogue: ${error instanceof Error ? error.message : String(error)}`,
      'GENERATION_ERROR'
    );
  }
}

/**
 * Generate speech using regular Text-to-Speech API
 *
 * This uses the standard TTS endpoint which supports faster models like
 * eleven_flash_v2_5 and eleven_turbo_v2_5, but doesn't have the natural
 * conversational flow of the dialogue API.
 *
 * @param text - The text to generate
 * @param voiceId - ElevenLabs voice ID to use
 * @param options - Optional generation parameters
 * @returns Audio blob (MP3 format by default)
 * @throws {ElevenLabsClientError} on generation errors
 */
export async function generateSpeech(
  text: string,
  voiceId: string,
  options?: GenerateDialogueOptions
): Promise<Blob> {
  const elevenClient = getClient();

  if (!text || text.trim().length === 0) {
    logger.error('generateSpeech called with empty text');
    throw new ElevenLabsClientError('Text cannot be empty', 'INVALID_INPUT');
  }

  if (!voiceId || voiceId.trim().length === 0) {
    logger.error('generateSpeech called with no voice ID');
    throw new ElevenLabsClientError('Voice ID is required', 'INVALID_INPUT');
  }

  const endpoint = `/v1/text-to-speech/${voiceId}`;

  logger.request('POST', endpoint, {
    text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    modelId: options?.modelId ?? 'eleven_flash_v2_5',
    voiceId,
  });

  const startTime = Date.now();

  try {
    const stream = await elevenClient.textToSpeech.convert(voiceId, {
      text,
      modelId: options?.modelId ?? 'eleven_flash_v2_5',
      outputFormat: options?.outputFormat ?? 'mp3_44100_128',
    });

    // Convert stream chunks to avoid SharedArrayBuffer issues
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
      const copy = new Uint8Array(chunk);
      chunks.push(copy);
      totalBytes += copy.length;
    }

    const result = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    const mimeType = options?.outputFormat?.startsWith('mp3')
      ? 'audio/mpeg'
      : 'audio/wav';

    const elapsed = Date.now() - startTime;
    logger.response('POST', endpoint, 200, {
      audioSize: `${(result.byteLength / 1024).toFixed(1)}KB`,
      mimeType,
    }, elapsed);

    return new Blob([result], { type: mimeType });
  } catch (error) {
    logger.response('POST', endpoint, 500, {
      error: error instanceof Error ? error.message : String(error),
    }, Date.now() - startTime);
    throw new ElevenLabsClientError(
      `Failed to generate speech: ${error instanceof Error ? error.message : String(error)}`,
      'GENERATION_ERROR'
    );
  }
}

/**
 * Generate a preview for a single dialogue line
 *
 * This is a convenience wrapper around generateDialogue for single-line previews.
 * Useful for testing individual lines before generating the full dialogue.
 *
 * @param text - The text to generate (can include audio tags)
 * @param voiceId - ElevenLabs voice ID to use
 * @param options - Optional generation parameters
 * @returns Audio blob (MP3 format by default)
 * @throws {ElevenLabsClientError} on generation errors
 */
export async function generateLinePreview(
  text: string,
  voiceId: string,
  options?: GenerateDialogueOptions
): Promise<Blob> {
  return generateDialogue([{ text, voiceId }], options);
}

/**
 * Get user subscription and usage information
 *
 * Useful for displaying character quota and cost estimation.
 *
 * @returns User subscription info including character count and limits
 * @throws {ElevenLabsClientError} on API errors
 */
export async function getUserInfo(): Promise<UserSubscriptionInfo> {
  const elevenClient = getClient();

  try {
    // Get user subscription data
    const subscription = await elevenClient.user.subscription.get();

    return {
      character_count: subscription.characterCount ?? 0,
      character_limit: subscription.characterLimit ?? 0,
      can_extend_character_limit: subscription.canExtendCharacterLimit,
      allowed_to_extend_character_limit: subscription.allowedToExtendCharacterLimit,
      next_character_count_reset_unix: subscription.nextCharacterCountResetUnix,
      voice_limit: subscription.voiceLimit,
      max_voice_add_edits: subscription.maxVoiceAddEdits,
      voice_add_edit_counter: subscription.voiceAddEditCounter,
      professional_voice_limit: subscription.professionalVoiceLimit,
      can_extend_voice_limit: subscription.canExtendVoiceLimit,
      can_use_instant_voice_cloning: subscription.canUseInstantVoiceCloning,
      can_use_professional_voice_cloning: subscription.canUseProfessionalVoiceCloning,
      currency: subscription.currency,
      status: subscription.status,
      tier: subscription.tier,
      character_refresh_period: subscription.characterRefreshPeriod,
      next_invoice: subscription.nextInvoice
        ? {
            amount_due_cents: subscription.nextInvoice.amountDueCents,
            next_payment_attempt_unix: subscription.nextInvoice.nextPaymentAttemptUnix,
          }
        : undefined,
    };
  } catch (error) {
    throw new ElevenLabsClientError(
      `Failed to fetch user info: ${error instanceof Error ? error.message : String(error)}`,
      'FETCH_USER_INFO_ERROR'
    );
  }
}

/**
 * Get available models from ElevenLabs
 *
 * Useful for displaying model options and checking capabilities.
 *
 * @returns Array of available models
 * @throws {ElevenLabsClientError} on API errors
 */
export async function fetchModels() {
  const elevenClient = getClient();

  try {
    const models = await elevenClient.models.list();
    return models.map((model) => ({
      model_id: model.modelId,
      name: model.name,
      can_do_text_to_speech: model.canDoTextToSpeech,
      can_do_voice_conversion: model.canDoVoiceConversion,
      token_cost_factor: model.tokenCostFactor,
      description: model.description,
    }));
  } catch (error) {
    throw new ElevenLabsClientError(
      `Failed to fetch models: ${error instanceof Error ? error.message : String(error)}`,
      'FETCH_MODELS_ERROR'
    );
  }
}

/**
 * Reset the client instance
 *
 * Useful for testing or when switching API keys
 */
export function resetClient(): void {
  client = null;
}
