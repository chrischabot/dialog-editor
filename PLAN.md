# Dialogue Director - Implementation Plan

> A visual composition tool for ElevenLabs v3's Text to Dialogue API with audio tags

## Project Overview

**Goal:** Build an interactive web application that helps developers visually compose multi-speaker dialogues using ElevenLabs' v3 model and audio tags—solving real pain points around iteration, learning curve, and cost visibility.

**Target Timeline:** Weekend build with Claude Code assistance

**Stack:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## Developer Pain Points We're Solving

| Pain Point | How Dialogue Director Addresses It |
|------------|-----------------------------------|
| No preview before spending credits | Per-line preview with cost estimation before generation |
| Thin documentation for audio tags | Interactive tag palette with descriptions and examples |
| Learning curve for API JSON structure | Live JSON preview showing exact payload format |
| Iteration is expensive | Granular preview (single lines vs full dialogue) |
| No tools for Text to Dialogue API | First visual composer for this endpoint |
| Understanding which tags work together | Categorized tags with compatibility hints |

---

## Phase 0: SDK Investigation & Documentation

**IMPORTANT:** Before writing any feature code, investigate the ElevenLabs JavaScript SDK thoroughly. Document all findings in `/docs/SDK_FINDINGS.md`.

### Investigation Tasks

```bash
# 1. Install and explore the SDK
npm install elevenlabs

# 2. Check SDK source/types for:
#    - Text to Speech endpoint signatures
#    - Text to Dialogue endpoint (if exists)
#    - Streaming vs non-streaming options
#    - Voice listing/management
#    - Model IDs and options
```

### Questions to Answer

- [ ] Does the JS SDK support Text to Dialogue, or REST only?
- [ ] What's the exact payload format for v3 with audio tags?
- [ ] How does streaming work for multi-speaker output?
- [ ] What voice IDs are available by default?
- [ ] Are there SDK methods for cost estimation?
- [ ] What errors/edge cases does the SDK surface?

### SDK Findings Template

Create `/docs/SDK_FINDINGS.md` with this structure:

```markdown
# ElevenLabs SDK Findings

## SDK Version
- Package: `elevenlabs` v[X.X.X]
- Documentation: [link]

## Text to Dialogue Support
- [ ] Native SDK support exists
- [ ] REST API only (need custom implementation)
- Endpoint: `POST /v1/text-to-dialogue` (verify)

## v3 Model Details
- Model ID: `eleven_v3` (verify)
- Audio tags syntax: `[tag]text[/tag]` or `[tag]` inline?
- Supported tags discovered: [list]

## Voice Management
- Default voices available: [list with IDs]
- Custom voice creation: [notes]

## Streaming Behavior
- Single speaker streaming: [works/doesn't work]
- Multi-speaker streaming: [behavior notes]

## Error Handling
- Common errors encountered: [list]
- Rate limiting behavior: [notes]

## Code Snippets
[Include working examples discovered during investigation]

## Gotchas & Workarounds
[Document any SDK bugs or unexpected behaviors]
```

---

## Phase 1: Project Setup & Core Architecture

### 1.1 Initialize Project

```bash
# Create Vite React TypeScript project
npm create vite@latest dialogue-director -- --template react-ts
cd dialogue-director

# Install dependencies
npm install elevenlabs
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tabs @radix-ui/react-tooltip
npm install class-variance-authority clsx tailwind-merge
npm install zustand  # lightweight state management
npm install sonner   # toast notifications

# Initialize Tailwind
npx tailwindcss init -p
```

### 1.2 Project Structure

```
dialogue-director/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── SpeakerPanel/    # Speaker management
│   │   ├── ScriptEditor/    # Main dialogue editing
│   │   ├── TagPalette/      # Audio tag selection
│   │   ├── PreviewPane/     # Audio playback
│   │   ├── JsonPreview/     # API payload display
│   │   └── CostEstimator/   # Credit estimation
│   ├── hooks/
│   │   ├── useElevenLabs.ts # API integration
│   │   ├── useDialogue.ts   # Dialogue state
│   │   └── useAudioPlayer.ts
│   ├── lib/
│   │   ├── elevenlabs/      # SDK wrappers
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── dialogue.ts
│   │   ├── audioTags.ts     # Tag definitions
│   │   └── templates.ts     # Example dialogues
│   ├── stores/
│   │   └── dialogueStore.ts # Zustand store
│   └── types/
│       └── dialogue.ts      # TypeScript types
├── docs/
│   ├── SDK_FINDINGS.md      # SDK investigation notes
│   └── AUDIO_TAGS.md        # Comprehensive tag reference
└── public/
    └── examples/            # Sample audio outputs
```

### 1.3 Core Types

```typescript
// src/types/dialogue.ts

export interface Speaker {
  id: string;
  name: string;
  voiceId: string;
  color: string;  // For UI differentiation
}

export interface AudioTag {
  id: string;
  tag: string;           // e.g., "whispers"
  displayName: string;   // e.g., "Whispers"
  category: TagCategory;
  description: string;
  example: string;
  syntax: 'wrap' | 'inline';  // [whispers]text[/whispers] vs [laughs]
}

export type TagCategory = 
  | 'emotion'           // excited, nervous, sad
  | 'delivery'          // whispers, shouts, sarcastically  
  | 'character'         // British accent, pirate voice
  | 'narrative'         // pause, interrupting
  | 'sound'             // laughs, sighs, clears throat

export interface DialogueLine {
  id: string;
  speakerId: string;
  text: string;
  tags: AppliedTag[];
  generatedAudio?: Blob;
  isGenerating?: boolean;
}

export interface AppliedTag {
  tagId: string;
  startIndex: number;
  endIndex: number;  // -1 for inline tags like [laughs]
}

export interface Dialogue {
  id: string;
  title: string;
  speakers: Speaker[];
  lines: DialogueLine[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Phase 2: Audio Tag System

### 2.1 Tag Definitions

Create comprehensive tag catalog based on ElevenLabs documentation:

```typescript
// src/lib/audioTags.ts

export const AUDIO_TAGS: AudioTag[] = [
  // Emotional States
  {
    id: 'excited',
    tag: 'excited',
    displayName: 'Excited',
    category: 'emotion',
    description: 'Delivers text with enthusiasm and energy',
    example: '[excited]I can\'t believe we won![/excited]',
    syntax: 'wrap'
  },
  {
    id: 'nervous',
    tag: 'nervous', 
    displayName: 'Nervous',
    category: 'emotion',
    description: 'Adds hesitation and anxiety to delivery',
    example: '[nervous]Are you sure this is safe?[/nervous]',
    syntax: 'wrap'
  },
  // ... more emotions: sad, angry, happy, resigned, curious
  
  // Delivery Style
  {
    id: 'whispers',
    tag: 'whispers',
    displayName: 'Whispers',
    category: 'delivery',
    description: 'Quiet, secretive delivery',
    example: '[whispers]Don\'t let them hear us[/whispers]',
    syntax: 'wrap'
  },
  {
    id: 'sarcastically',
    tag: 'sarcastically',
    displayName: 'Sarcastically',
    category: 'delivery', 
    description: 'Ironic, mocking tone',
    example: '[sarcastically]Oh, that\'s just perfect[/sarcastically]',
    syntax: 'wrap'
  },
  // ... more: shouts, mumbles, sings
  
  // Character Voices
  {
    id: 'british-accent',
    tag: 'British accent',
    displayName: 'British Accent',
    category: 'character',
    description: 'British English pronunciation and cadence',
    example: '[British accent]Lovely weather we\'re having[/British accent]',
    syntax: 'wrap'
  },
  {
    id: 'pirate-voice',
    tag: 'pirate voice',
    displayName: 'Pirate Voice',
    category: 'character',
    description: 'Stereotypical pirate speech patterns',
    example: '[pirate voice]Ahoy, matey![/pirate voice]',
    syntax: 'wrap'
  },
  // ... more: French accent, robot voice, elderly voice
  
  // Inline Sound Effects
  {
    id: 'laughs',
    tag: 'laughs',
    displayName: 'Laughs',
    category: 'sound',
    description: 'Inserts laughter',
    example: 'That\'s hilarious! [laughs]',
    syntax: 'inline'
  },
  {
    id: 'sighs',
    tag: 'sighs',
    displayName: 'Sighs',
    category: 'sound',
    description: 'Inserts an audible sigh',
    example: '[sighs] I suppose you\'re right.',
    syntax: 'inline'
  },
  // ... more: clears throat, gasps, coughs
  
  // Narrative Control
  {
    id: 'pause',
    tag: 'pause',
    displayName: 'Pause',
    category: 'narrative',
    description: 'Inserts a dramatic pause',
    example: 'The winner is... [pause] you!',
    syntax: 'inline'
  },
  {
    id: 'interrupting',
    tag: 'interrupting',
    displayName: 'Interrupting',
    category: 'narrative',
    description: 'Cuts off abruptly (for multi-speaker)',
    example: '[interrupting]Wait, stop!',
    syntax: 'wrap'
  }
];

export const TAG_CATEGORIES: Record<TagCategory, { label: string; icon: string }> = {
  emotion: { label: 'Emotions', icon: 'Heart' },
  delivery: { label: 'Delivery Style', icon: 'Mic' },
  character: { label: 'Character Voices', icon: 'User' },
  sound: { label: 'Sound Effects', icon: 'Volume2' },
  narrative: { label: 'Narrative Control', icon: 'Clock' }
};
```

### 2.2 Tag Application Logic

```typescript
// src/lib/tagUtils.ts

export function applyTagToText(
  text: string, 
  tag: AudioTag, 
  selection?: { start: number; end: number }
): string {
  if (tag.syntax === 'inline') {
    // Insert at cursor or end
    const insertPos = selection?.start ?? text.length;
    return text.slice(0, insertPos) + ` [${tag.tag}] ` + text.slice(insertPos);
  }
  
  if (selection && selection.start !== selection.end) {
    // Wrap selected text
    const before = text.slice(0, selection.start);
    const selected = text.slice(selection.start, selection.end);
    const after = text.slice(selection.end);
    return `${before}[${tag.tag}]${selected}[/${tag.tag}]${after}`;
  }
  
  // Wrap entire text
  return `[${tag.tag}]${text}[/${tag.tag}]`;
}

export function parseTagsFromText(text: string): { 
  plainText: string; 
  tags: Array<{ tag: string; start: number; end: number }> 
} {
  // Parse and extract tag positions for highlighting
  // Implementation details...
}

export function estimateCharacterCount(text: string): number {
  // Remove tag markup, count actual spoken characters
  const withoutTags = text.replace(/\[[\w\s]+\]/g, '').replace(/\[\/[\w\s]+\]/g, '');
  return withoutTags.length;
}
```

---

## Phase 3: ElevenLabs Integration

### 3.1 API Client Setup

```typescript
// src/lib/elevenlabs/client.ts

import { ElevenLabsClient } from 'elevenlabs';

// Client-side: API key from environment or user input
let client: ElevenLabsClient | null = null;

export function initializeClient(apiKey: string) {
  client = new ElevenLabsClient({ apiKey });
  return client;
}

export function getClient(): ElevenLabsClient {
  if (!client) {
    throw new Error('ElevenLabs client not initialized. Please enter your API key.');
  }
  return client;
}

// Alternative: Proxy through backend to hide API key
// For demo purposes, we'll use client-side with user-provided key
```

### 3.2 Text to Speech Integration

```typescript
// src/lib/elevenlabs/tts.ts

interface GenerateLineOptions {
  text: string;
  voiceId: string;
  modelId?: string;
}

export async function generateLine(options: GenerateLineOptions): Promise<Blob> {
  const { text, voiceId, modelId = 'eleven_v3' } = options;
  const client = getClient();
  
  // Investigation needed: exact method signature
  // This is a starting point - update based on SDK findings
  const response = await client.textToSpeech.convert(voiceId, {
    text,
    model_id: modelId,
    // Additional v3 options?
  });
  
  // Handle streaming response
  const chunks: Uint8Array[] = [];
  for await (const chunk of response) {
    chunks.push(chunk);
  }
  
  return new Blob(chunks, { type: 'audio/mpeg' });
}
```

### 3.3 Text to Dialogue Integration (Requires Investigation)

```typescript
// src/lib/elevenlabs/dialogue.ts

// NOTE: This is speculative - needs SDK investigation
// The Text to Dialogue API may require direct REST calls

interface DialogueTurn {
  text: string;
  voice_id: string;
}

interface GenerateDialogueOptions {
  turns: DialogueTurn[];
  modelId?: string;
}

export async function generateDialogue(options: GenerateDialogueOptions): Promise<Blob> {
  // TODO: Investigate if SDK supports this or if we need REST
  
  // REST fallback approach:
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-dialogue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': getApiKey()
    },
    body: JSON.stringify({
      model_id: options.modelId || 'eleven_v3',
      dialogue: options.turns
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.message || 'Failed to generate dialogue');
  }
  
  return response.blob();
}

// Document findings about this endpoint in SDK_FINDINGS.md
```

### 3.4 Voice Listing

```typescript
// src/lib/elevenlabs/voices.ts

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
}

export async function getVoices(): Promise<Voice[]> {
  const client = getClient();
  const response = await client.voices.getAll();
  return response.voices;
}

// Cache voices to avoid repeated API calls
let voicesCache: Voice[] | null = null;

export async function getCachedVoices(): Promise<Voice[]> {
  if (!voicesCache) {
    voicesCache = await getVoices();
  }
  return voicesCache;
}
```

---

## Phase 4: Core UI Components

### 4.1 Component Hierarchy

```
<App>
├── <Header>
│   ├── <ProjectTitle>
│   ├── <ApiKeyInput>
│   └── <ExportMenu>
├── <MainLayout>
│   ├── <SpeakerPanel>          # Left sidebar
│   │   ├── <SpeakerCard>
│   │   └── <AddSpeakerButton>
│   ├── <ScriptEditor>          # Center
│   │   ├── <DialogueLine>
│   │   │   ├── <SpeakerIndicator>
│   │   │   ├── <TextEditor>
│   │   │   ├── <TagChips>
│   │   │   └── <LineActions>
│   │   └── <AddLineButton>
│   └── <RightPanel>            # Right sidebar
│       ├── <TagPalette>
│       ├── <JsonPreview>
│       └── <CostEstimator>
└── <PreviewPane>               # Bottom
    ├── <AudioPlayer>
    ├── <GenerateButton>
    └── <DownloadButton>
```

### 4.2 Key Component Specs

#### SpeakerPanel
- List of speakers with color-coded avatars
- Click to edit name/voice
- Voice selector dropdown with preview playback
- Add/remove speakers
- Minimum 2 speakers for dialogue

#### ScriptEditor  
- Vertical list of dialogue lines
- Each line shows speaker name, text content, applied tags
- Inline text editing with tag insertion
- Drag to reorder lines
- Click tag chips to remove
- "Preview line" button for per-line generation

#### TagPalette
- Categorized accordion of available tags
- Click tag to apply to selected text/line
- Hover for description and example
- Search/filter tags
- Visual distinction between wrap vs inline tags

#### JsonPreview
- Real-time display of API payload
- Syntax highlighted JSON
- Copy button
- Toggle between "Readable" and "Minified"

#### CostEstimator
- Character count (excluding tag markup)
- Estimated credits based on model
- Warning at high character counts
- Link to ElevenLabs pricing

---

## Phase 5: State Management

### 5.1 Zustand Store

```typescript
// src/stores/dialogueStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DialogueState {
  // Data
  dialogue: Dialogue;
  apiKey: string | null;
  voices: Voice[];
  
  // UI State
  selectedLineId: string | null;
  selectedText: { start: number; end: number } | null;
  isGenerating: boolean;
  generatedAudio: Blob | null;
  
  // Actions
  setApiKey: (key: string) => void;
  setVoices: (voices: Voice[]) => void;
  
  addSpeaker: (name: string, voiceId: string) => void;
  updateSpeaker: (id: string, updates: Partial<Speaker>) => void;
  removeSpeaker: (id: string) => void;
  
  addLine: (speakerId: string) => void;
  updateLine: (id: string, text: string) => void;
  removeLine: (id: string) => void;
  reorderLines: (fromIndex: number, toIndex: number) => void;
  
  applyTag: (lineId: string, tag: AudioTag) => void;
  removeTag: (lineId: string, tagIndex: number) => void;
  
  setSelectedLine: (id: string | null) => void;
  setSelectedText: (selection: { start: number; end: number } | null) => void;
  
  generateLinePreview: (lineId: string) => Promise<void>;
  generateFullDialogue: () => Promise<void>;
  
  loadTemplate: (templateId: string) => void;
  exportAsJson: () => string;
  reset: () => void;
}

export const useDialogueStore = create<DialogueState>()(
  persist(
    (set, get) => ({
      // Initial state
      dialogue: createEmptyDialogue(),
      apiKey: null,
      voices: [],
      selectedLineId: null,
      selectedText: null,
      isGenerating: false,
      generatedAudio: null,
      
      // Implementation of actions...
    }),
    {
      name: 'dialogue-director-storage',
      partialize: (state) => ({ 
        dialogue: state.dialogue,
        apiKey: state.apiKey 
      })
    }
  )
);
```

---

## Phase 6: Templates & Examples

### 6.1 Built-in Templates

```typescript
// src/lib/templates.ts

export const TEMPLATES = {
  'podcast-intro': {
    title: 'Podcast Introduction',
    description: 'Two hosts introducing a tech podcast episode',
    speakers: [
      { name: 'Alex', voiceId: 'default_male_1' },
      { name: 'Jordan', voiceId: 'default_female_1' }
    ],
    lines: [
      { speaker: 'Alex', text: '[excited]Welcome back to Tech Talk, everyone![/excited]' },
      { speaker: 'Jordan', text: 'I\'m Jordan, and today we have an amazing episode.' },
      { speaker: 'Alex', text: '[whispers]Should we tell them about the special guest?[/whispers]' },
      { speaker: 'Jordan', text: '[laughs] Not yet! Let\'s build some suspense first.' }
    ]
  },
  'game-cutscene': {
    title: 'Game Cutscene',
    description: 'Dramatic confrontation between hero and villain',
    // ...
  },
  'audiobook-chapter': {
    title: 'Audiobook Dialogue',
    description: 'Novel excerpt with narrator and character voices',
    // ...
  },
  'customer-support': {
    title: 'Support Call Demo',
    description: 'AI agent and customer interaction',
    // ...
  }
};
```

---

## Phase 7: Testing & Polish

### 7.1 Manual Testing Checklist

- [ ] API key validation and error handling
- [ ] Voice loading and caching
- [ ] Tag application (wrap and inline)
- [ ] Per-line preview generation
- [ ] Full dialogue generation
- [ ] Audio playback controls
- [ ] JSON export accuracy
- [ ] Cost estimation accuracy
- [ ] Template loading
- [ ] State persistence (page reload)
- [ ] Mobile responsiveness
- [ ] Error states and recovery

### 7.2 Edge Cases to Handle

- Empty lines (should skip in generation)
- Very long text (warn about cost)
- API rate limiting (show clear error)
- Network failures (retry option)
- Invalid tag combinations (if any)
- Missing voice ID (fallback to default)

---

## Phase 8: Deployment & Documentation

### 8.1 Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel (recommended)
npx vercel

# Or deploy to Netlify
npx netlify deploy --prod
```

### 8.2 README Structure

```markdown
# Dialogue Director

A visual composition tool for ElevenLabs v3 Text to Dialogue API

## Features
- Visual dialogue composition
- Audio tag palette with examples
- Per-line preview generation
- Live JSON payload preview
- Cost estimation before generation
- Template library

## Getting Started
[Setup instructions]

## API Reference
[Link to SDK findings doc]

## Architecture
[Brief technical overview]

## Contributing
[Guidelines]

## License
MIT
```

### 8.3 DevRel Artifacts to Create

After building, create these supporting materials:

1. **Blog Post Draft:** "Building a Visual Composer for ElevenLabs v3 Audio Tags"
2. **SDK Findings Doc:** Comprehensive documentation of API behavior
3. **Video Script:** 3-minute demo walkthrough
4. **Twitter Thread:** Key learnings and screenshots

---

## Implementation Order (Weekend Schedule)

### Saturday Morning (4 hours)
1. Project setup and dependencies
2. SDK investigation - document findings
3. Core types and state management
4. Basic layout with placeholder components

### Saturday Afternoon (4 hours)  
5. Tag system implementation
6. Speaker panel component
7. Script editor component
8. ElevenLabs integration (TTS)

### Sunday Morning (4 hours)
9. Tag palette component
10. JSON preview component
11. Cost estimator
12. Per-line preview generation

### Sunday Afternoon (4 hours)
13. Full dialogue generation
14. Templates and examples
15. Polish and error handling
16. Deployment and README

---

## Success Metrics

The project succeeds if:

✅ Developers can compose dialogues visually without writing JSON  
✅ Audio tags are discoverable and self-documenting  
✅ Cost is visible before spending credits  
✅ Generated JSON can be copy-pasted into their own code  
✅ The tool teaches ElevenLabs API patterns through use  
✅ SDK documentation captures real developer learnings

---

## Notes for Claude Code Sessions

When working with Claude Code on this project:

1. **Start each session** by reviewing this PLAN.md and SDK_FINDINGS.md
2. **Document surprises** - any SDK behavior that differs from docs
3. **Commit frequently** with descriptive messages
4. **Test incrementally** - verify each integration point works
5. **Prioritize core loop** - composition → preview → iterate

The goal is a polished demo that shows DevRel thinking, not feature completeness. Better to have 3 features that work beautifully than 10 that are rough.
