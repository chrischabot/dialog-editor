import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Dialogue, Speaker, DialogueLine, ElevenLabsVoice } from '@/types/dialogue';
import { DEFAULT_SPEAKER_COLORS } from '@/types/dialogue';

interface DialogueState {
  // State
  dialogues: Dialogue[];
  currentDialogueId: string | null;
  apiKey: string | null;
  voices: ElevenLabsVoice[];
  isApiKeyValid: boolean;
  isLoadingVoices: boolean;

  // Actions for dialogues
  createDialogue: (title: string, description?: string) => string;
  updateDialogue: (id: string, updates: Partial<Dialogue>) => void;
  deleteDialogue: (id: string) => void;
  setCurrentDialogue: (id: string | null) => void;
  getCurrentDialogue: () => Dialogue | null;

  // Actions for speakers (on current dialogue)
  addSpeaker: (name: string, voiceId: string, color?: string) => void;
  updateSpeaker: (speakerId: string, updates: Partial<Speaker>) => void;
  removeSpeaker: (speakerId: string) => void;

  // Actions for lines (on current dialogue)
  addLine: (speakerId: string, text?: string) => void;
  updateLine: (lineId: string, text: string) => void;
  removeLine: (lineId: string) => void;
  reorderLines: (fromIndex: number, toIndex: number) => void;
  setLineGenerating: (lineId: string, isGenerating: boolean) => void;
  setLineAudio: (lineId: string, audioUrl: string) => void;

  // Actions for API
  setApiKey: (key: string) => void;
  setApiKeyValid: (valid: boolean) => void;
  setVoices: (voices: ElevenLabsVoice[]) => void;
  setLoadingVoices: (loading: boolean) => void;
}

// Helper function to generate speaker colors
const SPEAKER_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

const getNextSpeakerColor = (existingSpeakers: Speaker[]): string => {
  const usedColors = new Set(existingSpeakers.map((s) => s.color));
  const availableColor = SPEAKER_COLORS.find((c) => !usedColors.has(c));
  return availableColor || SPEAKER_COLORS[existingSpeakers.length % SPEAKER_COLORS.length];
};

export const useDialogueStore = create<DialogueState>()(
  persist(
    (set, get) => ({
      // Initial state
      dialogues: [],
      currentDialogueId: null,
      apiKey: null,
      voices: [],
      isApiKeyValid: false,
      isLoadingVoices: false,

      // Dialogue actions
      createDialogue: (title: string, description?: string) => {
        // Create 2 default speakers for new dialogues
        const defaultSpeakers: Speaker[] = [
          {
            id: uuidv4(),
            name: 'Speaker 1',
            voiceId: '',
            color: DEFAULT_SPEAKER_COLORS[0] as string,
          },
          {
            id: uuidv4(),
            name: 'Speaker 2',
            voiceId: '',
            color: DEFAULT_SPEAKER_COLORS[1] as string,
          },
        ];

        const newDialogue: Dialogue = {
          id: uuidv4(),
          title,
          description,
          speakers: defaultSpeakers,
          lines: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          dialogues: [...state.dialogues, newDialogue],
          currentDialogueId: newDialogue.id,
        }));

        return newDialogue.id;
      },

      updateDialogue: (id: string, updates: Partial<Dialogue>) => {
        set((state) => ({
          dialogues: state.dialogues.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          ),
        }));
      },

      deleteDialogue: (id: string) => {
        set((state) => ({
          dialogues: state.dialogues.filter((d) => d.id !== id),
          currentDialogueId: state.currentDialogueId === id ? null : state.currentDialogueId,
        }));
      },

      setCurrentDialogue: (id: string | null) => {
        set({ currentDialogueId: id });
      },

      getCurrentDialogue: () => {
        const state = get();
        return state.dialogues.find((d) => d.id === state.currentDialogueId) || null;
      },

      // Speaker actions
      addSpeaker: (name: string, voiceId: string, color?: string) => {
        const currentDialogue = get().getCurrentDialogue();
        if (!currentDialogue) return;

        const newSpeaker: Speaker = {
          id: uuidv4(),
          name,
          voiceId,
          color: color ?? getNextSpeakerColor(currentDialogue.speakers),
        };

        get().updateDialogue(currentDialogue.id, {
          speakers: [...currentDialogue.speakers, newSpeaker],
        });
      },

      updateSpeaker: (speakerId: string, updates: Partial<Speaker>) => {
        const currentDialogue = get().getCurrentDialogue();
        if (!currentDialogue) return;

        get().updateDialogue(currentDialogue.id, {
          speakers: currentDialogue.speakers.map((s) =>
            s.id === speakerId ? { ...s, ...updates } : s
          ),
        });
      },

      removeSpeaker: (speakerId: string) => {
        const currentDialogue = get().getCurrentDialogue();
        if (!currentDialogue) return;

        get().updateDialogue(currentDialogue.id, {
          speakers: currentDialogue.speakers.filter((s) => s.id !== speakerId),
          lines: currentDialogue.lines.filter((l) => l.speakerId !== speakerId),
        });
      },

      // Line actions
      addLine: (speakerId: string, text: string = '') => {
        const currentDialogue = get().getCurrentDialogue();
        if (!currentDialogue) return;

        const newLine: DialogueLine = {
          id: uuidv4(),
          speakerId,
          text,
          tags: [],
          isGenerating: false,
        };

        get().updateDialogue(currentDialogue.id, {
          lines: [...currentDialogue.lines, newLine],
        });
      },

      updateLine: (lineId: string, text: string) => {
        const currentDialogue = get().getCurrentDialogue();
        if (!currentDialogue) return;

        get().updateDialogue(currentDialogue.id, {
          lines: currentDialogue.lines.map((l) => (l.id === lineId ? { ...l, text } : l)),
        });
      },

      removeLine: (lineId: string) => {
        const currentDialogue = get().getCurrentDialogue();
        if (!currentDialogue) return;

        get().updateDialogue(currentDialogue.id, {
          lines: currentDialogue.lines.filter((l) => l.id !== lineId),
        });
      },

      reorderLines: (fromIndex: number, toIndex: number) => {
        const currentDialogue = get().getCurrentDialogue();
        if (!currentDialogue) return;

        const lines = [...currentDialogue.lines];
        const [movedLine] = lines.splice(fromIndex, 1);
        lines.splice(toIndex, 0, movedLine);

        get().updateDialogue(currentDialogue.id, { lines });
      },

      setLineGenerating: (lineId: string, isGenerating: boolean) => {
        const currentDialogue = get().getCurrentDialogue();
        if (!currentDialogue) return;

        get().updateDialogue(currentDialogue.id, {
          lines: currentDialogue.lines.map((l) =>
            l.id === lineId ? { ...l, isGenerating } : l
          ),
        });
      },

      setLineAudio: (lineId: string, audioUrl: string) => {
        const currentDialogue = get().getCurrentDialogue();
        if (!currentDialogue) return;

        get().updateDialogue(currentDialogue.id, {
          lines: currentDialogue.lines.map((l) =>
            l.id === lineId ? { ...l, generatedAudio: audioUrl } : l
          ),
        });
      },

      // API actions
      setApiKey: (key: string) => {
        set({ apiKey: key });
      },

      setApiKeyValid: (valid: boolean) => {
        set({ isApiKeyValid: valid });
      },

      setVoices: (voices: ElevenLabsVoice[]) => {
        set({ voices });
      },

      setLoadingVoices: (loading: boolean) => {
        set({ isLoadingVoices: loading });
      },
    }),
    {
      name: 'dialogue-director-storage',
      partialize: (state) => ({
        dialogues: state.dialogues,
        currentDialogueId: state.currentDialogueId,
        // Persist API key in localStorage (stays local to browser)
        apiKey: state.apiKey,
      }),
    }
  )
);
