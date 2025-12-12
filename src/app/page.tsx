"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Home,
  MessageSquare,
  Key,
  User,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  FileText,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialogueStore } from "@/stores/dialogueStore";
import {
  initializeClient,
  fetchVoices,
  isClientInitialized,
} from "@/lib/elevenlabs/client";

export default function HomePage() {
  const router = useRouter();
  const { dialogues, createDialogue, deleteDialogue, apiKey, setApiKey, setVoices, voices } = useDialogueStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = React.useState(false);
  const [newDialogueTitle, setNewDialogueTitle] = React.useState("");
  const [newDialogueDescription, setNewDialogueDescription] = React.useState("");
  const [dialogueToDelete, setDialogueToDelete] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [apiKeyInput, setApiKeyInput] = React.useState("");
  const [isLoadingVoices, setIsLoadingVoices] = React.useState(false);

  // Initialize client and fetch voices on mount if API key exists
  React.useEffect(() => {
    async function initAndFetch() {
      if (apiKey && voices.length === 0) {
        try {
          setIsLoadingVoices(true);
          if (!isClientInitialized()) {
            initializeClient(apiKey);
          }
          const fetchedVoices = await fetchVoices();
          setVoices(fetchedVoices);
        } catch (error) {
          console.error("Failed to fetch voices:", error);
        } finally {
          setIsLoadingVoices(false);
        }
      }
    }
    initAndFetch();
  }, [apiKey, voices.length, setVoices]);

  // Sort dialogues by updated date (most recent first)
  const sortedDialogues = React.useMemo(() => {
    return [...dialogues].sort((a, b) => {
      const dateA = typeof a.updatedAt === 'string' ? new Date(a.updatedAt) : a.updatedAt;
      const dateB = typeof b.updatedAt === 'string' ? new Date(b.updatedAt) : b.updatedAt;
      return dateB.getTime() - dateA.getTime();
    });
  }, [dialogues]);

  // Filter dialogues by search query
  const filteredDialogues = React.useMemo(() => {
    if (!searchQuery) return sortedDialogues;
    const query = searchQuery.toLowerCase();
    return sortedDialogues.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query)
    );
  }, [sortedDialogues, searchQuery]);

  const handleCreateDialogue = () => {
    if (!newDialogueTitle.trim()) {
      toast.error("Please enter a dialogue title");
      return;
    }

    const dialogueId = createDialogue(newDialogueTitle, newDialogueDescription);
    setIsCreateDialogOpen(false);
    setNewDialogueTitle("");
    setNewDialogueDescription("");
    toast.success("Dialogue created successfully");
    router.push(`/dialogues/${dialogueId}`);
  };

  const handleDeleteDialogue = () => {
    if (!dialogueToDelete) return;

    deleteDialogue(dialogueToDelete);
    setIsDeleteDialogOpen(false);
    setDialogueToDelete(null);
    toast.success("Dialogue deleted");
  };

  const openDeleteDialog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogueToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;

    try {
      setIsLoadingVoices(true);
      const key = apiKeyInput.trim();

      // Initialize client with new key
      initializeClient(key);

      // Fetch voices to validate the key works
      const fetchedVoices = await fetchVoices();

      // Save key and voices to store
      setApiKey(key);
      setVoices(fetchedVoices);

      setIsApiKeyDialogOpen(false);
      setApiKeyInput("");
      toast.success(`API key saved. Loaded ${fetchedVoices.length} voices.`);
    } catch (error) {
      console.error("Failed to validate API key:", error);
      toast.error("Invalid API key or failed to connect to ElevenLabs");
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const dialogueDate = new Date(date);
    const diffInMs = now.getTime() - dialogueDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return dialogueDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: dialogueDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getDialogueToDeleteName = () => {
    if (!dialogueToDelete) return "";
    return dialogues.find((d) => d.id === dialogueToDelete)?.title || "";
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-alpha-200 bg-background flex flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 px-4 border-b border-gray-alpha-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-semibold text-sm">
            11
          </div>
          <span className="text-sm font-medium">Dialog Editor</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-6">
            {/* Home Section */}
            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-alpha-50 rounded-lg transition-colors">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>
            </div>

            {/* Configure Section */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Configure
              </div>
              <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium bg-gray-alpha-100 text-foreground rounded-lg">
                <MessageSquare className="h-4 w-4" />
                <span>Dialogues</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-alpha-200 p-3 space-y-2">
          <button
            onClick={() => {
              setApiKeyInput(apiKey || "");
              setIsApiKeyDialogOpen(true);
            }}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-alpha-50 rounded-lg transition-colors"
          >
            <Key className="h-4 w-4" />
            <span>Set API Key</span>
            {apiKey && <Check className="h-3 w-3 ml-auto text-green-500" />}
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gray-alpha-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">User</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        <div className="flex justify-center px-8 py-10">
          <div className="w-full max-w-4xl">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-medium text-foreground">Dialogues</h1>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New dialogue
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              Create and manage your dialogue scripts
            </p>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search dialogues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

          {/* Dialogues Table or Empty State */}
          {filteredDialogues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-gray-alpha-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? "No dialogues found" : "No dialogues yet"}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Create your first dialogue to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New dialogue
                </Button>
              )}
            </div>
          ) : (
            <div className="border border-gray-alpha-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-alpha-50 border-b border-gray-alpha-200 px-6 py-3">
                <div className="grid grid-cols-[1fr_100px_120px_40px] gap-4 items-center">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Speakers
                  </div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    Updated at
                    <svg
                      className="h-3 w-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <div className="w-9"></div>
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-alpha-200">
                {filteredDialogues.map((dialogue) => (
                  <div
                    key={dialogue.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/dialogues/${dialogue.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/dialogues/${dialogue.id}`);
                      }
                    }}
                    className="w-full px-6 py-4 hover:bg-gray-alpha-50 transition-colors group cursor-pointer"
                  >
                    <div className="grid grid-cols-[1fr_100px_120px_40px] gap-4 items-center">
                      <div className="text-left">
                        <div className="text-sm font-medium text-foreground">
                          {dialogue.title}
                        </div>
                        {dialogue.description && (
                          <div className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                            {dialogue.description}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {dialogue.speakers.length === 0
                          ? "—"
                          : dialogue.speakers.length === 1
                          ? "1 speaker"
                          : `${dialogue.speakers.length} speakers`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(new Date(dialogue.updatedAt))}
                      </div>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dialogues/${dialogue.id}`);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={(e) => openDeleteDialog(dialogue.id, e)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </main>

      {/* Create Dialogue Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new dialogue</DialogTitle>
            <DialogDescription>
              Add a new dialogue to your workspace. You can add speakers and lines after creating it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="My Dialogue"
                value={newDialogueTitle}
                onChange={(e) => setNewDialogueTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newDialogueTitle.trim()) {
                    handleCreateDialogue();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="A brief description..."
                value={newDialogueDescription}
                onChange={(e) => setNewDialogueDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewDialogueTitle("");
                setNewDialogueDescription("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDialogue}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle>Delete dialogue?</DialogTitle>
            </div>
            <DialogDescription>
              This action cannot be undone. The dialogue &quot;{getDialogueToDeleteName()}&quot; will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDialogueToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDialogue}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ElevenLabs API Key</DialogTitle>
            <DialogDescription>
              Enter your ElevenLabs API key to enable voice generation. You can find your API key in your{" "}
              <a
                href="https://elevenlabs.io/app/settings/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline hover:no-underline"
              >
                ElevenLabs account settings
              </a>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="xi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && apiKeyInput.trim() && !isLoadingVoices) {
                    await handleSaveApiKey();
                  }
                }}
                autoFocus
              />
            </div>
            {isLoadingVoices && (
              <p className="text-sm text-gray-500">Loading voices...</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setIsApiKeyDialogOpen(false);
                setApiKeyInput("");
              }}
              disabled={isLoadingVoices}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput.trim() || isLoadingVoices}
            >
              {isLoadingVoices ? "Loading..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
