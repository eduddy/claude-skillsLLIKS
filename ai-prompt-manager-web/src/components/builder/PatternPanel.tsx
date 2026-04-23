'use client';

import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { GUIDE_PATTERNS } from '@/lib/phrase-library';
import { blankSegment } from '@/lib/segments';
import { cn } from '@/lib/utils';
import type { PromptSegment, SegmentType } from '@/types';

interface PatternPanelProps {
  topic: string;
  onApply: (segments: PromptSegment[]) => void;
}

export function PatternPanel({ topic, onApply }: PatternPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function applyPattern(segmentTypes: SegmentType[]) {
    const segments = segmentTypes.map((type) => blankSegment(type, topic || 'the task'));
    onApply(segments);
  }

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <BookOpen className="h-3.5 w-3.5 text-slate-500" />
        <span className="flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Prompt Guide Patterns
        </span>
        <span className="text-[10px] text-slate-400">
          {GUIDE_PATTERNS.length} patterns
        </span>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-200 p-2 dark:border-slate-700">
          <p className="mb-2 px-1 text-[10px] text-slate-400">
            Based on Anthropic Claude, OpenAI, Google Gemini, and DAIR.AI guides.
            Applying a pattern replaces your current segments.
          </p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {GUIDE_PATTERNS.map((pattern) => (
              <div
                key={pattern.id}
                onMouseEnter={() => setHoveredId(pattern.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative rounded-md border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {pattern.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{pattern.source}</p>
                  </div>
                  <button
                    onClick={() => applyPattern(pattern.segments)}
                    className="shrink-0 rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {pattern.description}
                </p>

                {/* Segment type chips */}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {pattern.segments.map((type) => (
                    <span
                      key={type}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium uppercase text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    >
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {/* Tip on hover */}
                {hoveredId === pattern.id && (
                  <div className="absolute bottom-full left-0 right-0 z-10 mb-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 shadow-lg dark:border-amber-800 dark:bg-amber-950">
                    <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
                      💡 Tip
                    </p>
                    <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                      {pattern.tip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
