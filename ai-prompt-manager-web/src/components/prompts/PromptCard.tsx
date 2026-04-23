'use client';

import { Check, Copy, MoreVertical, Pencil, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useApp, useCategory, useService } from '@/context/AppContext';
import { copyToClipboard, formatDate, truncate } from '@/lib/utils';
import type { Prompt } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface PromptCardProps {
  prompt: Prompt;
  viewMode: 'grid' | 'list';
}

export function PromptCard({ prompt, viewMode }: PromptCardProps) {
  const { dispatch } = useApp();
  const category = useCategory(prompt.categoryId);
  const service = useService(prompt.aiServiceId);
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const ok = await copyToClipboard(prompt.content);
    if (ok) {
      dispatch({ type: 'INCREMENT_USAGE', payload: { id: prompt.id } });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { id: prompt.id } });
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: 'OPEN_EDIT', payload: { id: prompt.id } });
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Delete "${prompt.title}"?`)) {
      dispatch({ type: 'DELETE_PROMPT', payload: { id: prompt.id } });
    }
  }

  function handleOpen() {
    dispatch({ type: 'OPEN_DETAIL', payload: { id: prompt.id } });
  }

  if (viewMode === 'list') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
      >
        {/* Service dot */}
        {service && (
          <span className={cn('h-2 w-2 shrink-0 rounded-full', service.color)} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {prompt.title}
            </span>
            {prompt.isFavorite && (
              <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
            {truncate(prompt.content, 100)}
          </p>
        </div>

        {/* Badges */}
        <div className="hidden items-center gap-1.5 sm:flex">
          {service && (
            <Badge variant="secondary" className={cn('text-[10px]', service.bgLight, service.textColor, 'border-0')}>
              {service.name}
            </Badge>
          )}
          {category && (
            <Badge variant="outline" className="text-[10px]">
              {category.name}
            </Badge>
          )}
        </div>

        {/* Time */}
        <span className="hidden text-xs text-slate-400 sm:block shrink-0">
          {formatDate(prompt.updatedAt)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-7 w-7', prompt.isFavorite ? 'text-amber-400' : '')}
            onClick={handleFavorite}
          >
            <Star className={cn('h-3.5 w-3.5', prompt.isFavorite ? 'fill-amber-400' : '')} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
      className="group relative flex flex-col rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
    >
      {/* Top row: service badge + favorite + menu */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
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
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-6 w-6', prompt.isFavorite ? 'opacity-100 text-amber-400' : '')}
            onClick={handleFavorite}
          >
            <Star className={cn('h-3.5 w-3.5', prompt.isFavorite ? 'fill-amber-400' : '')} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Always-visible favorite star when starred */}
        {prompt.isFavorite && (
          <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400 group-hover:hidden" />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1 text-sm font-semibold leading-tight text-slate-800 dark:text-slate-100">
        {prompt.title}
      </h3>

      {/* Content preview */}
      <p className="flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
        {prompt.content}
      </p>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="text-[10px] text-slate-400">+{prompt.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <span className="text-[10px] text-slate-400">{formatDate(prompt.updatedAt)}</span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {prompt.usageCount > 0 && (
            <span className="text-[10px] text-slate-400">{prompt.usageCount}×</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
