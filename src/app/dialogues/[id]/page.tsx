"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StackedList,
  StackedListItem,
  StackedListAddButton,
} from "@/components/ui/stacked-list";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useDialogueStore } from "@/stores/dialogueStore";
import type { AudioTag, Dialogue, DialogueLine, Speaker, TagCategory } from "@/types/dialogue";
import {
  initializeClient,
  fetchVoices,
  isClientInitialized,
  generateDialogue,
  generateLinePreview,
  generateSpeech,
} from "@/lib/elevenlabs/client";
import {
  getLogs,
  clearLogs,
  subscribeLogs,
  formatLogEntry,
  type LogEntry,
} from "@/lib/elevenlabs/logger";
import {
  getCachedAudio,
  setCachedAudio,
  cleanupExpiredCache,
} from "@/lib/audioCache";

// Mock audio tags data - will be moved to separate file later
const AUDIO_TAGS: AudioTag[] = [
  // Emotions
  {
    id: "excited",
    tag: "excited",
    displayName: "Excited",
    category: "emotion",
    description: "Delivers text with enthusiasm and energy",
    example: "[excited]I can't believe we won![/excited]",
    syntax: "inline",
  },
  {
    id: "nervous",
    tag: "nervous",
    displayName: "Nervous",
    category: "emotion",
    description: "Adds hesitation and anxiety to delivery",
    example: "[nervous]Are you sure this is safe?[/nervous]",
    syntax: "inline",
  },
  {
    id: "sad",
    tag: "sad",
    displayName: "Sad",
    category: "emotion",
    description: "Conveys sorrow and melancholy",
    example: "[sad]I'll miss you so much[/sad]",
    syntax: "inline",
  },
  {
    id: "angry",
    tag: "angry",
    displayName: "Angry",
    category: "emotion",
    description: "Expresses anger and frustration",
    example: "[angry]That's completely unacceptable![/angry]",
    syntax: "inline",
  },

  // Delivery
  {
    id: "whispers",
    tag: "whispers",
    displayName: "Whispers",
    category: "delivery",
    description: "Quiet, secretive delivery",
    example: "[whispers]Don't let them hear us[/whispers]",
    syntax: "inline",
  },
  {
    id: "shouts",
    tag: "shouts",
    displayName: "Shouts",
    category: "delivery",
    description: "Loud, forceful delivery",
    example: "[shouts]Watch out![/shouts]",
    syntax: "inline",
  },
  {
    id: "sarcastically",
    tag: "sarcastically",
    displayName: "Sarcastically",
    category: "delivery",
    description: "Ironic, mocking tone",
    example: "[sarcastically]Oh, that's just perfect[/sarcastically]",
    syntax: "inline",
  },

  // Sounds
  {
    id: "laughs",
    tag: "laughs",
    displayName: "Laughs",
    category: "sound",
    description: "Inserts laughter",
    example: "That's hilarious! [laughs]",
    syntax: "inline",
  },
  {
    id: "sighs",
    tag: "sighs",
    displayName: "Sighs",
    category: "sound",
    description: "Inserts an audible sigh",
    example: "[sighs] I suppose you're right.",
    syntax: "inline",
  },
  {
    id: "gasps",
    tag: "gasps",
    displayName: "Gasps",
    category: "sound",
    description: "Inserts a gasp of surprise",
    example: "[gasps] I can't believe it!",
    syntax: "inline",
  },

  // Character
  {
    id: "british-accent",
    tag: "British accent",
    displayName: "British Accent",
    category: "character",
    description: "British English pronunciation",
    example: "[British accent]Lovely weather we're having[/British accent]",
    syntax: "inline",
  },

  // Pacing
  {
    id: "pause",
    tag: "pause",
    displayName: "Pause",
    category: "pacing",
    description: "Inserts a dramatic pause",
    example: "The winner is... [pause] you!",
    syntax: "inline",
  },
];

const TAG_CATEGORIES: Partial<Record<
  TagCategory,
  { label: string; icon?: string }
>> = {
  emotion: { label: "Emotion" },
  delivery: { label: "Delivery" },
  sound: { label: "Sound" },
  character: { label: "Character" },
  narrative: { label: "Narrative" },
  pacing: { label: "Pacing" },
};

// Speaker colors preset
const SPEAKER_COLOR_PRESETS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

// Placeholder component for Speaker Edit Dialog
function SpeakerEditDialog({
  open,
  onOpenChange,
  speaker,
  onSave,
  onRemove,
  canRemove,
  voices,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speaker: Speaker | null;
  onSave: (updates: Partial<Speaker>) => void;
  onRemove?: () => void;
  canRemove: boolean;
  voices: Array<{ voice_id: string; name: string }>;
}) {
  const [name, setName] = React.useState(speaker?.name || "");
  const [voiceId, setVoiceId] = React.useState(speaker?.voiceId || "");
  const [color, setColor] = React.useState(speaker?.color || SPEAKER_COLOR_PRESETS[0]);

  React.useEffect(() => {
    if (speaker) {
      setName(speaker.name);
      setVoiceId(speaker.voiceId);
      setColor(speaker.color);
    }
  }, [speaker]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Speaker name is required");
      return;
    }
    if (!voiceId) {
      toast.error("Voice selection is required");
      return;
    }
    onSave({ name: name.trim(), voiceId, color });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{speaker ? "Edit Speaker" : "Add Speaker"}</DialogTitle>
          <DialogDescription>
            Configure the speaker&apos;s name, voice, and color indicator.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Speaker name"
            />
          </div>
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select value={voiceId} onValueChange={setVoiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice..." />
              </SelectTrigger>
              <SelectContent>
                {voices.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">No voices available</div>
                ) : (
                  voices.map((voice) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {SPEAKER_COLOR_PRESETS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    color === presetColor
                      ? "border-foreground scale-110"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            {speaker && canRemove && onRemove && (
              <Button variant="destructive" onClick={onRemove}>
                Remove Speaker
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Tag Palette with all categories visible
function TagPalette({
  selectedLineId,
  onApplyTag,
}: {
  selectedLineId: string | null;
  onApplyTag: (tag: AudioTag) => void;
}) {
  const tagsByCategory = React.useMemo(() => {
    const categories: Record<string, AudioTag[]> = {};
    for (const tag of AUDIO_TAGS) {
      if (!categories[tag.category]) {
        categories[tag.category] = [];
      }
      categories[tag.category].push(tag);
    }
    return categories;
  }, []);

  const categoryOrder = ["emotion", "delivery", "sound", "character", "pacing"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Audio Tags</h3>
        {!selectedLineId && (
          <span className="text-xs text-gray-400">Select a line</span>
        )}
      </div>
      <div className="space-y-4">
        {categoryOrder.map((category) => {
          const tags = tagsByCategory[category];
          if (!tags || tags.length === 0) return null;
          const categoryMeta = TAG_CATEGORIES[category as TagCategory];

          return (
            <div key={category}>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {categoryMeta?.label || category}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Tooltip key={tag.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => onApplyTag(tag)}
                        disabled={!selectedLineId}
                      >
                        {tag.displayName}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">{tag.displayName}</p>
                        <p className="text-xs text-gray-400">{tag.description}</p>
                        <p className="text-xs font-mono mt-2 text-gray-300">{tag.example}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Placeholder component for Cost Estimator
function CostEstimator({ dialogue, modelMode }: { dialogue: Dialogue; modelMode: "fast" | "full" }) {
  const characterCount = React.useMemo(() => {
    return dialogue.lines.reduce((acc: number, line: DialogueLine) => {
      // Remove audio tags from character count (they don't count toward credits)
      const plainText = line.text
        .replace(/\[[\w\s-]+\]/g, "")
        .replace(/\[\/[\w\s-]+\]/g, "");
      return acc + plainText.length;
    }, 0);
  }, [dialogue]);

  // Credit costs per character:
  // - eleven_v3 (Full): 1 credit per character
  // - eleven_flash_v2_5 (Fast): 0.5 credits per character
  const creditsPerChar = modelMode === "fast" ? 0.5 : 1;
  const estimatedCredits = characterCount * creditsPerChar;

  const percentage = Math.min((characterCount / 10000) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Estimated Cost</h3>
        <span className="text-xs text-gray-400">
          {modelMode === "fast" ? "0.5" : "1"} credit/char
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Characters</span>
          <span className="font-medium">{characterCount.toLocaleString()}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-alpha-200 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              percentage > 80 ? "bg-red-500" : percentage > 50 ? "bg-amber-500" : "bg-green-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Estimated credits</span>
          <span className="font-medium">{estimatedCredits.toLocaleString()}</span>
        </div>
        {modelMode === "fast" && (
          <p className="text-xs text-gray-400">
            Note: Generate All uses Full (1 credit/char)
          </p>
        )}
      </div>
    </div>
  );
}

// DevTools-style API Drawer Component
function ApiDevToolsDrawer({
  isOpen,
  onToggle,
  dialogue,
}: {
  isOpen: boolean;
  onToggle: () => void;
  dialogue: Dialogue;
}) {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"network" | "logs" | "payload">("network");
  const [height, setHeight] = React.useState(280);
  const [isResizing, setIsResizing] = React.useState(false);
  const [isMinified, setIsMinified] = React.useState(false);

  // Generate JSON payload for the Payload tab
  const jsonPayload = React.useMemo(() => {
    return {
      model_id: "eleven_v3",
      dialogue: dialogue.lines.map((line: DialogueLine) => ({
        text: line.text,
        voice_id:
          dialogue.speakers.find((s: Speaker) => s.id === line.speakerId)?.voiceId ?? "",
      })),
    };
  }, [dialogue]);

  const jsonString = React.useMemo(() => {
    return isMinified
      ? JSON.stringify(jsonPayload)
      : JSON.stringify(jsonPayload, null, 2);
  }, [jsonPayload, isMinified]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(jsonString);
    toast.success("JSON copied to clipboard");
  };

  // Subscribe to log updates
  React.useEffect(() => {
    setLogs(getLogs());
    const unsubscribe = subscribeLogs((newLogs) => {
      setLogs(newLogs);
    });
    return unsubscribe;
  }, []);

  // Auto-scroll to bottom when new logs arrive
  React.useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Scroll to bottom when panel opens
  React.useEffect(() => {
    if (isOpen && scrollRef.current) {
      // Use setTimeout to ensure the panel has rendered
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [isOpen]);

  // Handle resize drag
  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      setHeight(Math.max(150, Math.min(600, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleClear = () => {
    clearLogs();
    toast.success("Logs cleared");
  };

  const handleCopy = () => {
    const text = displayedLogs.map(formatLogEntry).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Logs copied to clipboard");
  };

  // Network tab shows request/response, Logs tab shows general logs
  const displayedLogs =
    activeTab === "network"
      ? logs.filter((log) => log.type === "request" || log.type === "response")
      : logs.filter((log) => log.type === "log");

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600";
      case "warn":
        return "text-amber-600";
      case "info":
        return "text-blue-600";
      case "debug":
        return "text-gray-500";
      default:
        return "text-gray-600";
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "";
    if (status >= 500) return "text-red-600";
    if (status >= 400) return "text-amber-600";
    return "text-green-600";
  };

  const networkCount = logs.filter((l) => l.type === "request" || l.type === "response").length;
  const logsCount = logs.filter((l) => l.type === "log").length;

  return (
    <>
      {/* Slim toggle bar - always visible */}
      <div
        className="flex items-center justify-center py-1 bg-gray-100 border-t border-gray-alpha-200 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <ChevronUp className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
          <span>Developer Tools</span>
          {(networkCount > 0 || logsCount > 0) && (
            <span className="text-gray-500">
              ({networkCount} requests, {logsCount} logs)
            </span>
          )}
        </div>
      </div>

      {/* Expandable drawer content */}
      <div
        className={cn(
          "bg-background border-t border-gray-alpha-200 flex flex-col overflow-hidden",
          isOpen ? "" : "h-0"
        )}
        style={{ height: isOpen ? height : 0 }}
      >
        {isOpen && (
          <>
            {/* Resize handle */}
            <div
              className="h-1 bg-gray-100 hover:bg-blue-400 cursor-ns-resize shrink-0 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
            />

            {/* Drawer Header with Tabs */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-alpha-200 shrink-0">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-3 text-xs rounded-none border-b-2",
                    activeTab === "network"
                      ? "border-blue-500 text-foreground bg-transparent"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setActiveTab("network")}
                >
                  Network
                  {networkCount > 0 && (
                    <span className="ml-1.5 text-[10px] text-gray-400">({networkCount})</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-3 text-xs rounded-none border-b-2",
                    activeTab === "logs"
                      ? "border-blue-500 text-foreground bg-transparent"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setActiveTab("logs")}
                >
                  Logs
                  {logsCount > 0 && (
                    <span className="ml-1.5 text-[10px] text-gray-400">({logsCount})</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-3 text-xs rounded-none border-b-2",
                    activeTab === "payload"
                      ? "border-blue-500 text-foreground bg-transparent"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setActiveTab("payload")}
                >
                  Payload
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {activeTab !== "payload" && (
                  <>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="rounded h-3 w-3"
                      />
                      Auto-scroll
                    </label>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" onClick={handleCopy}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" onClick={handleClear}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </>
                )}
                {activeTab === "payload" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-gray-500"
                      onClick={() => setIsMinified(!isMinified)}
                    >
                      {isMinified ? "Formatted" : "Minified"}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" onClick={handleCopyPayload}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Drawer Content */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-auto font-mono text-sm p-3"
            >
              {activeTab === "payload" ? (
                <pre className="text-xs whitespace-pre-wrap break-all text-gray-700">{jsonString}</pre>
              ) : displayedLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  {activeTab === "network"
                    ? "No API activity yet. Make a request to see network traffic here."
                    : "No logs yet. SDK activity will appear here."}
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedLogs.map((log) => (
                    <div
                      key={log.id}
                      className="py-2 px-3 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Request/Response indicator */}
                        {log.type === "request" && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                            <ChevronUp className="h-3 w-3" />
                            REQ
                          </span>
                        )}
                        {log.type === "response" && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            <ChevronDown className="h-3 w-3" />
                            RES
                          </span>
                        )}
                        {/* Timestamp */}
                        <span className="text-gray-500 text-xs">
                          {log.timestamp.toLocaleTimeString("en-US", {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        {/* Status code for responses */}
                        {log.status && (
                          <span className={cn("font-semibold text-sm", getStatusColor(log.status))}>
                            {log.status}
                          </span>
                        )}
                        {/* HTTP method */}
                        {log.method && (
                          <span className="text-purple-600 font-semibold text-sm">{log.method}</span>
                        )}
                        {/* Endpoint */}
                        {log.endpoint && (
                          <span className="text-gray-700 text-sm">{log.endpoint}</span>
                        )}
                        {/* Duration for responses */}
                        {log.duration && (
                          <span className="text-gray-500 text-xs">{log.duration}ms</span>
                        )}
                        {/* Log message for non-network logs */}
                        {!log.method && log.type === "log" && (
                          <span className={cn("text-sm", getLogLevelColor(log.level))}>{log.message}</span>
                        )}
                      </div>
                      {/* Payload/response data */}
                      {log.data !== undefined && (
                        <pre className="mt-2 ml-14 text-gray-600 whitespace-pre-wrap break-all text-xs bg-gray-50 border border-gray-200 p-3 rounded">
                          {typeof log.data === "string"
                            ? log.data
                            : JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function DialogueEditorPage() {
  const router = useRouter();
  const params = useParams();
  const dialogueId = params.id as string;

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
    voices,
    apiKey,
    setVoices,
  } = useDialogueStore();

  // Set current dialogue on mount
  React.useEffect(() => {
    setCurrentDialogue(dialogueId);
  }, [dialogueId, setCurrentDialogue]);

  const dialogue = getCurrentDialogue();

  // State for UI
  const [mounted, setMounted] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState("");
  const [selectedLineId, setSelectedLineId] = React.useState<string | null>(null);
  const [speakerDialogOpen, setSpeakerDialogOpen] = React.useState(false);
  const [editingSpeaker, setEditingSpeaker] = React.useState<Speaker | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatingLineId, setGeneratingLineId] = React.useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [isDevToolsOpen, setIsDevToolsOpen] = React.useState(false);
  const [modelMode, setModelMode] = React.useState<"fast" | "full">("fast");
  const [isDialogueCached, setIsDialogueCached] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Generate cache key for a single line (content-based, not ID-based for better cache hits)
  const getLineCacheKey = React.useCallback((text: string, voiceId: string, model: string) => {
    return `line:${text}:${voiceId}:${model}`;
  }, []);

  // Generate cache key for full dialogue
  const getDialogueCacheKey = React.useCallback((lines: DialogueLine[], speakers: Speaker[], model: string) => {
    const lineData = lines.map(line => {
      const speaker = speakers.find(s => s.id === line.speakerId);
      return `${line.text}:${speaker?.voiceId || ''}`;
    }).join('|');
    return `dialogue:${lineData}:${model}`;
  }, []);

  // Cleanup expired cache entries on mount
  React.useEffect(() => {
    cleanupExpiredCache().then((deleted) => {
      if (deleted > 0) {
        console.log(`Cleaned up ${deleted} expired audio cache entries`);
      }
    });
  }, []);

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize client and fetch voices if needed (wait for hydration)
  React.useEffect(() => {
    async function initAndFetch() {
      if (!mounted) return; // Wait for hydration
      if (apiKey && voices.length === 0) {
        try {
          if (!isClientInitialized()) {
            initializeClient(apiKey);
          }
          const fetchedVoices = await fetchVoices();
          setVoices(fetchedVoices);
        } catch (error) {
          console.error("Failed to fetch voices:", error);
          toast.error("Failed to load voices. Check your API key.");
        }
      }
    }
    initAndFetch();
  }, [mounted, apiKey, voices.length, setVoices]);

  React.useEffect(() => {
    if (dialogue) {
      setTitleValue(dialogue.title);
    }
  }, [dialogue]);

  // Cleanup audio URL on unmount
  React.useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Redirect if dialogue not found (only after mounted)
  React.useEffect(() => {
    if (mounted && dialogueId && !dialogue) {
      toast.error("Dialogue not found");
      router.push("/");
    }
  }, [mounted, dialogue, dialogueId, router]);

  // Check if full dialogue is cached (for Play All vs Generate All button)
  React.useEffect(() => {
    async function checkCache() {
      if (!dialogue || dialogue.lines.length === 0) {
        setIsDialogueCached(false);
        return;
      }
      const modelId = "eleven_v3";
      const cacheKey = getDialogueCacheKey(dialogue.lines, dialogue.speakers, modelId);
      const cached = await getCachedAudio(cacheKey);
      setIsDialogueCached(cached !== null);
    }
    checkCache();
  }, [dialogue, getDialogueCacheKey]);

  // Show loading until mounted and dialogue loaded
  if (!mounted || !dialogue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      updateDialogue(dialogue.id, { title: titleValue.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleAddSpeaker = () => {
    setEditingSpeaker(null);
    setSpeakerDialogOpen(true);
  };

  const handleEditSpeaker = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setSpeakerDialogOpen(true);
  };

  const handleSaveSpeaker = (updates: Partial<Speaker>) => {
    if (editingSpeaker) {
      updateSpeaker(editingSpeaker.id, updates);
      toast.success("Speaker updated");
    } else {
      addSpeaker(
        updates.name || "New Speaker",
        updates.voiceId || voices[0]?.voice_id || "",
        updates.color
      );
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

  const handleAddLine = () => {
    if (dialogue.speakers.length === 0) {
      toast.error("Add a speaker first");
      return;
    }
    addLine(dialogue.speakers[0].id, "");
  };

  const handleApplyTag = (tag: AudioTag) => {
    if (!selectedLineId) return;

    const line = dialogue.lines.find((l) => l.id === selectedLineId);
    if (!line) return;

    const needsSpace = line.text.length > 0 && !line.text.endsWith(" ");
    const newText = `${line.text}${needsSpace ? " " : ""}[${tag.tag}]`;

    updateLine(selectedLineId, newText);
    toast.success(`Applied ${tag.displayName}`);
  };

  const handleChangeLineSpeaker = (lineId: string, newSpeakerId: string) => {
    updateDialogue(dialogue.id, {
      lines: dialogue.lines.map((l) =>
        l.id === lineId ? { ...l, speakerId: newSpeakerId } : l
      ),
    });
  };

  const getSpeakerForLine = (lineId: string) => {
    const line = dialogue.lines.find((l) => l.id === lineId);
    if (!line) return null;
    return dialogue.speakers.find((s) => s.id === line.speakerId) || null;
  };

  // Strip audio tags from text (for Fast mode which uses regular TTS)
  // Audio tags like [excited], [whispers], [laughs], etc. are only supported by the Dialogue API
  const stripAudioTags = (text: string): string => {
    return text
      .replace(/\[[\w\s-]+\]/g, "") // Remove opening tags like [excited]
      .replace(/\[\/[\w\s-]+\]/g, "") // Remove closing tags like [/excited]
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim();
  };

  const handleGenerateLine = async (lineId?: string) => {
    const targetLineId = lineId ?? selectedLineId;

    if (!targetLineId || !apiKey) {
      toast.error(apiKey ? "Select a line first" : "Set your API key first");
      return;
    }

    const line = dialogue.lines.find((l) => l.id === targetLineId);
    if (!line || !line.text.trim()) {
      toast.error("Line has no text");
      return;
    }

    const speaker = getSpeakerForLine(targetLineId);
    if (!speaker?.voiceId) {
      toast.error("Speaker has no voice assigned");
      return;
    }

    const modelId = modelMode === "fast" ? "eleven_flash_v2_5" : "eleven_v3";

    // For Fast mode, strip audio tags since regular TTS doesn't support them
    const textToGenerate = modelMode === "fast" ? stripAudioTags(line.text) : line.text;

    if (modelMode === "fast" && !textToGenerate.trim()) {
      toast.error("Line only contains audio tags - no text to generate");
      return;
    }

    const cacheKey = getLineCacheKey(textToGenerate, speaker.voiceId, modelId);

    // Check IndexedDB cache first
    const cachedBlob = await getCachedAudio(cacheKey);
    if (cachedBlob) {
      setGeneratedAudio(cachedBlob);

      // Revoke old URL and create new one
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(cachedBlob);
      setAudioUrl(url);

      // Auto-play cached audio
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("Auto-play failed:", err);
          });
        }
      }, 50);

      toast.success("Playing cached audio");
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratingLineId(targetLineId);
      if (!isClientInitialized()) {
        initializeClient(apiKey);
      }

      // Fast mode uses regular TTS (faster, cheaper), Full uses Dialogue API (natural flow)
      const audio = modelMode === "fast"
        ? await generateSpeech(textToGenerate, speaker.voiceId, { modelId })
        : await generateLinePreview(textToGenerate, speaker.voiceId, { modelId });
      setGeneratedAudio(audio);

      // Create URL for audio playback
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(audio);
      setAudioUrl(url);

      // Store in IndexedDB cache
      void setCachedAudio(cacheKey, audio);

      // Auto-play the generated audio
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("Auto-play failed:", err);
          });
        }
      }, 100);

      toast.success("Line generated successfully");
    } catch (error) {
      console.error("Failed to generate line:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate audio";
      toast.error("Generation failed", {
        description: errorMessage,
        duration: Infinity,
        closeButton: true,
      });
    } finally {
      setIsGenerating(false);
      setGeneratingLineId(null);
    }
  };

  const handleGenerateAll = async () => {
    if (!apiKey) {
      toast.error("Set your API key first");
      return;
    }

    if (dialogue.lines.length === 0) {
      toast.error("Add some dialogue lines first");
      return;
    }

    // Check all lines have text and valid speakers
    for (const line of dialogue.lines) {
      if (!line.text.trim()) {
        toast.error("All lines must have text");
        return;
      }
      const speaker = dialogue.speakers.find((s) => s.id === line.speakerId);
      if (!speaker?.voiceId) {
        toast.error(`Speaker "${speaker?.name || 'Unknown'}" has no voice assigned`);
        return;
      }
    }

    // Generate All always uses Dialogue API with eleven_v3 for natural conversation flow
    const modelId = "eleven_v3";
    const cacheKey = getDialogueCacheKey(dialogue.lines, dialogue.speakers, modelId);

    if (modelMode === "fast") {
      toast.info("Using Full quality for dialogue (natural conversation flow)");
    }

    // Check IndexedDB cache first
    const cachedBlob = await getCachedAudio(cacheKey);
    if (cachedBlob) {
      setGeneratedAudio(cachedBlob);

      // Revoke old URL and create new one
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(cachedBlob);
      setAudioUrl(url);

      // Auto-play cached audio
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("Auto-play failed:", err);
          });
        }
      }, 50);

      toast.success("Playing cached dialogue");
      return;
    }

    try {
      setIsGenerating(true);
      if (!isClientInitialized()) {
        initializeClient(apiKey);
      }

      const inputs = dialogue.lines.map((line) => {
        const speaker = dialogue.speakers.find((s) => s.id === line.speakerId);
        return {
          text: line.text,
          voiceId: speaker!.voiceId,
        };
      });

      const audio = await generateDialogue(inputs, { modelId });
      setGeneratedAudio(audio);

      // Create URL for audio playback
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(audio);
      setAudioUrl(url);

      // Store in IndexedDB cache
      void setCachedAudio(cacheKey, audio);
      setIsDialogueCached(true);

      // Auto-play the generated audio
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("Auto-play failed:", err);
          });
        }
      }, 100);

      toast.success("Dialogue generated successfully");
    } catch (error) {
      console.error("Failed to generate dialogue:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate audio";
      toast.error("Generation failed", {
        description: errorMessage,
        duration: Infinity,
        closeButton: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedAudio || !audioUrl) {
      toast.error("No audio to download");
      return;
    }

    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${dialogue.title.replace(/[^a-z0-9]/gi, "_")}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Audio downloaded");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-alpha-200 bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push("/")}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              {isEditingTitle ? (
                <Input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSave();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="h-8"
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  {dialogue.title}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Model Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-alpha-100 rounded-lg p-1">
              <button
                onClick={() => setModelMode("fast")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  modelMode === "fast"
                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Fast
              </button>
              <button
                onClick={() => setModelMode("full")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  modelMode === "full"
                    ? "bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-200"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Full
              </button>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-gray-400 cursor-help w-[105px]">
                  {modelMode === "fast" ? "eleven_flash_v2_5" : "eleven_v3"}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                {modelMode === "fast"
                  ? "Fast TTS for quick line previews (50% cheaper). Full dialogue generation uses Full quality."
                  : "Dialogue API with natural conversation flow and emotional expression."}
              </TooltipContent>
            </Tooltip>
            <Button onClick={() => toast.success("Saved!")}>Save</Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Speakers Panel */}
        <aside className="w-[280px] border-r border-gray-alpha-200 bg-background flex flex-col">
          <div className="p-4 border-b border-gray-alpha-200">
            <h2 className="text-sm font-medium text-gray-500">Speakers</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            <StackedList>
              {dialogue.speakers.map((speaker) => (
                <StackedListItem
                  key={speaker.id}
                  onClick={() => handleEditSpeaker(speaker)}
                  icon={
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: speaker.color }}
                    />
                  }
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium truncate">{speaker.name}</span>
                    <span className="text-xs text-gray-500 truncate">
                      {voices.find((v) => v.voice_id === speaker.voiceId)?.name || "Voice"}
                    </span>
                  </div>
                </StackedListItem>
              ))}
              <StackedListAddButton onClick={handleAddSpeaker} icon={<Plus className="h-4 w-4 text-gray-400" />}>
                Add speaker
              </StackedListAddButton>
            </StackedList>
          </ScrollArea>
        </aside>

        {/* Center Column - Script Editor */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-alpha-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500">Script</h2>
              <span className="text-xs text-gray-400">
                {dialogue.lines.length} {dialogue.lines.length === 1 ? "line" : "lines"}
              </span>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3 max-w-3xl mx-auto pt-1">
              {dialogue.lines.map((line) => {
                const speaker = getSpeakerForLine(line.id);
                const isSelected = selectedLineId === line.id;

                return (
                  <div
                    key={line.id}
                    onClick={() => setSelectedLineId(line.id)}
                    className={cn(
                      "group relative rounded-2xl border bg-background p-4 transition-all cursor-pointer",
                      isSelected
                        ? "border-foreground ring-1 ring-foreground"
                        : "border-gray-alpha-200 hover:border-gray-alpha-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-6 w-6 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: speaker?.color ?? "#9ca3af" }}
                      />
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <Select
                            value={line.speakerId}
                            onValueChange={(value) => handleChangeLineSpeaker(line.id, value)}
                          >
                            <SelectTrigger
                              className="h-auto w-auto border-0 bg-transparent p-0 text-sm font-medium shadow-none focus:ring-0 hover:bg-gray-alpha-100 rounded px-1.5 py-0.5 -ml-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue>
                                {speaker?.name || "Select speaker"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {dialogue.speakers.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{ backgroundColor: s.color }}
                                    />
                                    {s.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {line.tags && line.tags.length > 0 && (
                            <div className="flex gap-1">
                              {line.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {AUDIO_TAGS.find((t) => t.id === tag.tagId)?.displayName}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Textarea
                          value={line.text}
                          onChange={(e) => updateLine(line.id, e.target.value)}
                          placeholder="Enter dialogue line..."
                          className="min-h-[80px] resize-none border-0 rounded-none focus:border-0 focus:ring-0 focus-visible:ring-0 bg-transparent p-0"
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => setSelectedLineId(line.id)}
                        />
                      </div>
                      <div className={cn(
                        "flex gap-1 transition-opacity",
                        generatingLineId === line.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => void handleGenerateLine(line.id)}
                              disabled={isGenerating || !apiKey}
                            >
                              {generatingLineId === line.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Preview line</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeLine(line.id);
                                toast.success("Line deleted");
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete line</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Button
                variant="secondary"
                onClick={handleAddLine}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add line
              </Button>
            </div>
          </ScrollArea>
        </main>

        {/* Right Column - Tools Panel */}
        <aside className="w-[320px] border-l border-gray-alpha-200 bg-background flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Tag Palette */}
              <TagPalette
                selectedLineId={selectedLineId}
                onApplyTag={handleApplyTag}
              />

              <Separator />

              {/* Cost Estimator */}
              <CostEstimator dialogue={dialogue} modelMode={modelMode} />
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* DevTools Drawer - positioned above bottom bar */}
      <ApiDevToolsDrawer
        isOpen={isDevToolsOpen}
        onToggle={() => setIsDevToolsOpen(!isDevToolsOpen)}
        dialogue={dialogue}
      />

      {/* Bottom Preview Pane */}
      <div className="border-t border-gray-alpha-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Left: Audio player */}
          <div className="flex items-center gap-3 flex-1">
            {audioUrl ? (
              <audio ref={audioRef} controls src={audioUrl} className="h-10 flex-1 max-w-md" />
            ) : (
              <div className="flex-1 text-sm text-gray-500">
                {isGenerating ? "Generating audio..." : "Generate audio to preview"}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={!generatedAudio || isGenerating}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="secondary"
              onClick={() => void handleGenerateLine()}
              disabled={isGenerating || !selectedLineId || !apiKey}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Generate Line
            </Button>
            <Button
              onClick={handleGenerateAll}
              disabled={isGenerating || dialogue.lines.length === 0 || !apiKey}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isDialogueCached ? "Play All" : "Generate All"}
            </Button>
          </div>
        </div>
      </div>

      {/* Speaker Edit Dialog */}
      <SpeakerEditDialog
        open={speakerDialogOpen}
        onOpenChange={setSpeakerDialogOpen}
        speaker={editingSpeaker}
        onSave={handleSaveSpeaker}
        onRemove={handleRemoveSpeaker}
        canRemove={dialogue.speakers.length > 1}
        voices={voices}
      />
    </div>
  );
}
