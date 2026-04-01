import type { Prompt, SortBy } from '../types';

export function filterPrompts(prompts: Prompt[], query: string): Prompt[] {
  if (!query.trim()) return prompts;
  const q = query.toLowerCase();
  return prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      (p.description?.toLowerCase().includes(q) ?? false) ||
      p.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

export function sortPrompts(prompts: Prompt[], sortBy: SortBy): Prompt[] {
  const copy = [...prompts];
  switch (sortBy) {
    case 'newest':
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case 'oldest':
      return copy.sort((a, b) => a.createdAt - b.createdAt);
    case 'name':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'usage':
      return copy.sort((a, b) => b.usageCount - a.usageCount);
    default:
      return copy;
  }
}

export function applyFilters(
  prompts: Prompt[],
  opts: {
    query: string;
    categoryId: string | null;
    serviceId: string | null;
    favoritesOnly: boolean;
    sortBy: SortBy;
  },
): Prompt[] {
  let result = prompts;

  if (opts.query) result = filterPrompts(result, opts.query);
  if (opts.categoryId) result = result.filter((p) => p.categoryId === opts.categoryId);
  if (opts.serviceId) result = result.filter((p) => p.aiServiceId === opts.serviceId);
  if (opts.favoritesOnly) result = result.filter((p) => p.isFavorite);

  return sortPrompts(result, opts.sortBy);
}
