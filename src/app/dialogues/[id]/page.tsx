"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useDialogueStore } from "@/stores/dialogueStore";
import { useElevenLabsVoices, useDialogueAudio } from "@/hooks";
import type { AudioTag, Speaker } from "@/types/dialogue";

import {
  DialogueEditorLayout,
  EditorHeader,
  SpeakersPanel,
  SpeakerEditDialog,
  ScriptPanel,
  ToolsPanel,
  BottomPreviewBar,
  ApiDevToolsDrawer,
} from "@/components/editor";
import type { SpeakerFormValues } from "@/components/editor";

export default function DialogueEditorPage() {
  const router = useRouter();
  const params = useParams();
  const dialogueId = params.id as string;

  // Store access
  const {
    getCurrentDialogue,
    setCurrentDialogue,
    updateDialogue,
    addSpeaker,
    updateSpeaker,
    removeSpeaker,
    addLine,
    updateLine,
    removeLine,
    apiKey,
  } = useDialogueStore();

  // Set current dialogue on mount
  React.useEffect(() => {
    setCurrentDialogue(dialogueId);
  }, [dialogueId, setCurrentDialogue]);

  const dialogue = getCurrentDialogue();

  // Shared hooks
  const { voices } = useElevenLabsVoices();

  // UI state
  const [mounted, setMounted] = React.useState(false);
  const [selectedLineId, setSelectedLineId] = React.useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = React.useState<number>(0);
  const [speakerDialogOpen, setSpeakerDialogOpen] = React.useState(false);
  const [editingSpeaker, setEditingSpeaker] = React.useState<Speaker | null>(null);
  const [isDevToolsOpen, setIsDevToolsOpen] = React.useState(false);
  const [modelMode, setModelMode] = React.useState<"fast" | "full">("full");

  // Persist model mode preference
  React.useEffect(() => {
    const saved = localStorage.getItem("dialogueEditor.modelMode");
    if (saved === "fast" || saved === "full") {
      setModelMode(saved);
    }
  }, []);

  const handleModelModeChange = (mode: "fast" | "full") => {
    setModelMode(mode);
    localStorage.setItem("dialogueEditor.modelMode", mode);
  };

  // Audio hook
  const {
    isGenerating,
    generatingLineId,
    audioUrl,
    generatedAudio,
    isDialogueCached,
    generateLine,
    generateAll,
    downloadAudio,
    audioRef,
  } = useDialogueAudio({
    apiKey,
    dialogue: dialogue ?? null,
    modelMode,
    onAutoPlay: () => {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.warn("Auto-play failed:", err);
        });
      }
    },
  });

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if dialogue not found (only after mounted)
  React.useEffect(() => {
    if (mounted && dialogueId && !dialogue) {
      toast.error("Dialogue not found");
      router.push("/");
    }
  }, [mounted, dialogue, dialogueId, router]);

  // Show loading until mounted and dialogue loaded
  if (!mounted || !dialogue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Speaker handlers
  const handleAddSpeaker = () => {
    setEditingSpeaker(null);
    setSpeakerDialogOpen(true);
  };

  const handleEditSpeaker = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setSpeakerDialogOpen(true);
  };

  const handleSpeakerSubmit = (values: SpeakerFormValues) => {
    if (editingSpeaker) {
      updateSpeaker(editingSpeaker.id, values);
      toast.success("Speaker updated");
    } else {
      addSpeaker(values.name, values.voiceId, values.color);
      toast.success("Speaker added");
    }
  };

  const handleRemoveSpeaker = () => {
    if (editingSpeaker) {
      removeSpeaker(editingSpeaker.id);
      setSpeakerDialogOpen(false);
      toast.success("Speaker removed");
    }
  };

  // Line handlers
  const handleAddLine = () => {
    if (dialogue.speakers.length === 0) {
      toast.error("Add a speaker first");
      return;
    }
    addLine(dialogue.speakers[0].id, "");
  };

  const handleChangeLineSpeaker = (lineId: string, speakerId: string) => {
    updateDialogue(dialogue.id, {
      lines: dialogue.lines.map((l) =>
        l.id === lineId ? { ...l, speakerId } : l
      ),
    });
  };

  const handleDeleteLine = (lineId: string) => {
    removeLine(lineId);
    toast.success("Line deleted");
  };

  // Cursor position handler
  const handleCursorChange = (lineId: string, position: number) => {
    if (lineId === selectedLineId) {
      setCursorPosition(position);
    }
  };

  // Tag handler - inserts at cursor position
  const handleApplyTag = (tag: AudioTag) => {
    if (!selectedLineId) return;

    const line = dialogue.lines.find((l) => l.id === selectedLineId);
    if (!line) return;

    const tagText = `[${tag.tag}]`;
    const pos = Math.min(cursorPosition, line.text.length);
    const before = line.text.slice(0, pos);
    const after = line.text.slice(pos);

    // Add space before tag if needed (not at start, not after space)
    const needsSpaceBefore = before.length > 0 && !before.endsWith(" ");
    // Add space after tag if needed (not at end, not before space)
    const needsSpaceAfter = after.length > 0 && !after.startsWith(" ");

    const newText = `${before}${needsSpaceBefore ? " " : ""}${tagText}${needsSpaceAfter ? " " : ""}${after}`;

    updateLine(selectedLineId, newText);

    // Update cursor position to after the inserted tag
    const newPos = pos + (needsSpaceBefore ? 1 : 0) + tagText.length + (needsSpaceAfter ? 1 : 0);
    setCursorPosition(newPos);

    toast.success(`Applied ${tag.displayName}`);
  };

  // Audio handlers
  const handleGenerateLine = () => {
    if (selectedLineId) {
      void generateLine(selectedLineId);
    }
  };

  const handleGenerateLineById = (lineId: string) => {
    void generateLine(lineId);
  };

  const handleGenerateAll = () => {
    void generateAll();
  };

  const handleDownload = () => {
    downloadAudio(dialogue.title);
  };

  // Title handler
  const handleTitleChange = (newTitle: string) => {
    updateDialogue(dialogue.id, { title: newTitle });
  };

  return (
    <DialogueEditorLayout
      header={
        <EditorHeader
          title={dialogue.title}
          onBack={() => router.push("/")}
          onSave={() => toast.success("Saved!")}
          onTitleChange={handleTitleChange}
          modelMode={modelMode}
          onModelModeChange={handleModelModeChange}
        />
      }
      left={
        <SpeakersPanel
          speakers={dialogue.speakers}
          voices={voices}
          onEditSpeaker={handleEditSpeaker}
          onAddSpeaker={handleAddSpeaker}
        />
      }
      center={
        <ScriptPanel
          dialogue={dialogue}
          selectedLineId={selectedLineId}
          generatingLineId={generatingLineId}
          isGenerating={isGenerating}
          disabled={!apiKey}
          onSelectLine={setSelectedLineId}
          onUpdateLine={updateLine}
          onChangeLineSpeaker={handleChangeLineSpeaker}
          onGenerateLine={handleGenerateLineById}
          onDeleteLine={handleDeleteLine}
          onAddLine={handleAddLine}
          onCursorChange={handleCursorChange}
        />
      }
      right={
        <ToolsPanel
          dialogue={dialogue}
          modelMode={modelMode}
          selectedLineId={selectedLineId}
          onApplyTag={handleApplyTag}
        />
      }
      devtools={
        <ApiDevToolsDrawer
          isOpen={isDevToolsOpen}
          onToggle={() => setIsDevToolsOpen(!isDevToolsOpen)}
          dialogue={dialogue}
        />
      }
      bottom={
        <BottomPreviewBar
          audioUrl={audioUrl}
          audioRef={audioRef}
          isGenerating={isGenerating}
          hasAudio={!!generatedAudio}
          hasSelectedLine={!!selectedLineId}
          hasLines={dialogue.lines.length > 0}
          isDialogueCached={isDialogueCached}
          disabled={!apiKey}
          onDownload={handleDownload}
          onGenerateLine={handleGenerateLine}
          onGenerateAll={handleGenerateAll}
        />
      }
      dialogs={
        <SpeakerEditDialog
          open={speakerDialogOpen}
          onOpenChange={setSpeakerDialogOpen}
          speaker={editingSpeaker}
          voices={voices}
          canRemove={dialogue.speakers.length > 1}
          onSubmit={handleSpeakerSubmit}
          onRemove={handleRemoveSpeaker}
        />
      }
    />
  );
}
