# Dialogue Director

Visual dialogue editor for the ElevenLabs Text to Dialogue API.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

- **Next.js 16** with App Router and React 19
- **Zustand** for state management with localStorage persistence
- **IndexedDB** for audio blob caching (48hr TTL)
- **ElevenLabs SDK** (`@elevenlabs/elevenlabs-js` v2.27.0)
- **Tailwind CSS v4** with Radix UI primitives

## Key Files

- `src/stores/dialogueStore.ts` - Main app state (dialogues, speakers, API key)
- `src/lib/elevenlabs/client.ts` - SDK wrapper with logging
- `src/lib/audioCache.ts` - IndexedDB caching layer
- `src/lib/audioTags.ts` - Audio tag definitions and utilities
- `src/hooks/useDialogueAudio.ts` - Audio generation hook with caching
- `src/components/editor/` - Main editor UI components

## Data Flow

1. User enters API key (stored in localStorage via Zustand)
2. Dialogues stored in Zustand with auto-persist
3. Audio generation: check IndexedDB cache -> generate via SDK if miss -> cache result
4. Cache keys: `line:{text}:{voiceId}:{modelId}` or `dialogue:{hash}:{modelId}`

## Audio Modes

- **Fast Mode**: `eleven_flash_v2_5` via standard TTS API (rapid iteration)
- **Full Mode**: `eleven_v3` via Dialogue API (production quality)

## Notes

- API key never leaves browser except to ElevenLabs directly
- Audio tags like `[excited]` don't count toward character costs
- See `docs/SDK_FINDINGS.md` for ElevenLabs SDK documentation - this was developed and kept up to date during the project to help agents understand how to use the platform in detail
