"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  title: string;
  onBack: () => void;
  onSave: () => void;
  onTitleChange: (newTitle: string) => void;
  modelMode: "fast" | "full";
  onModelModeChange: (mode: "fast" | "full") => void;
}

export function EditorHeader({
  title,
  onBack,
  onSave,
  onTitleChange,
  modelMode,
  onModelModeChange,
}: EditorHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState(title);

  React.useEffect(() => {
    setTitleValue(title);
  }, [title]);

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      onTitleChange(titleValue.trim());
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-alpha-200 bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
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
                {title}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Model Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-alpha-100 rounded-lg p-1">
            <button
              onClick={() => onModelModeChange("fast")}
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
              onClick={() => onModelModeChange("full")}
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
          <Button onClick={onSave}>Save</Button>
        </div>
      </div>
    </header>
  );
}
