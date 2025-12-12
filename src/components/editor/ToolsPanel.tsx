"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TagPalette } from "./TagPalette";
import { CostEstimator } from "./CostEstimator";
import type { AudioTag, Dialogue } from "@/types/dialogue";

interface ToolsPanelProps {
  dialogue: Dialogue;
  modelMode: "fast" | "full";
  selectedLineId: string | null;
  onApplyTag: (tag: AudioTag) => void;
}

/**
 * Right sidebar panel containing tag palette and cost estimator
 */
export function ToolsPanel({
  dialogue,
  modelMode,
  selectedLineId,
  onApplyTag,
}: ToolsPanelProps) {
  return (
    <aside className="w-[320px] border-l border-gray-alpha-200 bg-background flex flex-col overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <TagPalette
            selectedLineId={selectedLineId}
            onApplyTag={onApplyTag}
          />

          <Separator />

          <CostEstimator dialogue={dialogue} modelMode={modelMode} />
        </div>
      </ScrollArea>
    </aside>
  );
}
