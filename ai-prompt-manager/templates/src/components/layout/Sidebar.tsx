import { FolderOpen, Layers, Star, Tag, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export function Sidebar() {
  const { state, dispatch } = useApp();
  const { categories, aiServices, ui, prompts } = state;

  const totalCount = prompts.length;
  const favoriteCount = prompts.filter((p) => p.isFavorite).length;

  function setCategory(id: string | null) {
    dispatch({ type: 'SET_CATEGORY_FILTER', payload: id });
    dispatch({ type: 'CLOSE_SIDEBAR' });
  }

  function setService(id: string | null) {
    dispatch({ type: 'SET_SERVICE_FILTER', payload: id });
    dispatch({ type: 'CLOSE_SIDEBAR' });
  }

  function toggleFavorites() {
    dispatch({ type: 'TOGGLE_FAVORITES_FILTER' });
    dispatch({ type: 'CLOSE_SIDEBAR' });
  }

  function countByCategory(id: string) {
    return prompts.filter((p) => p.categoryId === id).length;
  }

  function countByService(id: string) {
    return prompts.filter((p) => p.aiServiceId === id).length;
  }

  return (
    <aside className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
      {/* Mobile close button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 lg:hidden">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Browse</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {/* New Prompt */}
        <Button
          className="mb-4 w-full"
          onClick={() => {
            dispatch({ type: 'START_CREATE' });
            dispatch({ type: 'CLOSE_SIDEBAR' });
          }}
        >
          + New Prompt
        </Button>

        {/* All prompts */}
        <SidebarItem
          icon={<Layers className="h-4 w-4" />}
          label="All Prompts"
          count={totalCount}
          active={!ui.selectedCategoryId && !ui.selectedServiceId && !ui.showFavoritesOnly}
          onClick={() => {
            dispatch({ type: 'SET_CATEGORY_FILTER', payload: null });
            dispatch({ type: 'SET_SERVICE_FILTER', payload: null });
            if (ui.showFavoritesOnly) dispatch({ type: 'TOGGLE_FAVORITES_FILTER' });
            dispatch({ type: 'CLOSE_SIDEBAR' });
          }}
        />

        {/* Favorites */}
        <SidebarItem
          icon={<Star className="h-4 w-4" />}
          label="Favorites"
          count={favoriteCount}
          active={ui.showFavoritesOnly}
          onClick={toggleFavorites}
          className="mb-4"
        />

        {/* AI Services */}
        <SectionHeader icon={<Layers className="h-3.5 w-3.5" />} label="AI Services" />
        <div className="mb-4 space-y-0.5">
          {aiServices.map((service) => (
            <SidebarItem
              key={service.id}
              icon={
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full flex-shrink-0',
                    service.color,
                  )}
                />
              }
              label={service.name}
              count={countByService(service.id)}
              active={ui.selectedServiceId === service.id}
              onClick={() =>
                setService(ui.selectedServiceId === service.id ? null : service.id)
              }
            />
          ))}
        </div>

        {/* Categories */}
        <SectionHeader icon={<FolderOpen className="h-3.5 w-3.5" />} label="Categories" />
        <div className="mb-2 space-y-0.5">
          {categories.map((cat) => (
            <SidebarItem
              key={cat.id}
              icon={
                <span
                  className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
              }
              label={cat.name}
              count={countByCategory(cat.id)}
              active={ui.selectedCategoryId === cat.id}
              onClick={() =>
                setCategory(ui.selectedCategoryId === cat.id ? null : cat.id)
              }
            />
          ))}
        </div>

        {/* Manage categories */}
        <button
          className="mt-1 flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          onClick={() => dispatch({ type: 'OPEN_CATEGORY_MANAGER' })}
        >
          <Tag className="h-3 w-3" />
          Manage categories
        </button>
      </ScrollArea>
    </aside>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mb-1 flex items-center gap-1.5 px-2 py-1">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  count,
  active,
  onClick,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
        active
          ? 'bg-slate-100 text-slate-900 font-medium dark:bg-slate-700 dark:text-white'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        className,
      )}
    >
      {icon}
      <span className="flex-1 truncate text-left">{label}</span>
      <span className="text-xs text-slate-400 dark:text-slate-500">{count}</span>
    </button>
  );
}
