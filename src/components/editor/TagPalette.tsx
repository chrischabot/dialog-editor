"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AudioTag, TagCategory } from "@/types/dialogue";
import { AUDIO_TAGS as AUDIO_TAGS_CATALOG, TAG_CATEGORIES } from "@/lib/audioTags";

interface TagPaletteProps {
  selectedLineId: string | null;
  onApplyTag: (tag: AudioTag) => void;
}

const CATEGORY_ORDER: TagCategory[] = [
  "emotion",
  "delivery",
  "sound",
  "character",
  "narrative",
  "pacing",
  "dialogue",
];

const DEFAULT_EXPANDED = ["emotion", "delivery"];

/**
 * Collapsible palette of audio tags for adding expression to dialogue
 */
export function TagPalette({ selectedLineId, onApplyTag }: TagPaletteProps) {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    new Set(DEFAULT_EXPANDED)
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const tagsByCategory = React.useMemo(() => {
    const categories: Record<string, AudioTag[]> = {};
    for (const tag of AUDIO_TAGS_CATALOG) {
      if (!categories[tag.category]) {
        categories[tag.category] = [];
      }
      categories[tag.category].push(tag);
    }
    return categories;
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Audio Tags</h3>
        {!selectedLineId && (
          <span className="text-xs text-gray-400">Select a line</span>
        )}
      </div>
      <div className="space-y-1">
        {CATEGORY_ORDER.map((category) => {
          const tags = tagsByCategory[category];
          if (!tags || tags.length === 0) return null;
          const categoryMeta = TAG_CATEGORIES[category];
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="border border-gray-alpha-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-alpha-50 transition-colors"
              >
                <span className="text-xs font-medium text-gray-600">
                  {categoryMeta?.label || category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{tags.length}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-gray-400 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 pt-1">
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
