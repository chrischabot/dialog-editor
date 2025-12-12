"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  initializeClient,
  fetchVoices,
  isClientInitialized,
} from "@/lib/elevenlabs/client";
import { useDialogueStore } from "@/stores/dialogueStore";

/**
 * Shared hook for loading and managing ElevenLabs voices
 * Used by both home page and dialogue editor
 */
export function useElevenLabsVoices() {
  const { apiKey, voices, setVoices } = useDialogueStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadVoices = React.useCallback(async () => {
    if (!apiKey) {
      setError(new Error("No API key set"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (!isClientInitialized()) {
        initializeClient(apiKey);
      }

      const fetchedVoices = await fetchVoices();
      setVoices(fetchedVoices);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch voices");
      setError(error);
      console.error("Failed to fetch voices:", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, setVoices]);

  // Auto-load voices when API key exists but voices are empty
  React.useEffect(() => {
    if (apiKey && voices.length === 0 && !isLoading) {
      loadVoices();
    }
  }, [apiKey, voices.length, isLoading, loadVoices]);

  return {
    voices,
    isLoading,
    error,
    refresh: loadVoices,
  };
}

/**
 * Hook for saving a new API key with validation
 */
export function useApiKeySaver() {
  const { setApiKey, setVoices } = useDialogueStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const saveApiKey = React.useCallback(async (key: string): Promise<boolean> => {
    if (!key.trim()) {
      toast.error("API key cannot be empty");
      return false;
    }

    try {
      setIsLoading(true);

      // Initialize client with new key
      initializeClient(key.trim());

      // Fetch voices to validate the key works
      const fetchedVoices = await fetchVoices();

      // Save key and voices to store
      setApiKey(key.trim());
      setVoices(fetchedVoices);

      toast.success(`API key saved. Loaded ${fetchedVoices.length} voices.`);
      return true;
    } catch (error) {
      console.error("Failed to validate API key:", error);
      toast.error("Invalid API key or failed to connect to ElevenLabs");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setApiKey, setVoices]);

  return {
    saveApiKey,
    isLoading,
  };
}
