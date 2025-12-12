'use client';

import { useState } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { Dialogue, Speaker } from '@/types/dialogue';

interface JsonPreviewProps {
  dialogue: Dialogue;
  speakers: Speaker[];
}

export function JsonPreview({ dialogue, speakers }: JsonPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReadable, setIsReadable] = useState(true);

  // Build the ElevenLabs API payload
  const apiPayload = {
    model_id: 'eleven_v3',
    dialogue: dialogue.lines.map(line => {
      const speaker = speakers.find(s => s.id === line.speakerId);
      return {
        text: line.text,
        voice_id: speaker?.voiceId || '',
      };
    }),
  };

  const jsonString = isReadable
    ? JSON.stringify(apiPayload, null, 2)
    : JSON.stringify(apiPayload);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      toast.success('API payload copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Simple syntax highlighting for JSON
  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const highlightJson = (json: string) => {
    const escapedJson = escapeHtml(json);
    return escapedJson
      .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="text-green-400">"$1"</span>')
      .replace(/: (\d+)/g, ': <span class="text-orange-400">$1</span>')
      .replace(/: (true|false|null)/g, ': <span class="text-purple-400">$1</span>');
  };

  return (
    <div className="border rounded-lg bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            API Payload
          </button>
          <span className="text-xs text-muted-foreground">
            ({dialogue.lines.length} {dialogue.lines.length === 1 ? 'line' : 'lines'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded && (
            <>
              <Button
                variant={isReadable ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setIsReadable(true)}
              >
                Readable
              </Button>
              <Button
                variant={!isReadable ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setIsReadable(false)}
              >
                Minified
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>

      {/* JSON Content */}
      {isExpanded && (
        <>
          <Separator />
          <ScrollArea className="max-h-[400px]">
            <pre className="p-4 text-sm font-mono bg-muted/30">
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightJson(jsonString)
                }}
              />
            </pre>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
