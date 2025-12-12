/**
 * Example usage of the ApiKeyDialog component
 *
 * This file demonstrates how to integrate the ApiKeyDialog
 * into your application.
 */

"use client";

import { useState } from "react";
import { ApiKeyDialog } from "./ApiKeyDialog";
import { Button } from "@/components/ui/button";
import { useDialogueStore } from "@/stores/dialogueStore";

export function ApiKeyDialogExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { apiKey, isApiKeyValid } = useDialogueStore();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">API Key Dialog Example</h2>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Current API Key Status: {isApiKeyValid ? "Valid" : "Not set or invalid"}
        </p>
        <p className="text-sm text-gray-600">
          API Key: {apiKey ? "********" : "Not set"}
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setDialogOpen(true)}>
          {apiKey ? "Update API Key" : "Connect to ElevenLabs"}
        </Button>
      </div>

      <ApiKeyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          console.log("API key validated successfully!");
        }}
      />
    </div>
  );
}

/**
 * Usage in your app:
 *
 * 1. Import the component:
 *    import { ApiKeyDialog } from "@/components/shared/ApiKeyDialog";
 *
 * 2. Add state for dialog visibility:
 *    const [dialogOpen, setDialogOpen] = useState(false);
 *
 * 3. Render the dialog:
 *    <ApiKeyDialog
 *      open={dialogOpen}
 *      onOpenChange={setDialogOpen}
 *      onSuccess={() => {
 *        // Optional: callback when API key is successfully validated
 *      }}
 *    />
 *
 * 4. Trigger the dialog:
 *    <Button onClick={() => setDialogOpen(true)}>
 *      Connect to ElevenLabs
 *    </Button>
 *
 * 5. Check API key status from store:
 *    const { apiKey, isApiKeyValid, voices } = useDialogueStore();
 */
