import { ChevronDown, ChevronUp, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { SEGMENT_META, blankSegment } from '../../lib/segments';
import { cn } from '../../lib/utils';
import type { PromptSegment, SegmentType } from '../../types';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface SegmentCardProps {
  segment: PromptSegment;
  index: number;
  total: number;
  topic: string;
  onChange: (id: string, content: string) => void;
  onToggle: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onRemove: (id: string) => void;
  onRegenerate: (id: string) => void;
}

export function SegmentCard({
  segment,
  index,
  total,
  topic,
  onChange,
  onToggle,
  onMove,
  onRemove,
  onRegenerate,
}: SegmentCardProps) {
  const meta = SEGMENT_META[segment.type];
  const [expanded, setExpanded] = useState(true);

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
      {/* Header row */}
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
        <span
          className={cn(
            'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
            meta.badgeClass,
          )}
        >
          {meta.label}
        </span>

        {/* Hint */}
        {!expanded && (
          <span className="min-w-0 flex-1 truncate text-xs text-slate-400">
            {segment.content.slice(0, 60)}…
          </span>
        )}
        {expanded && (
          <span className="min-w-0 flex-1 truncate text-xs text-slate-400 hidden sm:block">
            {meta.hint}
          </span>
        )}

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Move up"
            disabled={index === 0}
            onClick={() => onMove(segment.id, 'up')}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Move down"
            disabled={index === total - 1}
            onClick={() => onMove(segment.id, 'down')}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Reset to template"
            onClick={() => onRegenerate(segment.id)}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-400 hover:text-red-600"
            title="Remove segment"
            onClick={() => onRemove(segment.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400"
            title={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Editable content */}
      {expanded && (
        <div className="px-3 pb-3">
          <Textarea
            value={segment.content}
            onChange={(e) => onChange(segment.id, e.target.value)}
            rows={Math.min(Math.max(segment.content.split('\n').length + 1, 3), 8)}
            className={cn(
              'resize-none font-mono text-xs leading-relaxed',
              !segment.enabled && 'opacity-60',
            )}
            placeholder={`Enter ${SEGMENT_META[segment.type].label.toLowerCase()} content…`}
          />
        </div>
      )}
    </div>
  );
}

// ─── Add-segment picker ────────────────────────────────────────────────────────

interface AddSegmentPickerProps {
  existingTypes: Set<SegmentType>;
  topic: string;
  onAdd: (segment: PromptSegment) => void;
}

const TYPE_ORDER: SegmentType[] = [
  'role', 'task', 'context', 'input', 'constraints',
  'format', 'tone', 'examples', 'chain_of_thought', 'refinement',
];

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
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Choose type
          </p>
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
