# Dialogue Director

*Where conversations come to life.*

A visual dialogue editor for the ElevenLabs Text to Dialogue API that transforms multi-speaker audio generation into an intuitive, iterative workflow. Built for developers, writers, and content creators who want to get the most out of ElevenLabs' powerful voice synthesis.

## The Problem We're Solving

Creating great dialogue takes iteration. You tweak the wording, adjust the emotional delivery, experiment with different voices—and each generation teaches you something new about what works. **Dialogue Director** is designed to make that creative iteration as fast and efficient as possible, so you can focus on crafting the perfect scene rather than managing API calls.

Think of it as a development environment purpose-built for the Text to Dialogue API.

## Features

### Two Generation Modes

- **Fast Mode** — Uses `eleven_flash_v2_5` via the standard TTS API for rapid iteration. Great for drafting and experimenting.

- **Full Mode** — Uses `eleven_v3` through the Dialogue API for natural conversational flow with interruptions and emotional nuance. Use this for production quality.

### Local Audio Caching

Generated audio clips are cached locally in your browser, persisting across sessions. Change your text? The cache invalidates automatically. Same text, same voice, same model? Instant playback, zero credits spent.

The cache uses content-based keys (`text:voiceId:modelId`), so it knows exactly what's changed. Clips expire after 48 hours.

When your full dialogue is cached, the "Generate All" button transforms into "Play All" to prevent accidental regeneration.

### Developer Tools Panel

A resizable DevTools drawer with:

- **Network Tab** — API requests and responses, timestamped and color-coded.
- **Logs Tab** — SDK activity, debug messages, and warnings.
- **Payload Tab** — The JSON payload being sent to ElevenLabs, formatted or minified. Copy it for use in your own code.

### Audio Tag Palette

The Tag Palette provides easy access to ElevenLabs' audio tag system. Emotions, delivery styles, sound effects, accents—click to insert.

```
[excited] I can't believe we won!
[whispers] Don't tell anyone, but...
[laughs] That's the funniest thing I've heard all day!
```

### Cost Estimation

See your character count and estimated credit cost before generating. Audio tags don't count toward credits (they're instructions, not content), so the estimates are accurate.

## Getting Started

### Prerequisites

- Node.js 18+
- An ElevenLabs API key (grab one at [elevenlabs.io](https://elevenlabs.io))

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/eleven-dialog-editor.git
cd eleven-dialog-editor

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter your API key when prompted. Your key stays in localStorage—we never send it anywhere except directly to ElevenLabs.

### Building for Production

```bash
npm run build
npm start
```

## How the Caching Works

```typescript
// Cache key structure
const lineKey = `line:${text}:${voiceId}:${modelId}`;
const dialogueKey = `dialogue:${JSON.stringify(lineData)}:${modelId}`;

// Check cache before generating
const cached = await getCachedAudio(cacheKey);
if (cached) {
  return cached; // No API call needed
}

// Generate and cache
const audio = await generateDialogue(inputs, options);
await setCachedAudio(cacheKey, audio);
```

## API Reference

See [docs/SDK_FINDINGS.md](docs/SDK_FINDINGS.md) — developed and maintained during the project to help AI coding agents (like Claude or Codex) understand the ElevenLabs SDK based on real-world learnings.

## Contributing

Found a bug? Want a feature? Open an issue. PRs welcome.

## License

MIT. See [LICENSE](LICENSE) for details.
