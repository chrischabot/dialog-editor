"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface HighlightedTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with audio tags highlighted in purple/magenta
 * like the ElevenLabs interface
 */
export function HighlightedText({ text, className }: HighlightedTextProps) {
  const parts = React.useMemo(() => {
    const result: Array<{ type: "text" | "tag"; content: string }> = [];

    // Match audio tags like [excited], [whispers], [British accent], etc.
    const tagRegex = /\[([\w\s-]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(text)) !== null) {
      // Add text before the tag
      if (match.index > lastIndex) {
        result.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        });
      }

      // Add the tag (including brackets)
      result.push({
        type: "tag",
        content: match[0],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last tag
    if (lastIndex < text.length) {
      result.push({
        type: "text",
        content: text.slice(lastIndex),
      });
    }

    return result;
  }, [text]);

  if (!text) {
    return null;
  }

  return (
    <span className={cn("whitespace-pre-wrap", className)}>
      {parts.map((part, index) => {
        if (part.type === "tag") {
          return (
            <span
              key={index}
              className="bg-fuchsia-100 text-fuchsia-700 rounded px-1 py-0.5 font-medium"
            >
              {part.content}
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}

/**
 * A textarea that shows highlighted tags when not focused,
 * and plain text editing when focused
 */
interface HighlightedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onValueChange?: (value: string) => void;
}

export const HighlightedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  HighlightedTextareaProps
>(({ value, onValueChange, className, onChange, onFocus, onBlur, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const combinedRef = (node: HTMLTextAreaElement) => {
    textareaRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  const handleDisplayClick = () => {
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Display layer with highlighted tags - shown when not focused */}
      {!isFocused && value && (
        <div
          onClick={handleDisplayClick}
          className={cn(
            "absolute inset-0 cursor-text overflow-hidden",
            className
          )}
        >
          <HighlightedText text={value} className="text-sm" />
        </div>
      )}

      {/* Actual textarea - always present but invisible when showing display */}
      <textarea
        ref={combinedRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          className,
          !isFocused && value ? "text-transparent caret-transparent" : ""
        )}
        {...props}
      />
    </div>
  );
});

HighlightedTextarea.displayName = "HighlightedTextarea";
