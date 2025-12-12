'use client';

import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CostEstimatorProps {
  characterCount: number;
  characterLimit?: number; // From user subscription
}

export function CostEstimator({ characterCount, characterLimit }: CostEstimatorProps) {
  const hasLimit = characterLimit !== undefined && characterLimit > 0;
  const usagePercentage = hasLimit ? (characterCount / characterLimit) * 100 : 0;
  const isOverLimit = hasLimit && characterCount > characterLimit;
  const isNearLimit = hasLimit && usagePercentage > 80 && !isOverLimit;
  const isHighCount = characterCount > 5000;

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="border rounded-lg bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Estimated Cost</h3>
        <a
          href="https://elevenlabs.io/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          Pricing Info
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <Separator />

      {/* Character Count */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Character Count</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums">
              {formatNumber(characterCount)}
            </span>
            {hasLimit && (
              <span className="text-sm text-muted-foreground">
                / {formatNumber(characterLimit)}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {hasLimit && (
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverLimit
                    ? 'bg-destructive'
                    : isNearLimit
                    ? 'bg-yellow-500'
                    : 'bg-primary'
                }`}
                style={{
                  width: `${Math.min(usagePercentage, 100)}%`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{usagePercentage.toFixed(1)}% used</span>
              {isOverLimit && (
                <span className="text-destructive font-medium">
                  {formatNumber(characterCount - characterLimit)} over limit
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Warnings */}
      {(isHighCount || isOverLimit || isNearLimit) && (
        <>
          <Separator />
          <div className="space-y-2">
            {isOverLimit && (
              <Badge variant="destructive" className="gap-1.5 w-full justify-center">
                <AlertTriangle className="h-3 w-3" />
                Character limit exceeded
              </Badge>
            )}
            {isNearLimit && (
              <Badge variant="outline" className="gap-1.5 w-full justify-center border-yellow-500 text-yellow-600 dark:text-yellow-500">
                <AlertTriangle className="h-3 w-3" />
                Near character limit
              </Badge>
            )}
            {isHighCount && !hasLimit && (
              <Badge variant="outline" className="gap-1.5 w-full justify-center border-yellow-500 text-yellow-600 dark:text-yellow-500">
                <AlertTriangle className="h-3 w-3" />
                High character count (&gt; 5,000)
              </Badge>
            )}
          </div>
        </>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Character count excludes audio tags.</p>
        {!hasLimit && (
          <p className="text-yellow-600 dark:text-yellow-500">
            Connect your ElevenLabs account to see usage limits.
          </p>
        )}
      </div>
    </div>
  );
}
