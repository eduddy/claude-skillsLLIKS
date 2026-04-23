'use client';

import { ChevronDown, ChevronUp, Lightbulb, RotateCcw, Sparkles, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';
import { SEGMENT_META, blankSegment } from '@/lib/segments';
import { getAlternatives, POWER_WORDS } from '@/lib/phrase-library';
import { cn } from '@/lib/utils';
import type { PromptSegment, SegmentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// ─── Detect which power-word groups apply to the segment content ───────────────

function detectWeakPhrases(content: string): typeof POWER_WORDS {
  const lower = content.toLowerCase();
  return POWER_WORDS.filter((g) =>
    g.weak.some((w) => {
      const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return re.test(lower);
    }),
  ).slice(0, 3); // cap at 3 groups to keep the UI light
}

// ─── Segment Card ─────────────────────────────────────────────────────────────

interface SegmentCardProps {
  segment: PromptSegment;
  index: number;
  total: number;
  topic: string;
  category: string;
  onChange: (id: string, content: string) => void;
  onToggle: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onRemove: (id: string) => void;
  onRegenerate: (id: string) => void;
}

export function SegmentCard({
  segment, index, total, topic, category,
  onChange, onToggle, onMove, onRemove, onRegenerate,
}: SegmentCardProps) {
  const meta = SEGMENT_META[segment.type];
  const [expanded, setExpanded] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPowerWords, setShowPowerWords] = useState(false);

  const alternatives = getAlternatives(segment.type, category as never, topic);
  const weakGroups = detectWeakPhrases(segment.content);
  const hasAlternatives = alternatives.length > 0;
  const hasWeak = weakGroups.length > 0;

  function applyAlternative(text: string) {
    onChange(segment.id, text);
    setShowSuggestions(false);
  }

  function applyReplacement(weak: string, strong: string) {
    // Replace first occurrence of any weak word in the group
    const re = new RegExp(`\\b${weak.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const updated = segment.content.replace(re, strong);
    onChange(segment.id, updated);
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 bg-white transition-opacity dark:bg-slate-800',
        meta.accentClass,
        segment.enabled
          ? 'border-slate-200 dark:border-slate-700'
          : 'border-slate-100 opacity-50 dark:border-slate-800',
      )}
    >
      {/* ── Header row ── */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Enable toggle */}
        <button
          onClick={() => onToggle(segment.id)}
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
            segment.enabled
              ? 'border-slate-400 bg-slate-700 text-white dark:border-slate-500 dark:bg-slate-400'
              : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800',
          )}
          title={segment.enabled ? 'Exclude from prompt' : 'Include in prompt'}
        >
          {segment.enabled && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Type badge */}
        <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', meta.badgeClass)}>
          {meta.label}
        </span>

        {!expanded && (
          <span className="min-w-0 flex-1 truncate text-xs text-slate-400">
            {segment.content.slice(0, 55)}…
          </span>
        )}
        {expanded && (
          <span className="hidden min-w-0 flex-1 truncate text-xs text-slate-400 sm:block">
            {meta.hint}
          </span>
        )}

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-0.5">
          {/* Suggestions */}
          {hasAlternatives && (
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-6 w-6', showSuggestions ? 'text-indigo-600' : '')}
              title="Suggest alternatives"
              onClick={() => { setShowSuggestions((s) => !s); setShowPowerWords(false); }}
            >
              <Sparkles className="h-3 w-3" />
            </Button>
          )}
          {/* Power words */}
          {hasWeak && (
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-6 w-6', showPowerWords ? 'text-amber-600' : 'text-amber-500')}
              title="Power word suggestions"
              onClick={() => { setShowPowerWords((p) => !p); setShowSuggestions(false); }}
            >
              <Zap className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Move up"
            disabled={index === 0} onClick={() => onMove(segment.id, 'up')}>
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Move down"
            disabled={index === total - 1} onClick={() => onMove(segment.id, 'down')}>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Reset to template"
            onClick={() => onRegenerate(segment.id)}>
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon"
            className="h-6 w-6 text-red-400 hover:text-red-600" title="Remove"
            onClick={() => onRemove(segment.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400"
            onClick={() => setExpanded((e) => !e)}>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* ── Editable textarea ── */}
      {expanded && (
        <div className="px-3 pb-2">
          <Textarea
            value={segment.content}
            onChange={(e) => onChange(segment.id, e.target.value)}
            rows={Math.min(Math.max(segment.content.split('\n').length + 1, 3), 8)}
            className={cn(
              'resize-none font-mono text-xs leading-relaxed',
              !segment.enabled && 'opacity-60',
            )}
            placeholder={`Enter ${meta.label.toLowerCase()} content…`}
          />
        </div>
      )}

      {/* ── Suggestions panel ── */}
      {showSuggestions && alternatives.length > 0 && (
        <div className="border-t border-indigo-100 bg-indigo-50 px-3 py-2 dark:border-indigo-900 dark:bg-indigo-950/40">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              {alternatives.length} alternative{alternatives.length !== 1 ? 's' : ''} for this segment type
            </span>
          </div>
          <div className="space-y-1.5">
            {alternatives.map((alt, i) => (
              <button
                key={i}
                onClick={() => applyAlternative(alt)}
                className="block w-full rounded border border-indigo-200 bg-white px-2.5 py-2 text-left text-xs text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 transition-colors dark:border-indigo-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span className="font-mono leading-relaxed">{alt}</span>
                <span className="mt-1 block text-[10px] text-indigo-500 dark:text-indigo-400">
                  Click to use this version ↑
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Power word suggestions ── */}
      {showPowerWords && weakGroups.length > 0 && (
        <div className="border-t border-amber-100 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              Strengthen these phrases
            </span>
          </div>
          <div className="space-y-2">
            {weakGroups.map((group, gi) => {
              // Find which specific weak word is in the content
              const foundWeak = group.weak.find((w) => {
                const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                return re.test(segment.content);
              }) ?? group.weak[0];

              return (
                <div key={gi}>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mb-1">
                    "{foundWeak}" → replace with:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {group.strong.map((s) => (
                      <button
                        key={s}
                        onClick={() => applyReplacement(foundWeak, s)}
                        className="rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[10px] font-medium text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-amber-500 dark:text-amber-500 leading-relaxed">
                    {group.hint}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add segment picker ────────────────────────────────────────────────────────

const TYPE_ORDER: SegmentType[] = [
  'role', 'task', 'context', 'input', 'constraints',
  'format', 'tone', 'examples', 'chain_of_thought', 'refinement',
];

interface AddSegmentPickerProps {
  existingTypes: Set<SegmentType>;
  topic: string;
  onAdd: (segment: PromptSegment) => void;
}

export function AddSegmentPicker({ existingTypes, topic, onAdd }: AddSegmentPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5 text-xs"
        onClick={() => setOpen((o) => !o)}
      >
        + Add segment
      </Button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 z-10 mb-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Choose type</p>
          <div className="grid grid-cols-2 gap-1">
            {TYPE_ORDER.map((type) => {
              const meta = SEGMENT_META[type];
              const already = existingTypes.has(type);
              return (
                <button
                  key={type}
                  disabled={already}
                  onClick={() => {
                    onAdd(blankSegment(type, topic));
                    setOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs transition-colors',
                    already
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700',
                  )}
                >
                  <span className={cn('rounded px-1 py-0.5 text-[9px] font-bold', meta.badgeClass)}>
                    {meta.label.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
