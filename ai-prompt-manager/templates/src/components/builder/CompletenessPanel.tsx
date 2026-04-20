import { CheckCircle2, Circle, Minus, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { SEGMENT_META, blankSegment } from '../../lib/segments';
import {
  getCompletenessReport,
  type ChecklistItem,
  type CompletenessStage,
  type ImpactLevel,
} from '../../lib/phrase-library';
import { cn } from '../../lib/utils';
import type { PromptSegment, SegmentType } from '../../types';

interface CompletenessPanelProps {
  segments: PromptSegment[];
  category: string;
  topic: string;
  onAddSegment: (seg: PromptSegment) => void;
}

const STAGE_CONFIG: Record<CompletenessStage, {
  color: string;
  barColor: string;
  textColor: string;
}> = {
  starter:    { color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',       barColor: 'bg-red-400',    textColor: 'text-red-600 dark:text-red-400' },
  functional: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', barColor: 'bg-amber-400',  textColor: 'text-amber-600 dark:text-amber-400' },
  polished:   { color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',    barColor: 'bg-blue-500',   textColor: 'text-blue-600 dark:text-blue-400' },
  expert:     { color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300', barColor: 'bg-green-500',  textColor: 'text-green-600 dark:text-green-400' },
};

const IMPACT_CONFIG: Record<ImpactLevel, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' },
  high:     { label: 'High',     color: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400' },
  medium:   { label: 'Medium',   color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  low:      { label: 'Low',      color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
};

export function CompletenessPanel({ segments, category, topic, onAddSegment }: CompletenessPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const enabledTypes = new Set(segments.filter((s) => s.enabled).map((s) => s.type));
  const presentTypes = new Set(segments.map((s) => s.type));
  const report = getCompletenessReport(enabledTypes, presentTypes, category);
  const stage = STAGE_CONFIG[report.stage];

  function handleAdd(type: SegmentType) {
    onAddSegment(blankSegment(type, topic || 'the task'));
  }

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
      {/* ── Header row ── */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        <span className="flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Prompt Completeness
        </span>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', stage.color)}>
          {report.stageLabel}
        </span>
        <span className={cn('text-xs font-bold tabular-nums', stage.textColor)}>
          {report.score}%
        </span>
      </button>

      {/* ── Progress bar ── */}
      <div className="mx-3 mb-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={cn('h-1.5 rounded-full transition-all duration-500', stage.barColor)}
          style={{ width: `${report.score}%` }}
        />
      </div>

      {/* ── Expanded content ── */}
      {expanded && (
        <div className="border-t border-slate-200 px-3 py-2.5 space-y-3 dark:border-slate-700">

          {/* Segment checklist */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Segment checklist — {category}
            </p>
            <div className="space-y-1">
              {report.checklist.map((item) => (
                <ChecklistRow key={item.type} item={item} onAdd={() => handleAdd(item.type)} />
              ))}
            </div>
          </div>

          {/* Ranked next steps */}
          {report.nextSteps.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Recommended next
              </p>
              <div className="space-y-1.5">
                {report.nextSteps.map((item, i) => (
                  <NextStepRow
                    key={item.type}
                    item={item}
                    rank={i + 1}
                    onAdd={() => handleAdd(item.type)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stage tip */}
          <div className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 dark:border-amber-900 dark:bg-amber-950/30">
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              💡 {report.stageTip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistRow({ item, onAdd }: { item: ChecklistItem; onAdd: () => void }) {
  const meta = SEGMENT_META[item.type];
  const impact = IMPACT_CONFIG[item.impact];

  return (
    <div className="group flex items-center gap-2">
      {item.state === 'enabled' ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
      ) : item.state === 'disabled' ? (
        <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
      ) : (
        <Minus className="h-3.5 w-3.5 shrink-0 text-slate-200 dark:text-slate-700" />
      )}
      <span className={cn(
        'min-w-0 flex-1 text-[11px]',
        item.state === 'enabled'
          ? 'text-slate-700 dark:text-slate-200'
          : 'text-slate-400 dark:text-slate-500',
      )}>
        {meta.label}
      </span>
      <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold', impact.color)}>
        {impact.label}
      </span>
      {item.state === 'missing' && (
        <button
          onClick={onAdd}
          className="shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 opacity-0 transition-opacity hover:border-indigo-400 hover:text-indigo-600 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800"
          title={`Add ${meta.label} segment`}
        >
          + Add
        </button>
      )}
    </div>
  );
}

function NextStepRow({ item, rank, onAdd }: { item: ChecklistItem; rank: number; onAdd: () => void }) {
  const meta = SEGMENT_META[item.type];
  const impact = IMPACT_CONFIG[item.impact];

  return (
    <div className="flex items-start gap-2 rounded-md border border-slate-100 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            {meta.label}
          </span>
          <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold', impact.color)}>
            {impact.label}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">{item.why}</p>
      </div>
      <button
        onClick={onAdd}
        disabled={item.state === 'disabled'}
        className={cn(
          'shrink-0 rounded px-2 py-1 text-[10px] font-medium transition-colors',
          item.state === 'missing'
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800',
        )}
      >
        {item.state === 'missing' ? '+ Add' : 'Enable ↑'}
      </button>
    </div>
  );
}
