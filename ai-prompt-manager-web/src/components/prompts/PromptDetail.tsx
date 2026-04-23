'use client';

import { Check, Copy, Pencil, Star, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp, useCategory, usePrompt, useService } from '@/context/AppContext';
import { copyToClipboard, extractVariables, formatDate, substituteVariables } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function PromptDetail() {
  const { state, dispatch } = useApp();
  const prompt = usePrompt(state.ui.activePromptId);
  const category = useCategory(prompt?.categoryId ?? null);
  const service = useService(prompt?.aiServiceId ?? null);

  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Reset variable values when the open prompt changes
  useEffect(() => {
    if (!prompt) return;
    const defaults: Record<string, string> = {};
    for (const v of prompt.variables) {
      defaults[v.name] = v.defaultValue ?? '';
    }
    setVarValues(defaults);
    setCopied(false);
  }, [prompt?.id]);

  function close() {
    dispatch({ type: 'CLOSE_DETAIL' });
  }

  async function handleCopy() {
    if (!prompt) return;
    const text =
      prompt.variables.length > 0
        ? substituteVariables(prompt.content, varValues)
        : prompt.content;
    const ok = await copyToClipboard(text);
    if (ok) {
      dispatch({ type: 'INCREMENT_USAGE', payload: { id: prompt.id } });
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  function handleEdit() {
    if (!prompt) return;
    dispatch({ type: 'CLOSE_DETAIL' });
    dispatch({ type: 'OPEN_EDIT', payload: { id: prompt.id } });
  }

  function handleDelete() {
    if (!prompt) return;
    if (confirm(`Delete "${prompt.title}"?`)) {
      dispatch({ type: 'DELETE_PROMPT', payload: { id: prompt.id } });
      close();
    }
  }

  function handleFavorite() {
    if (!prompt) return;
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { id: prompt.id } });
  }

  // Build preview with substitutions highlighted
  const hasVars = (prompt?.variables.length ?? 0) > 0;
  const previewContent = prompt
    ? hasVars
      ? substituteVariables(prompt.content, varValues)
      : prompt.content
    : '';

  // Highlight unfilled variables
  const highlightedPreview = previewContent.replace(
    /\{(\w+)\}/g,
    (match) => `<mark class="bg-amber-100 dark:bg-amber-900 rounded px-0.5 text-amber-800 dark:text-amber-200">${match}</mark>`,
  );

  return (
    <Sheet open={!!state.ui.activePromptId} onOpenChange={(open) => !open && close()}>
      <SheetContent className="flex w-full flex-col sm:max-w-xl overflow-y-auto">
        {prompt && (
          <>
            <SheetHeader className="space-y-2 pr-8">
              <div className="flex items-start justify-between gap-2">
                <SheetTitle className="text-left leading-snug">{prompt.title}</SheetTitle>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {service && (
                  <Badge
                    variant="secondary"
                    className={cn('border-0 text-xs', service.bgLight, service.textColor)}
                  >
                    {service.name}
                  </Badge>
                )}
                {category && (
                  <Badge variant="outline" className="text-xs">
                    {category.name}
                  </Badge>
                )}
                {prompt.isFavorite && (
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                )}
              </div>
            </SheetHeader>

            <div className="mt-4 flex-1 space-y-4">
              {/* Description */}
              {prompt.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{prompt.description}</p>
              )}

              {/* Variable inputs */}
              {hasVars && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                  <p className="mb-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Fill in variables
                  </p>
                  <div className="space-y-2.5">
                    {prompt.variables.map((v) => (
                      <div key={v.name} className="space-y-1">
                        <Label className="flex items-center gap-1.5 text-xs">
                          <code className="rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            {'{' + v.name + '}'}
                          </code>
                          {v.description && (
                            <span className="text-slate-400">{v.description}</span>
                          )}
                        </Label>
                        <Input
                          value={varValues[v.name] ?? ''}
                          onChange={(e) =>
                            setVarValues((prev) => ({ ...prev, [v.name]: e.target.value }))
                          }
                          placeholder={v.defaultValue ?? `Enter ${v.name}…`}
                          className="h-8 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt content preview */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">
                  {hasVars ? 'Preview with substitutions' : 'Prompt content'}
                </Label>
                <div
                  className="rounded-md border border-slate-200 bg-white p-3 font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-wrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 max-h-64 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: highlightedPreview }}
                />
              </div>

              {/* Tags */}
              {prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="text-xs text-slate-400 space-y-0.5">
                <p>Created {formatDate(prompt.createdAt)}</p>
                <p>Updated {formatDate(prompt.updatedAt)}</p>
                {prompt.usageCount > 0 && <p>Used {prompt.usageCount} time{prompt.usageCount !== 1 ? 's' : ''}</p>}
              </div>
            </div>

            {/* Action bar */}
            <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
              <Button className="flex-1 gap-2" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Prompt
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleFavorite}
                title={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={cn(
                    'h-4 w-4',
                    prompt.isFavorite ? 'fill-amber-400 text-amber-400' : '',
                  )}
                />
              </Button>
              <Button variant="outline" size="icon" onClick={handleEdit} title="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
