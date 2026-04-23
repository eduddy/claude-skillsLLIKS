'use client';

import { PlusCircle } from 'lucide-react';
import { useApp, useFilteredPrompts } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { PromptCard } from './PromptCard';

export function PromptGrid() {
  const { state, dispatch } = useApp();
  const { ui } = state;
  const filtered = useFilteredPrompts();

  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
          <PlusCircle className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {ui.searchQuery || ui.selectedCategoryId || ui.selectedServiceId || ui.showFavoritesOnly
              ? 'No prompts match your filters'
              : 'No prompts yet'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {ui.searchQuery || ui.selectedCategoryId || ui.selectedServiceId || ui.showFavoritesOnly
              ? 'Try adjusting your search or filters'
              : 'Create your first prompt to get started'}
          </p>
        </div>
        {!ui.searchQuery && !ui.selectedCategoryId && !ui.selectedServiceId && !ui.showFavoritesOnly && (
          <Button size="sm" onClick={() => dispatch({ type: 'START_CREATE' })}>
            + New Prompt
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6">
      {/* Result count */}
      <p className="mb-4 text-xs text-slate-400">
        {filtered.length} prompt{filtered.length !== 1 ? 's' : ''}
        {ui.searchQuery && <> for "<strong>{ui.searchQuery}</strong>"</>}
      </p>

      {ui.viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
}
