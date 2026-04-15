import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type {
  AIService,
  AppAction,
  AppSettings,
  AppState,
  Category,
  Prompt,
  UIState,
} from '../types';
import { storage } from '../lib/storage';
import { generateId } from '../lib/utils';

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SERVICES: AIService[] = [
  { id: 'claude', name: 'Claude', color: 'bg-indigo-500', textColor: 'text-indigo-700', bgLight: 'bg-indigo-50', isBuiltIn: true },
  { id: 'gpt4', name: 'GPT-4', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50', isBuiltIn: true },
  { id: 'gemini', name: 'Gemini', color: 'bg-sky-500', textColor: 'text-sky-700', bgLight: 'bg-sky-50', isBuiltIn: true },
  { id: 'mistral', name: 'Mistral', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50', isBuiltIn: true },
  { id: 'custom', name: 'Custom', color: 'bg-slate-500', textColor: 'text-slate-700', bgLight: 'bg-slate-50', isBuiltIn: true },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'general', name: 'General', color: '#64748b', isDefault: true },
  { id: 'coding', name: 'Coding', color: '#3b82f6' },
  { id: 'writing', name: 'Writing', color: '#8b5cf6' },
  { id: 'analysis', name: 'Analysis', color: '#f59e0b' },
  { id: 'creative', name: 'Creative', color: '#ec4899' },
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  defaultView: 'grid',
  sortBy: 'newest',
};

const SAMPLE_PROMPTS: Prompt[] = [
  {
    id: 'sample-1',
    title: 'Code Review Assistant',
    content: 'Please review the following {language} code for bugs, performance issues, and best practices. Provide specific suggestions for improvement:\n\n```{language}\n{code}\n```',
    description: 'A comprehensive code review prompt with language and code variables',
    aiServiceId: 'claude',
    categoryId: 'coding',
    tags: ['code', 'review', 'debugging'],
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    usageCount: 12,
    variables: [
      { name: 'language', defaultValue: 'TypeScript', description: 'Programming language' },
      { name: 'code', defaultValue: '', description: 'Paste your code here' },
    ],
  },
  {
    id: 'sample-2',
    title: 'Blog Post Outline',
    content: 'Create a detailed outline for a blog post about {topic}. The target audience is {audience} and the tone should be {tone}. Include:\n- A compelling headline\n- 5-7 main sections with subpoints\n- Key takeaways\n- A call to action',
    description: 'Generate structured blog post outlines for any topic',
    aiServiceId: 'gpt4',
    categoryId: 'writing',
    tags: ['blog', 'content', 'outline'],
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 7,
    usageCount: 5,
    variables: [
      { name: 'topic', defaultValue: 'AI productivity tools', description: 'Blog topic' },
      { name: 'audience', defaultValue: 'professionals', description: 'Target audience' },
      { name: 'tone', defaultValue: 'informative', description: 'Writing tone' },
    ],
  },
  {
    id: 'sample-3',
    title: 'Data Analysis Summary',
    content: 'Analyze the following dataset and provide:\n1. Key trends and patterns\n2. Statistical insights\n3. Anomalies or outliers\n4. Actionable recommendations\n\nDataset context: {context}\n\nData:\n{data}',
    description: 'Extract insights from data with context-aware analysis',
    aiServiceId: 'gemini',
    categoryId: 'analysis',
    tags: ['data', 'analysis', 'insights'],
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 14,
    usageCount: 3,
    variables: [
      { name: 'context', defaultValue: 'Monthly sales data', description: 'What the data represents' },
      { name: 'data', defaultValue: '', description: 'Paste your data here' },
    ],
  },
];

// ─── Initial State ────────────────────────────────────────────────────────────

function buildInitialState(): AppState {
  const hasExisting = storage.hasData();

  const prompts = hasExisting ? storage.getPrompts() : SAMPLE_PROMPTS;
  const categories = hasExisting ? storage.getCategories() : DEFAULT_CATEGORIES;
  const aiServices = hasExisting ? storage.getServices() : DEFAULT_SERVICES;
  const savedSettings = storage.getSettings();
  const settings: AppSettings = savedSettings ?? DEFAULT_SETTINGS;

  const ui: UIState = {
    searchQuery: '',
    selectedCategoryId: null,
    selectedServiceId: null,
    showFavoritesOnly: false,
    viewMode: settings.defaultView,
    activePromptId: null,
    editingPromptId: null,
    isCreating: false,
    isSidebarOpen: false,
    isSettingsOpen: false,
    isCategoryManagerOpen: false,
    isBuilderOpen: false,
  };

  return { prompts, categories, aiServices, settings, ui };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PROMPT': {
      const now = Date.now();
      const prompt: Prompt = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
      };
      return { ...state, prompts: [prompt, ...state.prompts] };
    }

    case 'UPDATE_PROMPT': {
      return {
        ...state,
        prompts: state.prompts.map((p) =>
          p.id === action.payload.id
            ? { ...p, ...action.payload, updatedAt: Date.now() }
            : p,
        ),
      };
    }

    case 'DELETE_PROMPT': {
      return {
        ...state,
        prompts: state.prompts.filter((p) => p.id !== action.payload.id),
        ui: {
          ...state.ui,
          activePromptId:
            state.ui.activePromptId === action.payload.id ? null : state.ui.activePromptId,
          editingPromptId:
            state.ui.editingPromptId === action.payload.id ? null : state.ui.editingPromptId,
        },
      };
    }

    case 'TOGGLE_FAVORITE': {
      return {
        ...state,
        prompts: state.prompts.map((p) =>
          p.id === action.payload.id ? { ...p, isFavorite: !p.isFavorite } : p,
        ),
      };
    }

    case 'INCREMENT_USAGE': {
      return {
        ...state,
        prompts: state.prompts.map((p) =>
          p.id === action.payload.id ? { ...p, usageCount: p.usageCount + 1 } : p,
        ),
      };
    }

    case 'ADD_CATEGORY': {
      const category: Category = { ...action.payload, id: generateId() };
      return { ...state, categories: [...state.categories, category] };
    }

    case 'UPDATE_CATEGORY': {
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c,
        ),
      };
    }

    case 'DELETE_CATEGORY': {
      const fallbackId = state.categories.find((c) => c.isDefault)?.id ?? 'general';
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload.id),
        prompts: state.prompts.map((p) =>
          p.categoryId === action.payload.id ? { ...p, categoryId: fallbackId } : p,
        ),
      };
    }

    case 'ADD_SERVICE': {
      const service: AIService = { ...action.payload, id: generateId() };
      return { ...state, aiServices: [...state.aiServices, service] };
    }

    case 'UPDATE_SERVICE': {
      return {
        ...state,
        aiServices: state.aiServices.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s,
        ),
      };
    }

    case 'DELETE_SERVICE': {
      return {
        ...state,
        aiServices: state.aiServices.filter((s) => s.id !== action.payload.id),
        prompts: state.prompts.map((p) =>
          p.aiServiceId === action.payload.id ? { ...p, aiServiceId: 'custom' } : p,
        ),
      };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'SET_SEARCH':
      return { ...state, ui: { ...state.ui, searchQuery: action.payload } };

    case 'SET_CATEGORY_FILTER':
      return { ...state, ui: { ...state.ui, selectedCategoryId: action.payload } };

    case 'SET_SERVICE_FILTER':
      return { ...state, ui: { ...state.ui, selectedServiceId: action.payload } };

    case 'TOGGLE_FAVORITES_FILTER':
      return {
        ...state,
        ui: { ...state.ui, showFavoritesOnly: !state.ui.showFavoritesOnly },
      };

    case 'SET_VIEW_MODE':
      return { ...state, ui: { ...state.ui, viewMode: action.payload } };

    case 'SET_SORT':
      return { ...state, settings: { ...state.settings, sortBy: action.payload } };

    case 'OPEN_DETAIL':
      return { ...state, ui: { ...state.ui, activePromptId: action.payload.id } };

    case 'CLOSE_DETAIL':
      return { ...state, ui: { ...state.ui, activePromptId: null } };

    case 'OPEN_EDIT':
      return {
        ...state,
        ui: { ...state.ui, editingPromptId: action.payload.id, isCreating: false },
      };

    case 'CLOSE_EDIT':
      return { ...state, ui: { ...state.ui, editingPromptId: null } };

    case 'START_CREATE':
      return {
        ...state,
        ui: { ...state.ui, isCreating: true, editingPromptId: null },
      };

    case 'CLOSE_CREATE':
      return { ...state, ui: { ...state.ui, isCreating: false } };

    case 'TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, isSidebarOpen: !state.ui.isSidebarOpen } };

    case 'CLOSE_SIDEBAR':
      return { ...state, ui: { ...state.ui, isSidebarOpen: false } };

    case 'OPEN_SETTINGS':
      return { ...state, ui: { ...state.ui, isSettingsOpen: true } };

    case 'CLOSE_SETTINGS':
      return { ...state, ui: { ...state.ui, isSettingsOpen: false } };

    case 'OPEN_CATEGORY_MANAGER':
      return { ...state, ui: { ...state.ui, isCategoryManagerOpen: true } };

    case 'CLOSE_CATEGORY_MANAGER':
      return { ...state, ui: { ...state.ui, isCategoryManagerOpen: false } };

    case 'OPEN_BUILDER':
      return { ...state, ui: { ...state.ui, isBuilderOpen: true } };

    case 'CLOSE_BUILDER':
      return { ...state, ui: { ...state.ui, isBuilderOpen: false } };

    case 'IMPORT_DATA': {
      const { prompts, categories, aiServices } = action.payload;
      // Merge: keep built-in services, add imported custom ones
      const builtIn = state.aiServices.filter((s) => s.isBuiltIn);
      const importedCustom = aiServices.filter((s) => !s.isBuiltIn);
      const mergedServices = [
        ...builtIn,
        ...importedCustom.filter((s) => !builtIn.find((b) => b.id === s.id)),
      ];
      // Merge categories: keep existing, add new imported ones
      const mergedCategories = [
        ...state.categories,
        ...categories.filter((ic) => !state.categories.find((ec) => ec.id === ic.id)),
      ];
      return {
        ...state,
        prompts,
        categories: mergedCategories,
        aiServices: mergedServices,
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  // Persist data to localStorage whenever relevant state changes
  useEffect(() => {
    storage.savePrompts(state.prompts);
  }, [state.prompts]);

  useEffect(() => {
    storage.saveCategories(state.categories);
  }, [state.categories]);

  useEffect(() => {
    storage.saveServices(state.aiServices);
  }, [state.aiServices]);

  useEffect(() => {
    storage.saveSettings(state.settings);
  }, [state.settings]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const { theme } = state.settings;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', isDark);
  }, [state.settings.theme]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useAppDispatch() {
  return useApp().dispatch;
}

export function useAppState() {
  return useApp().state;
}

export function usePrompt(id: string | null): Prompt | undefined {
  const { state } = useApp();
  return useMemo(
    () => (id ? state.prompts.find((p) => p.id === id) : undefined),
    [state.prompts, id],
  );
}

export function useCategory(id: string | null): Category | undefined {
  const { state } = useApp();
  return useMemo(
    () => (id ? state.categories.find((c) => c.id === id) : undefined),
    [state.categories, id],
  );
}

export function useService(id: string | null): AIService | undefined {
  const { state } = useApp();
  return useMemo(
    () => (id ? state.aiServices.find((s) => s.id === id) : undefined),
    [state.aiServices, id],
  );
}

export function useFilteredPrompts(): Prompt[] {
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
    if (ui.selectedServiceId) result = result.filter((p) => p.aiServiceId === ui.selectedServiceId);
    if (ui.showFavoritesOnly) result = result.filter((p) => p.isFavorite);

    const copy = [...result];
    switch (settings.sortBy) {
      case 'newest': return copy.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest': return copy.sort((a, b) => a.createdAt - b.createdAt);
      case 'name': return copy.sort((a, b) => a.title.localeCompare(b.title));
      case 'usage': return copy.sort((a, b) => b.usageCount - a.usageCount);
      default: return copy;
    }
  }, [prompts, settings.sortBy, ui]);
}

export { DEFAULT_SERVICES, DEFAULT_CATEGORIES };

// Re-export for convenience
export type { AppContextValue };
export const useStableDispatch = () => {
  const { dispatch } = useApp();
  return useCallback(dispatch, [dispatch]);
};
