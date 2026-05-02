'use client';

import { createContext, useContext, useReducer, useCallback, useMemo, type ReactNode } from 'react';
import useSWR from 'swr';
import type { Prompt, Category, AIService, AppSettings, UIState, AppState, AppAction, SortBy, ViewMode } from '@/types';

// ─── SWR fetcher ──────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── UI state reducer ─────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = { theme: 'system', defaultView: 'grid', sortBy: 'newest' };

const INITIAL_UI: UIState = {
  searchQuery: '',
  selectedCategoryId: null,
  selectedServiceId: null,
  showFavoritesOnly: false,
  viewMode: 'grid',
  activePromptId: null,
  editingPromptId: null,
  isCreating: false,
  isSidebarOpen: false,
  isSettingsOpen: false,
  isCategoryManagerOpen: false,
  isBuilderOpen: false,
};

function uiReducer(state: UIState, action: AppAction): UIState {
  switch (action.type) {
    case 'SET_SEARCH':            return { ...state, searchQuery: action.payload };
    case 'SET_CATEGORY_FILTER':   return { ...state, selectedCategoryId: action.payload };
    case 'SET_SERVICE_FILTER':    return { ...state, selectedServiceId: action.payload };
    case 'TOGGLE_FAVORITES_FILTER': return { ...state, showFavoritesOnly: !state.showFavoritesOnly };
    case 'SET_VIEW_MODE':         return { ...state, viewMode: action.payload };
    case 'SET_SORT':              return { ...state /* sort handled in settings */ };
    case 'OPEN_DETAIL':           return { ...state, activePromptId: action.payload.id };
    case 'CLOSE_DETAIL':          return { ...state, activePromptId: null };
    case 'OPEN_EDIT':             return { ...state, editingPromptId: action.payload.id, isCreating: false };
    case 'CLOSE_EDIT':            return { ...state, editingPromptId: null };
    case 'START_CREATE':          return { ...state, isCreating: true, editingPromptId: null };
    case 'CLOSE_CREATE':          return { ...state, isCreating: false };
    case 'TOGGLE_SIDEBAR':        return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'CLOSE_SIDEBAR':         return { ...state, isSidebarOpen: false };
    case 'OPEN_SETTINGS':         return { ...state, isSettingsOpen: true };
    case 'CLOSE_SETTINGS':        return { ...state, isSettingsOpen: false };
    case 'OPEN_CATEGORY_MANAGER': return { ...state, isCategoryManagerOpen: true };
    case 'CLOSE_CATEGORY_MANAGER':return { ...state, isCategoryManagerOpen: false };
    case 'OPEN_BUILDER':          return { ...state, isBuilderOpen: true };
    case 'CLOSE_BUILDER':         return { ...state, isBuilderOpen: false };
    default:                      return state;
  }
}

function settingsReducer(state: AppSettings, action: AppAction): AppSettings {
  if (action.type === 'UPDATE_SETTINGS') return { ...state, ...action.payload };
  if (action.type === 'SET_SORT') return { ...state, sortBy: action.payload as SortBy };
  if (action.type === 'SET_VIEW_MODE') return { ...state, defaultView: action.payload as ViewMode };
  return state;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => void;
  useCategory: (id: string | null | undefined) => Category | undefined;
  useService:  (id: string | null | undefined) => AIService | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: prompts = [],    mutate: mutatePrompts }    = useSWR<Prompt[]>   ('/api/prompts',    fetcher);
  const { data: categories = [], mutate: mutateCategories } = useSWR<Category[]> ('/api/categories', fetcher);
  const { data: aiServices = [],  mutate: mutateServices }  = useSWR<AIService[]>('/api/services',   fetcher);

  const [ui, uiDispatch]           = useReducer(uiReducer, INITIAL_UI);
  const [settings, settingsDispatch] = useReducer(settingsReducer, DEFAULT_SETTINGS);

  const dispatch = useCallback(async (action: AppAction) => {
    switch (action.type) {
      // ── Prompts ──────────────────────────────────────────────────────────────
      case 'ADD_PROMPT': {
        await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload),
        });
        await mutatePrompts();
        break;
      }
      case 'UPDATE_PROMPT': {
        const { id, ...data } = action.payload;
        await fetch(`/api/prompts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        await mutatePrompts();
        break;
      }
      case 'DELETE_PROMPT': {
        await fetch(`/api/prompts/${action.payload.id}`, { method: 'DELETE' });
        await mutatePrompts();
        uiDispatch({ type: 'CLOSE_DETAIL' });
        uiDispatch({ type: 'CLOSE_EDIT' });
        break;
      }
      case 'TOGGLE_FAVORITE': {
        // Optimistic update
        mutatePrompts(
          prompts.map((p) => p.id === action.payload.id ? { ...p, isFavorite: !p.isFavorite } : p),
          false,
        );
        await fetch(`/api/prompts/${action.payload.id}/favorite`, { method: 'POST' });
        await mutatePrompts();
        break;
      }
      case 'INCREMENT_USAGE': {
        mutatePrompts(
          prompts.map((p) => p.id === action.payload.id ? { ...p, usageCount: p.usageCount + 1 } : p),
          false,
        );
        await fetch(`/api/prompts/${action.payload.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usageCount: (prompts.find((p) => p.id === action.payload.id)?.usageCount ?? 0) + 1 }),
        });
        break;
      }

      // ── Categories ───────────────────────────────────────────────────────────
      case 'ADD_CATEGORY': {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload),
        });
        await mutateCategories();
        break;
      }
      case 'UPDATE_CATEGORY': {
        const { id, ...data } = action.payload;
        await fetch(`/api/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        await mutateCategories();
        break;
      }
      case 'DELETE_CATEGORY': {
        await fetch(`/api/categories/${action.payload.id}`, { method: 'DELETE' });
        await mutateCategories();
        await mutatePrompts();
        break;
      }

      // ── Services ─────────────────────────────────────────────────────────────
      case 'ADD_SERVICE': {
        await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.payload),
        });
        await mutateServices();
        break;
      }
      case 'UPDATE_SERVICE': {
        const { id, ...data } = action.payload;
        await fetch(`/api/services/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        await mutateServices();
        break;
      }
      case 'DELETE_SERVICE': {
        await fetch(`/api/services/${action.payload.id}`, { method: 'DELETE' });
        await mutateServices();
        break;
      }

      // ── Settings + UI (local only) ────────────────────────────────────────────
      default:
        settingsDispatch(action);
        uiDispatch(action);
    }
  }, [prompts, mutatePrompts, mutateCategories, mutateServices]);

  const state: AppState = { prompts, categories, aiServices, settings, ui };

  const useCategory = useCallback(
    (id: string | null | undefined) => categories.find((c) => c.id === id),
    [categories],
  );
  const useService = useCallback(
    (id: string | null | undefined) => aiServices.find((s) => s.id === id),
    [aiServices],
  );

  return (
    <AppContext.Provider value={{ state, dispatch, useCategory, useService }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function usePrompt(id: string | null | undefined): import('@/types').Prompt | undefined {
  const { state } = useApp();
  return useMemo(() => (id ? state.prompts.find((p) => p.id === id) : undefined), [state.prompts, id]);
}

export function useCategory(id: string | null | undefined) {
  const { useCategory: fn } = useApp();
  return fn(id);
}

export function useService(id: string | null | undefined) {
  const { useService: fn } = useApp();
  return fn(id);
}

export function useFilteredPrompts(): import('@/types').Prompt[] {
  const { state } = useApp();
  const { prompts, settings, ui } = state;
  return useMemo(() => {
    let result = prompts;
    if (ui.searchQuery) {
      const q = ui.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (ui.selectedCategoryId) result = result.filter((p) => p.categoryId === ui.selectedCategoryId);
    if (ui.selectedServiceId)  result = result.filter((p) => p.aiServiceId === ui.selectedServiceId);
    if (ui.showFavoritesOnly)  result = result.filter((p) => p.isFavorite);
    const copy = [...result];
    switch (settings.sortBy) {
      case 'newest': return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest': return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'name':   return copy.sort((a, b) => a.title.localeCompare(b.title));
      case 'usage':  return copy.sort((a, b) => b.usageCount - a.usageCount);
      default:       return copy;
    }
  }, [prompts, settings.sortBy, ui]);
}
