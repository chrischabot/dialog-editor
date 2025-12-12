'use client';

import { useRef, useCallback, useState } from 'react';
import { Play, Trash2, Plus, GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DialogueLine, Speaker } from '@/types/dialogue';
import { AUDIO_TAGS } from '@/lib/audioTags';
import { cn } from '@/lib/utils';

interface ScriptEditorProps {
  lines: DialogueLine[];
  speakers: Speaker[];
  selectedLineId: string | null;
  onSelectLine: (lineId: string | null) => void;
  onUpdateLine: (lineId: string, text: string) => void;
  onRemoveLine: (lineId: string) => void;
  onAddLine: (speakerId: string) => void;
  onChangeSpeaker: (lineId: string, speakerId: string) => void;
  onPreviewLine: (lineId: string) => void;
  onRemoveTag: (lineId: string, tagIndex: number) => void;
  onCursorPositionChange?: (position: number) => void;
}

interface DialogueLineEditorProps {
  line: DialogueLine;
  speaker: Speaker;
  speakers: Speaker[];
  isSelected: boolean;
  onSelect: () => void;
  onUpdateText: (text: string) => void;
  onChangeSpeaker: (speakerId: string) => void;
  onPreview: () => void;
  onRemove: () => void;
  onRemoveTag: (tagIndex: number) => void;
  onCursorPositionChange?: (position: number) => void;
}

function DialogueLineEditor({
  line,
  speaker,
  speakers,
  isSelected,
  onSelect,
  onUpdateText,
  onChangeSpeaker,
  onPreview,
  onRemove,
  onRemoveTag,
  onCursorPositionChange,
}: DialogueLineEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdateText(e.target.value);
    },
    [onUpdateText]
  );

  const handleCursorChange = useCallback(() => {
    if (textareaRef.current && onCursorPositionChange) {
      onCursorPositionChange(textareaRef.current.selectionStart);
    }
  }, [onCursorPositionChange]);

  const handleFocus = useCallback(() => {
    onSelect();
    handleCursorChange();
  }, [onSelect, handleCursorChange]);

  // Extract tag badges from text
  const tagMatches = Array.from(line.text.matchAll(/\[([^\]]+)\]/g));
  const tagBadges = tagMatches.map((match, index) => {
    const tagText = match[1];
    const audioTag = AUDIO_TAGS.find(
      (t) => t.tag.toLowerCase() === tagText.toLowerCase()
    );
    return {
      text: tagText,
      displayName: audioTag?.displayName || tagText,
      index,
    };
  });

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-all',
        isSelected
          ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
          : 'border-border hover:border-muted-foreground/50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Drag handle */}
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />

          {/* Speaker indicator dot */}
          <div
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: speaker.color }}
          />

          {/* Speaker selector */}
          <Select value={speaker.id} onValueChange={onChangeSpeaker}>
            <SelectTrigger className="h-8 border-0 bg-transparent px-2 font-medium hover:bg-accent flex-1 min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {speakers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span>{s.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action buttons - show on hover or when selected */}
        <div
          className={cn(
            'flex items-center gap-1 flex-shrink-0 transition-opacity',
            isHovered || isSelected ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onPreview}
            disabled={line.isGenerating}
          >
            <Play className="h-4 w-4" />
            <span className="sr-only">Preview line</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete line</span>
          </Button>
        </div>
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={line.text}
        onChange={handleTextChange}
        onFocus={handleFocus}
        onClick={handleCursorChange}
        onKeyUp={handleCursorChange}
        placeholder="Enter dialogue text..."
        className={cn(
          'min-h-[60px] resize-none border-0 bg-muted/50 p-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0',
          line.isGenerating && 'opacity-50'
        )}
        disabled={line.isGenerating}
      />

      {/* Tag badges */}
      {tagBadges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tagBadges.map((tag) => (
            <Badge
              key={tag.index}
              variant="secondary"
              className="group/badge gap-1 pr-1.5 text-xs"
            >
              <span>{tag.displayName}</span>
              <button
                onClick={() => onRemoveTag(tag.index)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove tag</span>
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Generating indicator */}
      {line.isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Generating audio...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ScriptEditor({
  lines,
  speakers,
  selectedLineId,
  onSelectLine,
  onUpdateLine,
  onRemoveLine,
  onAddLine,
  onChangeSpeaker,
  onPreviewLine,
  onRemoveTag,
  onCursorPositionChange,
}: ScriptEditorProps) {
  const handleAddLine = useCallback(() => {
    // Default to first speaker if available
    if (speakers.length > 0) {
      onAddLine(speakers[0].id);
    }
  }, [speakers, onAddLine]);

  const handleClearAll = useCallback(() => {
    if (confirm(`Are you sure you want to clear all ${lines.length} lines?`)) {
      lines.forEach((line) => onRemoveLine(line.id));
    }
  }, [lines, onRemoveLine]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Script</h2>
          {lines.length > 0 && (
            <Badge variant="secondary" className="font-normal">
              {lines.length} {lines.length === 1 ? 'line' : 'lines'}
            </Badge>
          )}
        </div>
        {lines.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Lines list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {lines.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No dialogue lines yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Click the button below to add your first line
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {lines.map((line) => {
              const speaker = speakers.find((s) => s.id === line.speakerId);
              if (!speaker) return null;

              return (
                <DialogueLineEditor
                  key={line.id}
                  line={line}
                  speaker={speaker}
                  speakers={speakers}
                  isSelected={selectedLineId === line.id}
                  onSelect={() => onSelectLine(line.id)}
                  onUpdateText={(text) => onUpdateLine(line.id, text)}
                  onChangeSpeaker={(speakerId) =>
                    onChangeSpeaker(line.id, speakerId)
                  }
                  onPreview={() => onPreviewLine(line.id)}
                  onRemove={() => onRemoveLine(line.id)}
                  onRemoveTag={(tagIndex) => onRemoveTag(line.id, tagIndex)}
                  onCursorPositionChange={onCursorPositionChange}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add line button */}
      <div className="border-t bg-card px-6 py-4">
        {speakers.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Add speakers first to create dialogue lines
          </p>
        ) : speakers.length === 1 ? (
          <Button
            onClick={handleAddLine}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add line
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add line
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[400px]">
              {speakers.map((speaker) => (
                <DropdownMenuItem
                  key={speaker.id}
                  onClick={() => onAddLine(speaker.id)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: speaker.color }}
                    />
                    <span>{speaker.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
