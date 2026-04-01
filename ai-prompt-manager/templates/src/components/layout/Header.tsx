import { ArrowUpDown, LayoutGrid, List, Menu, Moon, Search, Settings, Sun } from 'lucide-react';
import { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { SortBy } from '../../types';

export function Header() {
  const { state, dispatch } = useApp();
  const { ui, settings } = state;
  const [localQuery, setLocalQuery] = useState(ui.searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(value: string) {
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch({ type: 'SET_SEARCH', payload: value });
    }, 200);
  }

  function toggleTheme() {
    const next =
      settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'system' : 'light';
    dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: next } });
  }

  const ThemeIcon =
    settings.theme === 'dark' ? Moon : settings.theme === 'light' ? Sun : Sun;
  const themeLabel =
    settings.theme === 'dark' ? 'Dark' : settings.theme === 'light' ? 'Light' : 'System';

  const sortLabels: Record<SortBy, string> = {
    newest: 'Newest first',
    oldest: 'Oldest first',
    name: 'Name A–Z',
    usage: 'Most used',
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
      {/* Hamburger (mobile) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 lg:hidden"
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        aria-label="Open sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* App title */}
      <span className="hidden text-base font-semibold text-slate-800 dark:text-slate-100 sm:block lg:hidden xl:block">
        Prompt Manager
      </span>

      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={localQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search prompts…"
          className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500"
        />
      </div>

      <div className="flex items-center gap-1">
        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:flex">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="text-xs">{sortLabels[settings.sortBy]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={settings.sortBy}
              onValueChange={(v) =>
                dispatch({ type: 'SET_SORT', payload: v as SortBy })
              }
            >
              {(Object.entries(sortLabels) as [SortBy, string][]).map(([value, label]) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() =>
            dispatch({
              type: 'SET_VIEW_MODE',
              payload: ui.viewMode === 'grid' ? 'list' : 'grid',
            })
          }
          aria-label="Toggle view"
        >
          {ui.viewMode === 'grid' ? (
            <List className="h-4 w-4" />
          ) : (
            <LayoutGrid className="h-4 w-4" />
          )}
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTheme}
          title={`Theme: ${themeLabel}`}
          aria-label="Toggle theme"
        >
          <ThemeIcon className="h-4 w-4" />
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => dispatch({ type: 'OPEN_SETTINGS' })}
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
