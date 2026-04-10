import { Check, Copy, Loader2, Search, Sparkles, Wand2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ALL_SEGMENT_TYPES,
  PRESETS,
  SEGMENT_META,
  assembleClean,
  blankSegment,
  generateSegments,
} from '../../lib/segments';
import { copyToClipboard, generateId } from '../../lib/utils';
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
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { AddSegmentPicker, SegmentCard } from './SegmentCard';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

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
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'assemble'>('build');
  const [filterType, setFilterType] = useState<SegmentType | 'all'>('all');
  const topicInputRef = useRef<HTMLInputElement>(null);

  const assembledText = assembleClean(segments);
  const enabledCount = segments.filter((s) => s.enabled).length;

  // Reset when dialog closes
  useEffect(() => {
    if (!ui.isBuilderOpen) {
      setTopic('');
      setSegments([]);
      setSaveTitle('');
      setSaveDescription('');
      setActiveTab('build');
      setFilterType('all');
      setSaved(false);
    } else {
      setTimeout(() => topicInputRef.current?.focus(), 100);
    }
  }, [ui.isBuilderOpen]);

  // Auto-update save title from topic
  useEffect(() => {
    if (topic.trim() && !saveTitle) {
      setSaveTitle(
        topic.trim().charAt(0).toUpperCase() + topic.trim().slice(1),
      );
    }
  }, [topic]);

  function handleGenerate() {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setSaved(false);
    // Simulate brief "thinking" for UX feedback
    setTimeout(() => {
      setSegments(generateSegments(topic.trim()));
      setIsGenerating(false);
      setActiveTab('build');
    }, 320);
  }

  function handlePreset(presetTopic: string, presetLabel: string) {
    setTopic(presetTopic);
    setSaveTitle(presetLabel);
    setIsGenerating(true);
    setSaved(false);
    setTimeout(() => {
      setSegments(generateSegments(presetTopic));
      setIsGenerating(false);
    }, 320);
  }

  // ── Segment mutations ──────────────────────────────────────────────────────

  const updateContent = useCallback((id: string, content: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s)),
    );
  }, []);

  const toggleSegment = useCallback((id: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  }, []);

  const moveSegment = useCallback((id: string, direction: 'up' | 'down') => {
    setSegments((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const removeSegment = useCallback((id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const regenerateSegment = useCallback(
    (id: string) => {
      setSegments((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const fresh = blankSegment(s.type, topic || 'the task');
          return { ...s, content: fresh.content };
        }),
      );
    },
    [topic],
  );

  const addSegment = useCallback((segment: PromptSegment) => {
    setSegments((prev) => [...prev, segment]);
  }, []);

  // ── Copy assembled ─────────────────────────────────────────────────────────

  async function handleCopy() {
    const ok = await copyToClipboard(assembledText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  // ── Save to library ────────────────────────────────────────────────────────

  function handleSave() {
    if (!saveTitle.trim() || !assembledText.trim()) return;
    dispatch({
      type: 'ADD_PROMPT',
      payload: {
        title: saveTitle.trim(),
        content: assembledText,
        description: saveDescription.trim() || `Built with Prompt Builder from topic: "${topic}"`,
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

  // ── Filtered view ──────────────────────────────────────────────────────────

  const visibleSegments =
    filterType === 'all'
      ? segments
      : segments.filter((s) => s.type === filterType);

  const existingTypes = new Set(segments.map((s) => s.type));

  const isOpen = ui.isBuilderOpen;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && dispatch({ type: 'CLOSE_BUILDER' })}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0">
        {/* ── Title bar ── */}
        <DialogHeader className="shrink-0 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-indigo-500" />
            <DialogTitle>Prompt Builder</DialogTitle>
            <span className="text-xs text-slate-400">
              — type a topic, generate segments, combine into a complete prompt
            </span>
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

          {/* ════ LEFT PANEL: Input + segments ════ */}
          <div className="flex min-h-0 flex-1 flex-col border-r border-slate-200 dark:border-slate-700">

            {/* Topic input */}
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
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>

              {/* Quick-start presets */}
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

              {/* Segment type filter */}
              {segments.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <button
                    onClick={() => setFilterType('all')}
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs transition-colors',
                      filterType === 'all'
                        ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-800'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400',
                    )}
                  >
                    All ({segments.length})
                  </button>
                  {ALL_SEGMENT_TYPES.filter((t) => existingTypes.has(t)).map((type) => {
                    const meta = SEGMENT_META[type];
                    const count = segments.filter((s) => s.type === type).length;
                    return (
                      <button
                        key={type}
                        onClick={() => setFilterType(type === filterType ? 'all' : type)}
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors',
                          filterType === type ? meta.badgeClass : 'bg-slate-100 text-slate-400 dark:bg-slate-800 hover:bg-slate-200',
                        )}
                      >
                        {meta.label} ({count})
                      </button>
                    );
                  })}
                </div>
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
                  <p className="text-sm font-medium">Enter a topic above to generate segments</p>
                  <p className="text-xs">
                    Each segment covers a different aspect of an effective prompt — role, task, constraints, format, and more.
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
                      onChange={updateContent}
                      onToggle={toggleSegment}
                      onMove={moveSegment}
                      onRemove={removeSegment}
                      onRegenerate={regenerateSegment}
                    />
                  ))}

                  <AddSegmentPicker
                    existingTypes={existingTypes as Set<SegmentType>}
                    topic={topic}
                    onAdd={addSegment}
                  />
                </div>
              )}
            </ScrollArea>
          </div>

          {/* ════ RIGHT PANEL: Assembled preview + save ════ */}
          <div className="flex w-full shrink-0 flex-col lg:w-80 xl:w-96">
            <div className="shrink-0 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={handleCopy}
                  disabled={!assembledText}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Preview area */}
            <ScrollArea className="min-h-0 flex-1">
              <div className="px-4 py-3">
                {assembledText ? (
                  <AssembledPreview segments={segments} />
                ) : (
                  <p className="py-8 text-center text-xs text-slate-400">
                    Enable segments on the left to see the combined prompt here.
                  </p>
                )}
              </div>
            </ScrollArea>

            <Separator />

            {/* Save form */}
            {segments.length > 0 && (
              <div className="shrink-0 space-y-3 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Save to Library
                </p>

                <div className="space-y-2">
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
                          <SelectItem key={s.id} value={s.id} className="text-xs">
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={saveCategoryId} onValueChange={setSaveCategoryId}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="text-xs">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleSave}
                  disabled={!saveTitle.trim() || !assembledText || saved}
                >
                  {saved ? (
                    <>
                      <Check className="h-4 w-4" />
                      Saved to library!
                    </>
                  ) : (
                    'Save to Library'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assembled preview with section labels ─────────────────────────────────────

function AssembledPreview({ segments }: { segments: PromptSegment[] }) {
  const enabled = segments.filter((s) => s.enabled);
  if (enabled.length === 0) return null;

  return (
    <div className="space-y-3">
      {enabled.map((seg) => {
        const meta = SEGMENT_META[seg.type];
        return (
          <div key={seg.id}>
            <div className="mb-1 flex items-center gap-1.5">
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                  meta.badgeClass,
                )}
              >
                {meta.label}
              </span>
            </div>
            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {seg.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
