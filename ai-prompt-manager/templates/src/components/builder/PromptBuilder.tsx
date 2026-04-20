import {
  BookOpen,
  Check,
  Loader2,
  Search,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ALL_SEGMENT_TYPES,
  PRESETS,
  SEGMENT_META,
  assembleClean,
  blankSegment,
  generateSegments,
} from '../../lib/segments';
import {
  scoreCompleteness,
  suggestNextType,
} from '../../lib/phrase-library';
import { copyToClipboard } from '../../lib/utils';
import type { PromptSegment, SegmentType } from '../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { AddSegmentPicker, SegmentCard } from './SegmentCard';
import { SmartAssembly } from './SmartAssembly';
import { SnippetPicker } from './SnippetPicker';
import { PatternPanel } from './PatternPanel';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

// Detect which category the topic maps to (mirrors segments.ts logic, kept local to avoid re-export)
const CATEGORY_SIGNALS: Record<string, string[]> = {
  coding: ['code','function','bug','debug','refactor','test','api','typescript','python','javascript','rust','sql','review','optimize'],
  writing: ['write','blog','post','article','email','draft','essay','report','summary','newsletter','content','rewrite'],
  search: ['search','find','research','query','look up','papers','resources','latest','best','top','compare','vs','options'],
  analysis: ['analyze','analysis','evaluate','assess','compare','data','metrics','insights','trends','audit','interpret'],
  creative: ['story','fiction','poem','creative','brainstorm','ideas','character','plot','narrative','design','concept'],
  explanation: ['explain','what is','how does','teach','tutorial','guide','understand','learn','beginner','overview'],
  business: ['business','proposal','plan','strategy','pitch','deck','market','product','roadmap','revenue','executive'],
};

function detectCategory(topic: string): string {
  const lower = topic.toLowerCase();
  let best = 'general', bestScore = 0;
  for (const [cat, kws] of Object.entries(CATEGORY_SIGNALS)) {
    const score = kws.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return best;
}

// ─── Completeness meter ────────────────────────────────────────────────────────

function CompletionMeter({ segments }: { segments: PromptSegment[] }) {
  const enabledTypes = new Set(
    segments.filter((s) => s.enabled).map((s) => s.type),
  );
  const { score, tips } = scoreCompleteness(enabledTypes);

  const color =
    score >= 80 ? 'bg-green-500'
    : score >= 50 ? 'bg-amber-400'
    : 'bg-red-400';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-medium text-slate-600 dark:text-slate-300">
          Prompt completeness
        </span>
        <span className={cn('font-semibold', score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500')}>
          {score}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={cn('h-1.5 rounded-full transition-all duration-500', color)}
          style={{ width: `${score}%` }}
        />
      </div>
      {tips.length > 0 && score < 80 && (
        <p className="mt-1 text-[10px] text-slate-400 leading-relaxed">{tips[0]}</p>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function PromptBuilder() {
  const { state, dispatch } = useApp();
  const { ui, categories, aiServices } = state;

  const defaultCategoryId = categories.find((c) => c.isDefault)?.id ?? categories[0]?.id ?? '';
  const defaultServiceId = aiServices[0]?.id ?? '';

  const [topic, setTopic] = useState('');
  const [segments, setSegments] = useState<PromptSegment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveCategoryId, setSaveCategoryId] = useState(defaultCategoryId);
  const [saveServiceId, setSaveServiceId] = useState(defaultServiceId);
  const [saveDescription, setSaveDescription] = useState('');
  const [saved, setSaved] = useState(false);
  const [showSnippetPicker, setShowSnippetPicker] = useState(false);
  const [filterType, setFilterType] = useState<SegmentType | 'all'>('all');
  const topicInputRef = useRef<HTMLInputElement>(null);

  const category = detectCategory(topic);
  const enabledCount = segments.filter((s) => s.enabled).length;
  const existingTypes = new Set(segments.map((s) => s.type));
  const nextSuggestion = suggestNextType(existingTypes);

  // Reset on close
  useEffect(() => {
    if (!ui.isBuilderOpen) {
      setTopic(''); setSegments([]); setSaveTitle('');
      setSaveDescription(''); setSaved(false); setFilterType('all');
    } else {
      setTimeout(() => topicInputRef.current?.focus(), 100);
    }
  }, [ui.isBuilderOpen]);

  // Auto-populate title from topic
  useEffect(() => {
    if (topic.trim() && !saveTitle) {
      setSaveTitle(topic.trim().charAt(0).toUpperCase() + topic.trim().slice(1));
    }
  }, [topic]);

  function runGenerate(t: string) {
    setIsGenerating(true);
    setSaved(false);
    setTimeout(() => {
      setSegments(generateSegments(t.trim()));
      setIsGenerating(false);
    }, 320);
  }

  function handleGenerate() {
    if (topic.trim()) runGenerate(topic);
  }

  function handlePreset(presetTopic: string, presetLabel: string) {
    setTopic(presetTopic);
    setSaveTitle(presetLabel);
    runGenerate(presetTopic);
  }

  function handleApplyPattern(newSegments: PromptSegment[]) {
    setSegments(newSegments);
    setSaved(false);
  }

  // ── Segment mutations ──────────────────────────────────────────────────────

  const updateContent = useCallback((id: string, content: string) =>
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, content } : s))), []);

  const toggleSegment = useCallback((id: string) =>
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))), []);

  const moveSegment = useCallback((id: string, dir: 'up' | 'down') =>
    setSegments((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    }), []);

  const removeSegment = useCallback((id: string) =>
    setSegments((prev) => prev.filter((s) => s.id !== id)), []);

  const regenerateSegment = useCallback((id: string) =>
    setSegments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const fresh = blankSegment(s.type, topic || 'the task');
        return { ...s, content: fresh.content };
      })
    ), [topic]);

  const addSegment = useCallback((seg: PromptSegment) =>
    setSegments((prev) => [...prev, seg]), []);

  // ── Save to library ────────────────────────────────────────────────────────

  function handleSave() {
    const assembled = assembleClean(segments);
    if (!saveTitle.trim() || !assembled.trim()) return;
    dispatch({
      type: 'ADD_PROMPT',
      payload: {
        title: saveTitle.trim(),
        content: assembled,
        description: saveDescription.trim() || `Built with Prompt Builder — topic: "${topic}"`,
        aiServiceId: saveServiceId,
        categoryId: saveCategoryId,
        tags: ['builder', ...topic.split(' ').slice(0, 3).map((w) => w.toLowerCase().replace(/\W/g, ''))].filter(Boolean),
        isFavorite: false,
        variables: [],
      },
    });
    setSaved(true);
    setTimeout(() => dispatch({ type: 'CLOSE_BUILDER' }), 900);
  }

  const visibleSegments =
    filterType === 'all' ? segments : segments.filter((s) => s.type === filterType);

  return (
    <>
      <Dialog open={ui.isBuilderOpen} onOpenChange={(open) => !open && dispatch({ type: 'CLOSE_BUILDER' })}>
        <DialogContent className="flex h-[92vh] max-h-[92vh] w-full max-w-6xl flex-col gap-0 overflow-hidden p-0">

          {/* ── Title bar ── */}
          <DialogHeader className="shrink-0 border-b border-slate-200 px-5 py-3 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <Wand2 className="h-5 w-5 text-indigo-500" />
              <DialogTitle>Prompt Builder</DialogTitle>
              <span className="text-xs text-slate-400 hidden sm:block">
                — type a topic · generate typed segments · link & combine into a complete prompt
              </span>
              <div className="ml-auto flex items-center gap-2">
                {state.prompts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => setShowSnippetPicker(true)}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    From Library
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* ── Body: two-column on desktop ── */}
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">

            {/* ════ LEFT: Topic input + segments ════ */}
            <div className="flex min-h-0 flex-1 flex-col border-r border-slate-200 dark:border-slate-700 overflow-hidden">

              {/* Topic input area */}
              <div className="shrink-0 space-y-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <Input
                      ref={topicInputRef}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      placeholder="Describe your prompt topic or goal…"
                      className="pl-8 text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={!topic.trim() || isGenerating}
                    className="shrink-0 gap-1.5"
                  >
                    {isGenerating
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Sparkles className="h-4 w-4" />}
                    Generate
                  </Button>
                </div>

                {/* Presets — shown before first generation */}
                {segments.length === 0 && !isGenerating && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Quick-start presets
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESETS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => handlePreset(p.topic, p.label)}
                          title={p.description}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guide patterns — always accessible once we have a topic */}
                {(segments.length > 0 || topic.trim()) && (
                  <PatternPanel topic={topic} onApply={handleApplyPattern} />
                )}

                {/* Completeness + type filter */}
                {segments.length > 0 && (
                  <>
                    <CompletionMeter segments={segments} />
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                      <FilterChip
                        label={`All (${segments.length})`}
                        active={filterType === 'all'}
                        onClick={() => setFilterType('all')}
                      />
                      {ALL_SEGMENT_TYPES.filter((t) => existingTypes.has(t)).map((type) => {
                        const count = segments.filter((s) => s.type === type).length;
                        return (
                          <FilterChip
                            key={type}
                            label={`${SEGMENT_META[type].label} (${count})`}
                            active={filterType === type}
                            badgeClass={filterType === type ? SEGMENT_META[type].badgeClass : undefined}
                            onClick={() => setFilterType(type === filterType ? 'all' : type)}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Segment list */}
              <ScrollArea className="flex-1 px-4 py-3">
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <p className="text-sm">Generating prompt segments…</p>
                  </div>
                )}

                {!isGenerating && segments.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-slate-400">
                    <Sparkles className="h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium">Type a topic above to generate segments</p>
                    <p className="text-xs max-w-xs">
                      Each labeled segment covers one aspect of a high-quality prompt: role, task, constraints, format, and more.
                    </p>
                  </div>
                )}

                {!isGenerating && visibleSegments.length > 0 && (
                  <div className="space-y-2">
                    {visibleSegments.map((seg, idx) => (
                      <SegmentCard
                        key={seg.id}
                        segment={seg}
                        index={idx}
                        total={visibleSegments.length}
                        topic={topic}
                        category={category}
                        onChange={updateContent}
                        onToggle={toggleSegment}
                        onMove={moveSegment}
                        onRemove={removeSegment}
                        onRegenerate={regenerateSegment}
                      />
                    ))}

                    {/* Next-segment suggestion */}
                    {nextSuggestion && (
                      <button
                        onClick={() => addSegment(blankSegment(nextSuggestion, topic))}
                        className="flex w-full items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors dark:border-slate-700 dark:hover:border-indigo-600"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Suggested next: add a{' '}
                        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase', SEGMENT_META[nextSuggestion].badgeClass)}>
                          {SEGMENT_META[nextSuggestion].label}
                        </span>{' '}
                        segment
                      </button>
                    )}

                    <AddSegmentPicker
                      existingTypes={existingTypes as Set<SegmentType>}
                      topic={topic}
                      onAdd={addSegment}
                    />
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* ════ RIGHT: Assembly + save ════ */}
            <div className="flex w-full shrink-0 flex-col lg:w-80 xl:w-96 overflow-hidden">
              <div className="shrink-0 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Assembled Prompt
                  </span>
                  {enabledCount > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {enabledCount} segment{enabledCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Smart assembly preview */}
              <ScrollArea className="min-h-0 flex-1">
                <div className="px-4 py-3">
                  <SmartAssembly segments={segments} />
                </div>
              </ScrollArea>

              <Separator />

              {/* Save form */}
              {segments.length > 0 && (
                <div className="shrink-0 space-y-2.5 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Save to Library
                  </p>
                  <Input
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    placeholder="Prompt title…"
                    className="h-8 text-sm"
                  />
                  <Input
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="Short description (optional)"
                    className="h-8 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={saveServiceId} onValueChange={setSaveServiceId}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Service" />
                      </SelectTrigger>
                      <SelectContent>
                        {aiServices.map((s) => (
                          <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={saveCategoryId} onValueChange={setSaveCategoryId}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={handleSave}
                    disabled={!saveTitle.trim() || enabledCount === 0 || saved}
                  >
                    {saved ? <><Check className="h-4 w-4" />Saved!</> : 'Save to Library'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Snippet picker portal */}
      <SnippetPicker
        open={showSnippetPicker}
        onClose={() => setShowSnippetPicker(false)}
        onInsert={addSegment}
        topic={topic}
      />
    </>
  );
}

// ── Filter chip helper ─────────────────────────────────────────────────────────

function FilterChip({
  label, active, badgeClass, onClick,
}: {
  label: string;
  active: boolean;
  badgeClass?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-2.5 py-0.5 text-xs transition-colors',
        active && badgeClass
          ? badgeClass
          : active
            ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-800'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400',
      )}
    >
      {label}
    </button>
  );
}
