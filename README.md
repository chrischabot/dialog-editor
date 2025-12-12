# Dialogue Director

*Where conversations come to life, and your wallet doesn't cry.*

A visual dialogue editor for the ElevenLabs Text to Dialogue API that transforms the tedious art of multi-speaker audio generation into something approaching joy. Built for developers, writers, and anyone who's ever stared at a JSON payload wondering why their characters sound like caffeinated robots.

## The Problem We're Solving

Creating multi-speaker dialogue with AI voices is expensive. Not "skip-your-latte" expensive—more like "explain-this-to-accounting" expensive. Every generation costs credits, and when you're iterating on tone, timing, and emotional delivery, those credits vanish faster than free pizza at a standup.

**Dialogue Director** is your frugal companion in this endeavor.

## Features

### Two Modes, One Mission: Save Your Credits

- **Fast Mode** — Uses `eleven_flash_v2_5` via the standard TTS API at **half the credit cost**. Perfect for rapid iteration when you're still figuring out if your villain should sound menacing or just mildly annoyed.

- **Full Mode** — Unleashes `eleven_v3` through the Dialogue API for that buttery-smooth conversational flow. Natural interruptions, emotional nuance, the works. Save this for when the script is locked.

### Audio Caching That Actually Remembers

Every generated audio clip gets cached in **IndexedDB**—right there in your browser, persisting across sessions like a loyal golden retriever. Change your text? The cache invalidates automatically. Same text, same voice, same model? Instant playback, zero credits spent.

The cache uses content-based keys (`text:voiceId:modelId`), so it's smart about what's actually changed. Clips expire after 48 hours, because even loyalty has its limits.

When your full dialogue is cached, the "Generate All" button transforms into "Play All"—a small UX flourish that saves you from accidentally regenerating a $5 audio file.

### Developer Tools That Don't Insult Your Intelligence

Pop open the DevTools drawer (it's resizable, because we respect your screen real estate) and you'll find:

- **Network Tab** — Every API request and response, timestamped and color-coded. See exactly what's going over the wire.
- **Logs Tab** — SDK activity, debug messages, warnings. The stuff you need when things go sideways.
- **Payload Tab** — The actual JSON being sent to ElevenLabs, formatted or minified. Copy it, paste it into curl, debug at 2 AM. We don't judge.

### Audio Tags Made Visual

The Tag Palette puts ElevenLabs' audio tag system at your fingertips. Emotions, delivery styles, sound effects, accents—click to insert, no syntax memorization required.

```
[excited] I can't believe we won!
[whispers] Don't tell anyone, but...
[laughs] That's the funniest thing I've heard all day!
```

### Cost Estimation That Doesn't Lie

See your character count and estimated credit cost before you hit generate. The estimator knows that audio tags don't count toward credits (they're instructions, not content), so your numbers are actually accurate.

## Tech Stack

Built with the modern web stack that makes developers happy:

- **Next.js 16** — React 19, App Router, the whole shebang
- **TypeScript** — Because `any` is not a personality
- **Tailwind CSS v4** — Utility-first styling that doesn't make you hate CSS
- **Zustand** — State management that stays out of your way, with `persist` middleware for localStorage
- **IndexedDB** — Browser-native storage for audio blobs. No server required, no data leaving your machine
- **Radix UI** — Accessible primitives that don't look like 2012
- **ElevenLabs SDK** — `@elevenlabs/elevenlabs-js` v2.27.0, the official package

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

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home dashboard
│   └── dialogues/[id]/    # Dialogue editor
├── components/ui/          # Reusable UI components
├── lib/
│   ├── elevenlabs/        # SDK wrapper and logger
│   └── audioCache.ts      # IndexedDB caching layer
├── stores/
│   └── dialogueStore.ts   # Zustand state management
└── types/
    └── dialogue.ts        # TypeScript interfaces
```

## How the Caching Works

```typescript
// Cache key structure
const lineKey = `line:${text}:${voiceId}:${modelId}`;
const dialogueKey = `dialogue:${JSON.stringify(lineData)}:${modelId}`;

// Check cache before generating
const cached = await getCachedAudio(cacheKey);
if (cached) {
  return cached; // Free! (in credits, anyway)
}

// Generate and cache
const audio = await generateDialogue(inputs, options);
await setCachedAudio(cacheKey, audio);
```

## API Reference

See [docs/SDK_FINDINGS.md](docs/SDK_FINDINGS.md) for exhaustive documentation on the ElevenLabs SDK, including gotchas, workarounds, and hard-won wisdom from the trenches.

## Contributing

Found a bug? Want a feature? Open an issue. PRs welcome—just keep the code clean and the jokes cleaner.

## License

MIT. Use it, fork it, make it your own. Just don't blame us when your characters start having existential crises.

---

*"The difference between the right word and the almost right word is the difference between lightning and a lightning bug."* — Mark Twain

*"The difference between the right voice and the almost right voice is the difference between a $0.50 generation and a $50 debugging session."* — Dialogue Director Proverb
