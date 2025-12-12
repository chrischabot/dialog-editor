# ElevenLabs SDK Client Wrapper

A type-safe, singleton wrapper around the `@elevenlabs/elevenlabs-js` SDK (v2.27.0) for the Dialogue Director application.

## Features

- **Text to Dialogue Support**: Native integration with ElevenLabs v3 Text to Dialogue API
- **Voice Management**: Fetch and list available voices
- **User Info**: Get subscription and usage information for cost estimation
- **Error Handling**: Custom error types with proper error codes
- **Stream Handling**: Converts ReadableStream chunks to avoid SharedArrayBuffer issues
- **Configurable Timeouts**: Default 240s, customizable for longer dialogues
- **Retry Logic**: Configurable maxRetries (default: 2)

## Files

```
src/lib/elevenlabs/
├── client.ts        # Main client wrapper with all SDK functions
├── types.ts         # SDK-specific types and error classes
└── index.ts         # Re-exports for easier imports
```

## Usage

### Initialize the Client

```typescript
import { initializeClient, isClientInitialized } from '@/lib/elevenlabs';

// Initialize with API key
initializeClient('your-api-key');

// Check if initialized
if (isClientInitialized()) {
  console.log('Client ready!');
}
```

### Validate API Key

```typescript
import { validateApiKey } from '@/lib/elevenlabs';

const isValid = await validateApiKey('your-api-key');
if (isValid) {
  console.log('API key is valid');
}
```

### Fetch Voices

```typescript
import { fetchVoices } from '@/lib/elevenlabs';

const voices = await fetchVoices({ showLegacy: false });
console.log(`Found ${voices.length} voices`);
```

### Generate Dialogue

```typescript
import { generateDialogue } from '@/lib/elevenlabs';
import type { DialogueInput } from '@/lib/elevenlabs';

const inputs: DialogueInput[] = [
  { text: '[excited] Hello there!', voiceId: 'voice-id-1' },
  { text: 'Hi! How are you?', voiceId: 'voice-id-2' },
];

const audioBlob = await generateDialogue(inputs, {
  outputFormat: 'mp3_44100_128',
  modelId: 'eleven_v3',
});

// Play or download the audio
const audioUrl = URL.createObjectURL(audioBlob);
```

### Generate Single Line Preview

```typescript
import { generateLinePreview } from '@/lib/elevenlabs';

const preview = await generateLinePreview(
  '[whispers] This is a secret',
  'voice-id-1'
);
```

### Get User Subscription Info

```typescript
import { getUserInfo } from '@/lib/elevenlabs';

const userInfo = await getUserInfo();
console.log(`Characters used: ${userInfo.character_count}/${userInfo.character_limit}`);
```

## Error Handling

```typescript
import { 
  generateDialogue, 
  ElevenLabsClientError 
} from '@/lib/elevenlabs';

try {
  const audio = await generateDialogue(inputs);
} catch (error) {
  if (error instanceof ElevenLabsClientError) {
    console.error(`Error (${error.code}):`, error.message);
  }
}
```

## Important Implementation Notes

### Stream Chunk Conversion

Per SDK_FINDINGS.md, stream chunks must be converted to avoid SharedArrayBuffer issues:

```typescript
const chunks: number[][] = [];
for await (const chunk of stream) {
  chunks.push(Array.from(chunk));  // Convert to regular array
}
const allBytes = chunks.flat();
const result = new Uint8Array(allBytes);
```

### Model Requirements

Text to Dialogue is **only available with the `eleven_v3` model**. The client defaults to this model.

### Timeout Configuration

For longer dialogues, increase the timeout:

```typescript
const audio = await generateDialogue(inputs, {
  timeoutInSeconds: 600,  // 10 minutes
});
```

## API Reference

### Core Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `initializeClient(apiKey, options?)` | Initialize or reinitialize the client | `void` |
| `isClientInitialized()` | Check if client is initialized | `boolean` |
| `validateApiKey(apiKey)` | Validate an API key | `Promise<boolean>` |
| `fetchVoices(options?)` | Get all available voices | `Promise<ElevenLabsVoice[]>` |
| `generateDialogue(inputs, options?)` | Generate dialogue audio | `Promise<Blob>` |
| `generateLinePreview(text, voiceId, options?)` | Generate single line preview | `Promise<Blob>` |
| `getUserInfo()` | Get user subscription info | `Promise<UserSubscriptionInfo>` |
| `fetchModels()` | Get available models | `Promise<ModelInfo[]>` |
| `resetClient()` | Reset client instance | `void` |

### Types

- `DialogueInput` - Single dialogue turn with text and voice ID
- `GenerateDialogueOptions` - Options for dialogue generation (format, model, timeout)
- `ElevenLabsClientError` - Custom error class with code and status
- `ElevenLabsVoice` - Voice information from ElevenLabs API
- `UserSubscriptionInfo` - User subscription and usage data
- `ModelInfo` - Available model information

## Related Documentation

- [SDK_FINDINGS.md](../../../docs/SDK_FINDINGS.md) - Comprehensive SDK investigation notes
- [ElevenLabs API Reference](https://elevenlabs.io/docs/api-reference/text-to-dialogue)
- [Text to Dialogue Quickstart](https://elevenlabs.io/docs/cookbooks/text-to-dialogue)
