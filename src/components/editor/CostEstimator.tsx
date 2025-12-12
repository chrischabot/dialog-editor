"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { estimateDialogueCost } from "@/lib/dialogue";
import type { Dialogue } from "@/types/dialogue";

interface CostEstimatorProps {
  dialogue: Dialogue;
  modelMode: "fast" | "full";
}

/**
 * Displays estimated credit cost based on character count and model mode
 */
export function CostEstimator({ dialogue, modelMode }: CostEstimatorProps) {
  const { characterCount, estimatedCredits, creditsPerChar } = React.useMemo(
    () => estimateDialogueCost(dialogue, modelMode),
    [dialogue, modelMode]
  );

  const percentage = Math.min((characterCount / 10000) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Estimated Cost</h3>
        <span className="text-xs text-gray-400">
          {creditsPerChar} credit/char
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
