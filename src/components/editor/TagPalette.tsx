'use client';

import * as React from 'react';
import {
  Heart,
  Mic,
  Volume2,
  User,
  BrainCircuit,
  Clock,
  MessagesSquare,
  Info
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { getTagsByCategory, TAG_CATEGORIES } from '@/lib/audioTags';
import type { AudioTag, TagCategory } from '@/types/dialogue';

interface TagPaletteProps {
  onTagSelect: (tag: AudioTag) => void;
  selectedLineId: string | null;
}

// Map icon names from TAG_CATEGORIES to actual Lucide icon components
const iconMap = {
  Heart,
  Mic,
  Volume2,
  User,
  BrainCircuit,
  Clock,
  MessagesSquare,
};

export function TagPalette({ onTagSelect, selectedLineId }: TagPaletteProps) {
  const [selectedTag, setSelectedTag] = React.useState<AudioTag | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<TagCategory>('emotion');

  // Get all categories
  const categories = Object.keys(TAG_CATEGORIES) as TagCategory[];

  const handleTagClick = (tag: AudioTag) => {
    setSelectedTag(tag);
    onTagSelect(tag);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Audio Tags</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p>
                Audio tags modify how your dialogue is spoken. Select a line in the script,
                then click a tag to apply it.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={(value) => setActiveCategory(value as TagCategory)}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="grid grid-cols-4 gap-1 h-auto p-1 mb-3">
          {categories.map((category) => {
            const IconComponent = iconMap[TAG_CATEGORIES[category].icon as keyof typeof iconMap];
            return (
              <TooltipProvider key={category}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={category}
                      className="flex flex-col items-center gap-1 px-2 py-2 h-auto"
                    >
                      {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
                      <span className="text-[10px] leading-none">
                        {TAG_CATEGORIES[category].label.split(' ')[0]}
                      </span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    {TAG_CATEGORIES[category].label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </TabsList>

        {/* Tag Grid for each category */}
        <div className="flex-1 overflow-y-auto">
          {categories.map((category) => {
            const tags = getTagsByCategory(category);
            return (
              <TabsContent
                key={category}
                value={category}
                className="mt-0 data-[state=inactive]:hidden"
              >
                <div className="grid grid-cols-3 gap-2">
                  {tags.map((tag) => (
                    <TooltipProvider key={tag.id}>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleTagClick(tag)}
                            className="px-2 py-1 text-xs rounded-full h-auto whitespace-normal text-left justify-start"
                          >
                            {tag.displayName}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium">{tag.displayName}</p>
                            <p className="text-gray-400">{tag.description}</p>
                            <p className="text-gray-500 italic text-[10px] mt-1">
                              Example: {tag.example}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>

      {/* Selected Tag Info */}
      {selectedTag && (
        <div className="mt-4 pt-4 border-t border-gray-alpha-200">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="rounded-full">
              {selectedTag.displayName}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedLineId
              ? 'Tag will be inserted at cursor position'
              : 'Select a line in the script to apply this tag'}
          </p>
        </div>
      )}
    </div>
  );
}
