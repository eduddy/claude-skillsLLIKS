'use client';

import { BookOpen, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useApp, useCategory, useService } from '@/context/AppContext';
import { blankSegment } from '@/lib/segments';
import { cn, truncate } from '@/lib/utils';
import type { Prompt, PromptSegment } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SnippetPickerProps {
  open: boolean;
  onClose: () => void;
  onInsert: (segment: PromptSegment) => void;
  topic: string;
}

export function SnippetPicker({ open, onClose, onInsert, topic }: SnippetPickerProps) {
  const { state } = useApp();
  const [query, setQuery] = useState('');

  const filtered = state.prompts.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  function handleInsert(prompt: Prompt) {
    const seg = blankSegment('context', topic);
    seg.content = prompt.content;
    onInsert(seg);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex h-[70vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-500" />
            <DialogTitle className="text-base">Insert from Library</DialogTitle>
          </div>
          <p className="text-xs text-slate-400">
            Pick a saved prompt to insert as a new segment in the builder.
          </p>
        </DialogHeader>

        <div className="shrink-0 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved prompts…"
              className="pl-8 text-sm h-8"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No prompts found</p>
            )}
            {filtered.map((prompt) => (
              <SnippetRow
                key={prompt.id}
                prompt={prompt}
                onInsert={handleInsert}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function SnippetRow({
  prompt,
  onInsert,
}: {
  prompt: Prompt;
  onInsert: (p: Prompt) => void;
}) {
  const category = useCategory(prompt.categoryId);
  const service = useService(prompt.aiServiceId);

  return (
    <div className="group flex items-start gap-3 rounded-md px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {prompt.title}
          </span>
          {service && (
            <Badge
              variant="secondary"
              className={cn('text-[10px] border-0', service.bgLight, service.textColor)}
            >
              {service.name}
            </Badge>
          )}
          {category && (
            <Badge variant="outline" className="text-[10px]">
              {category.name}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-400 font-mono leading-relaxed">
          {truncate(prompt.content, 120)}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onInsert(prompt)}
      >
        Insert
      </Button>
    </div>
  );
}
