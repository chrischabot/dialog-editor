"use client";

import * as React from "react";
import { Eye, EyeOff, ExternalLink, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateApiKey, initializeClient, fetchVoices } from "@/lib/elevenlabs/client";
import { useDialogueStore } from "@/stores/dialogueStore";
import { toast } from "sonner";

export interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ApiKeyDialog({ open, onOpenChange, onSuccess }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = React.useState("");
  const [showKey, setShowKey] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    apiKey: storedApiKey,
    setApiKey: storeApiKey,
    setApiKeyValid,
    setVoices,
    setLoadingVoices
  } = useDialogueStore();

  // Initialize with stored key if available
  React.useEffect(() => {
    if (open && storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [open, storedApiKey]);

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Validate the API key
      await validateApiKey(apiKey.trim());

      // Initialize the client
      initializeClient(apiKey.trim());

      // Fetch voices to populate the store (already returns ElevenLabsVoice[])
      setLoadingVoices(true);
      const voices = await fetchVoices();

      // Save to store
      storeApiKey(apiKey.trim());
      setApiKeyValid(true);
      setVoices(voices);
      setLoadingVoices(false);

      // Show success toast
      toast.success("API key validated successfully", {
        description: `Loaded ${voices.length} voices from your account.`,
      });

      // Close dialog
      onOpenChange(false);

      // Call success callback if provided
      onSuccess?.();

      // Reset form state
      setApiKey("");
      setError(null);
    } catch (err) {
      setLoadingVoices(false);
      setApiKeyValid(false);

      const errorMessage = err instanceof Error
        ? err.message
        : "Failed to validate API key. Please check your key and try again.";

      setError(errorMessage);
      toast.error("Validation failed", {
        description: errorMessage,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setApiKey("");
    setError(null);
    setShowKey(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isValidating) {
      handleValidateAndSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
              <Key className="h-5 w-5 text-foreground" />
            </div>
            <DialogTitle>Connect to ElevenLabs</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Enter your API key to generate audio. Your key is stored locally and never sent to our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* API Key Link */}
          <a
            href="https://elevenlabs.io/app/settings/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-foreground hover:underline transition-colors"
          >
            Get your API key
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="sk_..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                disabled={isValidating}
                className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground transition-colors"
                disabled={isValidating}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showKey ? "Hide" : "Show"} API key
                </span>
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Security Note */}
          <div className="rounded-lg bg-gray-alpha-50 p-3">
            <p className="text-xs text-gray-600">
              Your API key is stored in your browser&apos;s local storage and is only used to make direct requests to the ElevenLabs API.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {storedApiKey && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isValidating}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={handleValidateAndSave}
            loading={isValidating}
            disabled={!apiKey.trim() || isValidating}
          >
            {isValidating ? "Validating..." : "Validate & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
