import { Check, ChevronDown, Copy, Link2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { SEGMENT_META } from '../../lib/segments';
import { getTransitions } from '../../lib/phrase-library';
import { cn, copyToClipboard } from '../../lib/utils';
import type { PromptSegment, SegmentType } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface SmartAssemblyProps {
  segments: PromptSegment[];
  onCopied?: () => void;
}

// Per-pair user-chosen transition index (keyed as "idx_from:idx_to")
type TransitionMap = Record<string, number>;

export function SmartAssembly({ segments, onCopied }: SmartAssemblyProps) {
  const enabled = segments.filter((s) => s.enabled);
  const [smartJoin, setSmartJoin] = useState(true);
  const [transitions, setTransitions] = useState<TransitionMap>({});
  const [copied, setCopied] = useState(false);

  function pairKey(a: SegmentType, b: SegmentType) {
    return `${a}:${b}`;
  }

  function getTransitionText(fromType: SegmentType, toType: SegmentType): string {
    if (!smartJoin) return '';
    const key = pairKey(fromType, toType);
    const opts = getTransitions(fromType, toType);
    const idx = transitions[key] ?? 0;
    return opts[idx]?.text ?? '';
  }

  function cycleTransition(fromType: SegmentType, toType: SegmentType) {
    const key = pairKey(fromType, toType);
    const opts = getTransitions(fromType, toType);
    const current = transitions[key] ?? 0;
    setTransitions((prev) => ({ ...prev, [key]: (current + 1) % opts.length }));
  }

  function getTransitionLabel(fromType: SegmentType, toType: SegmentType): string {
    if (!smartJoin) return '';
    const key = pairKey(fromType, toType);
    const opts = getTransitions(fromType, toType);
    const idx = transitions[key] ?? 0;
    return opts[idx]?.label ?? '';
  }

  const assembleText = useCallback(() => {
    return enabled
      .map((seg, i) => {
        const prev = enabled[i - 1];
        const connector = prev ? getTransitionText(prev.type, seg.type) : '';
        return `${connector}${seg.content.trim()}`;
      })
      .join('\n\n');
  }, [enabled, smartJoin, transitions]);

  async function handleCopy() {
    const text = assembleText();
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 1800);
    }
  }

  if (enabled.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-slate-400">
        Enable segments on the left to see the assembled prompt here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setSmartJoin((s) => !s)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
            smartJoin
              ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800',
          )}
          title="Toggle smart linking phrases between segments"
        >
          <Link2 className="h-3 w-3" />
          Smart Join {smartJoin ? 'On' : 'Off'}
        </button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? 'Copied!' : 'Copy all'}
        </Button>
      </div>

      {/* Assembled segments with inline connectors */}
      <div className="space-y-0">
        {enabled.map((seg, i) => {
          const prev = enabled[i - 1];
          const meta = SEGMENT_META[seg.type];
          const connector = prev ? getTransitionText(prev.type, seg.type) : '';
          const connectorLabel = prev ? getTransitionLabel(prev.type, seg.type) : '';
          const hasConnector = !!connector.trim();

          return (
            <div key={seg.id}>
              {/* Linking phrase between segments */}
              {prev && smartJoin && (
                <button
                  onClick={() => cycleTransition(prev.type, seg.type)}
                  className={cn(
                    'group mx-auto my-1 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] transition-colors',
                    hasConnector
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                      : 'bg-slate-50 text-slate-400 border border-dashed border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700',
                  )}
                  title="Click to cycle linking phrases"
                >
                  <Link2 className="h-2.5 w-2.5 shrink-0" />
                  <span className="max-w-[140px] truncate">
                    {hasConnector ? connectorLabel : 'No connector — click to add'}
                  </span>
                  <ChevronDown className="h-2.5 w-2.5 shrink-0 opacity-60" />
                </button>
              )}
              {prev && !smartJoin && (
                <div className="my-1.5 border-t border-dashed border-slate-100 dark:border-slate-800" />
              )}

              {/* Segment block */}
              <div className="rounded border border-slate-100 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                <span
                  className={cn(
                    'mb-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                    meta.badgeClass,
                  )}
                >
                  {meta.label}
                </span>
                {hasConnector && (
                  <span className="ml-1.5 text-[10px] italic text-amber-600 dark:text-amber-400 opacity-70">
                    ↳ {connector.trim()}
                  </span>
                )}
                <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {seg.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
