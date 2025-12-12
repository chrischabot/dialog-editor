# ElevenLabs SDK Findings

A comprehensive record of discoveries, gotchas, and solutions encountered while building Dialogue Director—a visual editor for the ElevenLabs Text to Dialogue API.

---

## SDK Version & Package Information

| Property | Value |
|----------|-------|
| **Package (New)** | `@elevenlabs/elevenlabs-js` v2.27.0 |
| **Package (Deprecated)** | `elevenlabs` v1.59.0 (moved to new package) |
| **License** | MIT |
| **Node.js Requirement** | >= 18.0.0 |
| **Repository** | github:elevenlabs/elevenlabs-js |

**Important:** The `elevenlabs` package is deprecated. Use `@elevenlabs/elevenlabs-js` instead.

---

## Client Options: Retries + Logging

### Retry Configuration (`maxRetries`)

**Discovery Date:** 2025-12-11
**SDK Version:** 2.27.0

**Issue/Finding:**
The client option is named `maxRetries` (not `retries`). If omitted, requests retry by default.

**Expected Behavior:**
Unclear from the public surface; some client libraries default to 0 retries.

**Actual Behavior:**
- Default `maxRetries` is `2`.
- This is the number of *retries after the initial attempt* (so up to 3 total attempts).
- Retries happen for HTTP `408`, `429`, and any `>= 500` status.
- Backoff uses `Retry-After` and `X-RateLimit-Reset` headers when present; otherwise exponential backoff starting at 1s with jitter (capped at 60s).
- Retry logic is response-based; thrown network errors/timeouts are handled separately (not retried by `requestWithRetries`).

**Solution/Workaround:**
```ts
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// 4 retries => up to 5 total attempts
const client = new ElevenLabsClient({ apiKey, maxRetries: 4 });
```

### Logging (`logging` + `logger`)

**Discovery Date:** 2025-12-11
**SDK Version:** 2.27.0

**Issue/Finding:**
The SDK supports a configurable logger, and you can provide your own `ILogger`, but logging is **silent by default**.

**Expected Behavior:**
Many SDKs log to console by default when a logger exists.

**Actual Behavior:**
- The client option is named `logging`.
- `logging` accepts either a config object `{ level, silent, logger }` or a pre-built `Logger` instance.
- Log levels are `'debug' | 'info' | 'warn' | 'error'`.
- Defaults are `level: 'info'`, `logger: ConsoleLogger`, `silent: true` (so nothing prints unless you set `silent: false`).
- HTTP request logs are emitted at:
  - `debug`: request start + success metadata
  - `error`: non-2xx/3xx statuses and exceptions
- Logged metadata is redacted for common sensitive headers and query params (including API keys/tokens).
  - Headers: includes `authorization`, `x-api-key`, cookies, etc.
  - Query params: includes `api_key`, `token`, `password`, etc.

**Solution/Workaround (fan-out logger for console + in-app):**
```ts
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { LogLevel, type ILogger } from '@elevenlabs/elevenlabs-js/core/logging';

const fanoutLogger: ILogger = {
  debug: (msg, ...args) => { console.debug(msg, ...args); /* pushToUi('debug', msg, args) */ },
  info:  (msg, ...args) => { console.info(msg, ...args);  /* pushToUi('info',  msg, args) */ },
  warn:  (msg, ...args) => { console.warn(msg, ...args);  /* pushToUi('warn',  msg, args) */ },
  error: (msg, ...args) => { console.error(msg, ...args); /* pushToUi('error', msg, args) */ },
};

const client = new ElevenLabsClient({
  apiKey,
  // Note: this is in addition to the SDK default of 2.
  // Setting it explicitly keeps behavior stable across SDK upgrades.
  maxRetries: 3,
  logging: {
    level: LogLevel.Debug,
    silent: false,
    logger: fanoutLogger,
  },
});
```

**App Integration Note (Dialogue Director):**
- We use a fan-out `ILogger` to write to both console and an in-app log buffer so users can inspect request metadata.
- If you allow users to change the log level at runtime, recreate the client so the new logging configuration takes effect.


## Text to Dialogue Support

### Native SDK Support: YES

The SDK provides **full native support** for Text to Dialogue via `client.textToDialogue`.

### Available Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `convert()` | Converts dialogue to audio | `ReadableStream<Uint8Array>` |
| `stream()` | Streaming audio generation | `ReadableStream<Uint8Array>` |
| `convertWithTimestamps()` | Audio with character-level timing | `AudioWithTimestampsAndVoiceSegmentsResponseModel` |
| `streamWithTimestamps()` | Streaming with timing info | `Stream<StreamingAudioChunkWithTimestampsAndVoiceSegmentsResponseModel>` |

### API Endpoint
```
POST https://api.elevenlabs.io/v1/text-to-dialogue
```

---

## v3 Model Details

### Model ID
```
eleven_v3
```

**Note:** Text to Dialogue is **only available on the Eleven v3 model**.

### Key Characteristics
- Supports multi-speaker dialogue with natural pacing
- Handles interruptions, shifts in tone, and emotional cues
- **Not intended for real-time applications** (multiple generations may be needed)
- No limit on number of speakers

---

## Audio Tags System

### Syntax
Audio tags use **square bracket notation**: `[tag]`

| Type | Format | Example |
|------|--------|---------|
| **Inline** | `[tag]` | `[laughs]`, `[sigh]`, `[pause]` |
| **Multiple** | `[tag1][tag2]` | `[quietly][nervous]` |

**Important Discovery:** Audio tags are **opening tags only**. There are no closing tags like `[/excited]`. The tag affects the text that follows it until the next tag or end of the line.

```typescript
// CORRECT - No closing tags needed
"[excited] I can't believe we won!"
"[whispers] Don't tell anyone, but... [normal] Actually, never mind."

// INCORRECT - This syntax doesn't exist
"[excited]I can't believe we won![/excited]"  // ❌ No closing tags
```

**Note:** Tags are **case-insensitive** (`[EXCITED]` = `[excited]`), but lowercase is recommended.

### Tag Categories

#### 1. Emotional States
```
[excited], [nervous], [frustrated], [sorrowful], [calm], [happy], [sad], [angry],
[fearful], [surprised], [wistful], [resigned], [conflicted], [hopeful], [regretful],
[awestruck], [smug], [bitter]
```

#### 2. Delivery/Volume
```
[whispering], [whispers], [quietly], [loudly], [shouting]
```

#### 3. Sound Effects/Reactions
```
[sigh], [laughs], [gulps], [gasps], [breathes], [clears throat], [coughs]
```

#### 4. Cognitive/Tone Cues
```
[pauses], [hesitates], [stammers], [resigned tone], [cheerfully], [flatly],
[deadpan], [playfully], [sarcastically], [matter-of-fact], [professionally],
[condescending], [dramatically]
```

#### 5. Character Performance/Accents
```
[pirate voice], [robot voice], [evil scientist voice], [childlike tone],
[elderly voice], [superhero voice], [narrator voice]

Accents: [American accent], [British accent], [Australian accent], [Irish accent],
[Scottish accent], [French accent], [German accent], [Spanish accent],
[Italian accent], [Russian accent], [Indian English accent]
```

#### 6. Pacing/Timing
```
[pause], [long pause], [brief pause], [beat], [slowly], [quickly], [rushed],
[drawn out], [rapid-fire], [picks up pace], [slows down]
```

#### 7. Dialogue Flow (Multi-speaker)
```
[interrupting], [overlapping], [cuts in], [trailing off], [continues]
```

#### 8. Emphasis/Style
```
[emphasized], [understated], [monotone], [sing-song]
```

### Usage Examples

```typescript
// Basic emotion
"[excited] I can't believe we won!"

// Multiple tags combined
"[quietly][nervous] Are you sure about this?"

// Sound effect inline
"That's hilarious! [laughs]"

// Character accent
"[British accent] Lovely weather we're having."

// Dialogue with pauses
"The winner is... [pause] you!"
```

### Best Practices
- **Tag density:** 3-8 tags per 100 words for natural delivery
- **Avoid contradictions:** Don't use `[whispering][shouting]` together
- **Be specific:** `[slightly nervous]` over just `[nervous]`
- **Test iterations:** Multiple generations may be needed for best results

### Audio Tags in Regular TTS vs Dialogue API

**Critical Finding:** Audio tags like `[excited]`, `[whispers]`, `[laughs]` are **only interpreted by the Dialogue API**. When sent to the regular Text-to-Speech API, they are pronounced literally as words.

**Solution:** Strip audio tags before sending to TTS API:

```typescript
const stripAudioTags = (text: string): string => {
  return text
    .replace(/\[[\w\s-]+\]/g, '')  // Remove tags like [excited]
    .replace(/\s+/g, ' ')          // Collapse multiple spaces
    .trim();
};

// Fast mode (TTS) - strip tags first
const cleanText = stripAudioTags(originalText);
const audio = await client.textToSpeech.convert(voiceId, { text: cleanText });

// Full mode (Dialogue API) - tags work natively
const audio = await client.textToDialogue.convert({ inputs: [{ text: originalText, voiceId }] });
```

---

## Request Body Schema (DialogueInput)

```typescript
interface DialogueInput {
  /** The text to be converted into speech (can include audio tags) */
  text: string;
  /** The ID of the voice to be used for the generation */
  voiceId: string;
}

interface TextToDialogueRequest {
  /** Required: Array of dialogue turns */
  inputs: DialogueInput[];

  /** Optional: Model ID (defaults to eleven_v3 for dialogue) */
  modelId?: string;

  /** Optional: Output audio format */
  outputFormat?: OutputFormat;

  /** Optional: ISO 639-1 language code */
  languageCode?: string;

  /** Optional: Voice stability (0-1) */
  settings?: { stability?: number };

  /** Optional: Seed for deterministic generation (0-4294967295) */
  seed?: number;

  /** Optional: Text normalization mode */
  applyTextNormalization?: 'auto' | 'on' | 'off';

  /** Optional: Up to 3 pronunciation dictionaries */
  pronunciationDictionaryLocators?: PronunciationDictionaryVersionLocator[];
}
```

---

## Output Formats

### MP3 Formats
| Format | Sample Rate | Bitrate | Notes |
|--------|-------------|---------|-------|
| `mp3_22050_32` | 22.05 kHz | 32 kbps | Default |
| `mp3_24000_48` | 24 kHz | 48 kbps | |
| `mp3_44100_32` | 44.1 kHz | 32 kbps | |
| `mp3_44100_64` | 44.1 kHz | 64 kbps | |
| `mp3_44100_96` | 44.1 kHz | 96 kbps | |
| `mp3_44100_128` | 44.1 kHz | 128 kbps | Recommended |
| `mp3_44100_192` | 44.1 kHz | 192 kbps | Creator tier+ |

### PCM Formats
| Format | Sample Rate | Notes |
|--------|-------------|-------|
| `pcm_8000` | 8 kHz | |
| `pcm_16000` | 16 kHz | |
| `pcm_22050` | 22.05 kHz | |
| `pcm_24000` | 24 kHz | |
| `pcm_32000` | 32 kHz | |
| `pcm_44100` | 44.1 kHz | Pro tier+ |
| `pcm_48000` | 48 kHz | |

### Other Formats
| Format | Notes |
|--------|-------|
| `ulaw_8000` | Common for Twilio |
| `alaw_8000` | |
| `opus_48000_32/64/96/128/192` | Opus codec variants |

---

## Voice Management

### Listing Voices
```typescript
// Get all voices
const voices = await client.voices.getAll({ showLegacy: true });

// Search voices with pagination
const results = await client.voices.search({
  pageSize: 10,
  search: 'male',
  category: 'professional'
});

// Get specific voice
const voice = await client.voices.get('voice_id', { withSettings: true });
```

### Voice Response Model
```typescript
interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
  preview_url?: string;
  // ... additional fields
}
```

### Example Voice IDs (from SDK examples)
- `JBFqnCBsd6RMkjVDRZzb`
- `Aw4FAjKCGjjNkVhN1Xmq`
- `bYTqZQo3Jz7LQtmGTgwi`
- `6lCwbsX1yVjD49QmpkTR`
- `21m00Tcm4TlvDq8ikWAM` (commonly used in examples)

---

## Streaming Behavior

### Single Request Streaming
```typescript
const stream = await client.textToDialogue.stream({
  inputs: [
    { text: "Hello!", voiceId: "voice1" },
    { text: "Hi there!", voiceId: "voice2" }
  ]
});

// Consume stream
for await (const chunk of stream) {
  // Process audio chunk (Uint8Array)
}
```

### With Timestamps
```typescript
const response = await client.textToDialogue.convertWithTimestamps({
  outputFormat: "mp3_22050_32",
  inputs: [
    { text: "Hello, how are you?", voiceId: "voice1" },
    { text: "I'm doing well!", voiceId: "voice2" }
  ]
});

// Response includes character-level timing for sync
```

---

## Error Handling

### Common Errors
| Error | Cause |
|-------|-------|
| `UnprocessableEntityError (422)` | Invalid request body or parameters |
| Missing API key | No `xi-api-key` header provided |
| Invalid voice ID | Voice doesn't exist or no access |
| Invalid model ID | Model not found or lacks TTS capability |

### SDK Error Types
```typescript
import {
  ElevenLabsError,
  ElevenLabsTimeoutError
} from '@elevenlabs/elevenlabs-js';
```

---

## Cost Estimation

**No SDK method for cost estimation.** Cost is typically calculated by:
- Character count (excluding tag markup)
- Model type
- Subscription tier

The `Model` interface includes:
```typescript
interface Model {
  tokenCostFactor?: number;
  maxCharactersRequestFreeUser?: number;
  maxCharactersRequestSubscribedUser?: number;
  maximumTextLengthPerRequest?: number;
}
```

Use `client.models.list()` to retrieve model details for cost calculations.

---

## Code Snippets

### Basic Text to Dialogue
```typescript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({ apiKey: 'your-api-key' });

const audioStream = await client.textToDialogue.convert({
  inputs: [
    { text: "[excited] Knock knock!", voiceId: "JBFqnCBsd6RMkjVDRZzb" },
    { text: "[curious] Who's there?", voiceId: "Aw4FAjKCGjjNkVhN1Xmq" }
  ],
  modelId: "eleven_v3",
  outputFormat: "mp3_44100_128"
});

// Convert stream to blob
const chunks: Uint8Array[] = [];
for await (const chunk of audioStream) {
  chunks.push(chunk);
}
const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
```

### List Available Models
```typescript
const models = await client.models.list();
const v3Model = models.find(m => m.modelId === 'eleven_v3');
console.log('v3 supports TTS:', v3Model?.canDoTextToSpeech);
```

### Get User's Voices
```typescript
const { voices } = await client.voices.getAll();
voices.forEach(v => {
  console.log(`${v.name}: ${v.voice_id}`);
});
```

---

## Gotchas & Workarounds

### 1. Package Migration
The old `elevenlabs` package is deprecated. Update imports:
```typescript
// Old (deprecated)
import { ElevenLabsClient } from 'elevenlabs';

// New
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
```

### 2. Browser vs Node.js
The SDK has browser-specific exclusions for `fs`, `os`, `path`, `stream`. For browser usage, API calls work but file operations need alternatives.

### 3. Text to Dialogue is v3 Only
Attempting to use Text to Dialogue with other models will fail. Always specify or default to `eleven_v3`.

### 4. Professional Voice Clones (PVC)
PVCs are **not fully optimized for v3** during alpha. Use:
- Instant Voice Clones (IVC)
- Designed/preset voices

### 5. Real-time Limitations
Text to Dialogue is **not for real-time/conversational use**. For live applications, use standard Text to Speech with the Conversational AI features.

### 6. Multiple Generations
The documentation notes: "Several generations might be required to achieve the desired results." Build UI to support regeneration workflows.

### 7. Timeout Configuration
Default timeout is 240 seconds. For long dialogues, ensure adequate timeout:
```typescript
const response = await client.textToDialogue.convert(request, {
  timeoutInSeconds: 300
});
```

---

## Dialogue Director Implementation Details

### Project Setup
- **Framework:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **State Management:** Zustand with persist middleware (localStorage)
- **UI Components:** Custom components built on Radix UI primitives

### SDK Client Integration
The ElevenLabsClient is integrated as a singleton wrapper in `src/lib/elevenlabs/client.ts`:

```typescript
// Key exports:
initializeClient(apiKey: string)  // Initialize/reinitialize client
validateApiKey(apiKey: string)    // Verify API key validity
fetchVoices()                     // Get all available voices
generateDialogue(inputs, options) // Generate full dialogue audio
generateSpeech(text, voiceId)     // Generate single line via TTS API
generateLinePreview(text, voiceId) // Generate single line preview
getUserInfo()                     // Get subscription/usage info
fetchModels()                     // Get available models
```

### TypeScript Gotcha: Stream Handling
The SDK returns `ReadableStream<Uint8Array>` which has SharedArrayBuffer compatibility issues with TypeScript's strict checking. Solution:

```typescript
// Convert stream chunks to avoid SharedArrayBuffer issues
const chunks: Uint8Array[] = [];
let totalBytes = 0;

for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
  const copy = new Uint8Array(chunk);  // Create a copy to avoid SharedArrayBuffer issues
  chunks.push(copy);
  totalBytes += copy.length;
}

const result = new Uint8Array(totalBytes);
let offset = 0;
for (const chunk of chunks) {
  result.set(chunk, offset);
  offset += chunk.length;
}

return new Blob([result], { type: 'audio/mpeg' });
```

### API Method Corrections
During implementation, discovered these SDK method signatures:

| SDK Method | Correct Usage |
|------------|---------------|
| Get voices | `client.voices.getAll({ showLegacy: false })` |
| Get subscription | `client.user.subscription.get()` (NOT `.getSubscription()`) |
| Validate user | `client.user.get()` |

### Bundle Size Warning
The SDK includes Node.js modules (`node:child_process`, `node:stream`, etc.) that get externalized for browser compatibility. This is expected behavior and doesn't affect functionality.

---

## Dual-Mode Generation System

### Critical Discovery: Model Limitations

**Discovery Date:** 2025-12-12

**Issue/Finding:**
The `eleven_flash_v2_5` model does NOT support the Text to Dialogue API. Only `eleven_v3` family models work with it.

**Error encountered:**
```
Model 'eleven_flash_v2_5' is not valid. Only the v3 family of models are supported.
```

**Solution:**
Implemented a dual-mode generation system:
- **Fast Mode:** Uses regular Text-to-Speech API (`textToSpeech.convert()`) with `eleven_flash_v2_5` for quick, cheaper previews
- **Full Mode:** Uses Dialogue API (`textToDialogue.convert()`) with `eleven_v3` for natural conversation flow

```typescript
// Fast mode uses regular TTS (half the credit cost)
const audio = await client.textToSpeech.convert(voiceId, {
  text: stripAudioTags(text),  // Must strip tags - TTS reads them literally
  modelId: 'eleven_flash_v2_5',
  outputFormat: 'mp3_44100_128',
});

// Full mode uses Dialogue API (natural conversation flow)
const audio = await client.textToDialogue.convert({
  inputs: [{ text, voiceId }],  // Tags work here
  modelId: 'eleven_v3',
});
```

### Credit Cost Differences by Model

| Model | Credit Cost | API | Audio Tags |
|-------|-------------|-----|------------|
| `eleven_v3` | 1 credit/character | Text to Dialogue | Supported |
| `eleven_flash_v2_5` | 0.5 credits/character | Text to Speech | Not supported |

**Note:** "Generate All" always uses Full quality (`eleven_v3`) to preserve natural conversation flow, regardless of the mode toggle setting.

---

## IndexedDB Audio Caching System

### Implementation: `src/lib/audioCache.ts`

Implemented persistent audio caching to dramatically reduce API costs during iteration.

### Storage Architecture
- **Database:** IndexedDB (`dialogue-director-audio-cache`)
- **Persistence:** Survives browser sessions, page refreshes, and browser restarts
- **Expiration:** 48 hours per entry (automatic cleanup)
- **Size:** Limited only by browser's IndexedDB quota (typically 50% of free disk space)

### Cache Key Strategy

Content-based keys ensure automatic invalidation when anything changes:

```typescript
// Single line preview
const lineKey = `line:${text}:${voiceId}:${modelId}`;

// Full dialogue
const dialogueCacheKey = dialogue.lines
  .map(line => {
    const speaker = dialogue.speakers.find(s => s.id === line.speakerId);
    return `${line.text}:${speaker?.voiceId || ''}`;
  })
  .join('|') + `:${modelId}`;
```

**Why this works:**
- Change the text? Different key, cache miss, regenerate.
- Change the voice? Different key, cache miss, regenerate.
- Change the model? Different key, cache miss, regenerate.
- Same content? Cache hit, instant playback, zero credits.

### Cache API

```typescript
// Check cache before generating
const cached = await getCachedAudio(cacheKey);
if (cached) {
  return cached;  // Free playback!
}

// Generate and cache for future use
const audio = await generateDialogue(inputs, options);
await setCachedAudio(cacheKey, audio);

// Maintenance
await cleanupExpiredCache();  // Remove entries > 48 hours old
await clearAllCachedAudio();  // Nuclear option
const stats = await getCacheStats();  // { count, totalSize }
```

### "Play All" vs "Generate All" Button

**UX Enhancement:** The main generation button dynamically changes based on cache status:

```typescript
// Check if full dialogue is cached
const [isDialogueCached, setIsDialogueCached] = React.useState(false);

React.useEffect(() => {
  async function checkCache() {
    if (!dialogue || dialogue.lines.length === 0) {
      setIsDialogueCached(false);
      return;
    }
    const cacheKey = getDialogueCacheKey(dialogue.lines, dialogue.speakers, modelId);
    const cached = await getCachedAudio(cacheKey);
    setIsDialogueCached(cached !== null);
  }
  checkCache();
}, [dialogue]);

// Button text changes based on cache
<Button onClick={handleGenerateAll}>
  {isDialogueCached ? "Play All" : "Generate All"}
</Button>
```

**Behavior:**
- Shows "Generate All" when content has changed or no cache exists
- Shows "Play All" when cached audio is available
- Automatically switches back to "Generate All" when any line is edited, a speaker voice changes, or a line is added/removed

### Cache Entry Schema

```typescript
interface CacheEntry {
  key: string;           // Content-based cache key
  blob: Blob;            // Audio data (MP3)
  timestamp: number;     // Unix timestamp for expiration
}
```

---

## Developer Tools Integration

### DevTools Drawer

A resizable developer tools panel at the bottom of the editor provides:

**Network Tab:**
- All API requests/responses
- HTTP method, endpoint, status code
- Request/response timing
- Full payload inspection

**Logs Tab:**
- SDK activity logs
- Debug, info, warn, error levels
- Timestamped entries

**Payload Tab:**
- Live JSON preview of the current dialogue as it would be sent to the API
- Formatted/minified toggle
- One-click copy to clipboard

### Custom Logger Implementation

```typescript
// src/lib/elevenlabs/logger.ts
export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'request' | 'response' | 'log';
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  method?: string;
  endpoint?: string;
  status?: number;
  duration?: number;
  data?: unknown;
}

// Subscribe to real-time log updates
const unsubscribe = subscribeLogs((logs) => {
  setLogs(logs);
});
```

---

## References

- [ElevenLabs API Reference - Text to Dialogue](https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert)
- [Text to Dialogue Quickstart](https://elevenlabs.io/docs/cookbooks/text-to-dialogue)
- [Audio Tags Guide](https://dev.to/yigit-konur/the-complete-guide-to-elevenlabs-v3-master-interactive-voice-experiences-with-audio-tags-3bn2)
- [Eleven v3 Overview](https://elevenlabs.io/v3)
