export interface PromptVariable {
  name: string;
  defaultValue?: string;
  description?: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  aiServiceId: string;
  categoryId: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  usageCount: number;
  variables: PromptVariable[];
}

export interface Category {
  id: string;
  name: string;
  color: string; // CSS color string
  isDefault?: boolean;
}

export interface AIService {
  id: string;
  name: string;
  color: string; // Tailwind bg class e.g. "bg-indigo-500"
  textColor: string; // Tailwind text class e.g. "text-indigo-700"
  bgLight: string; // Tailwind light bg e.g. "bg-indigo-50"
  isBuiltIn?: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'grid' | 'list';
  sortBy: 'newest' | 'oldest' | 'name' | 'usage';
}

export type SortBy = AppSettings['sortBy'];
export type ViewMode = 'grid' | 'list';

export interface UIState {
  searchQuery: string;
  selectedCategoryId: string | null;
  selectedServiceId: string | null;
  showFavoritesOnly: boolean;
  viewMode: ViewMode;
  activePromptId: string | null;
  editingPromptId: string | null;
  isCreating: boolean;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  isCategoryManagerOpen: boolean;
}

export interface AppState {
  prompts: Prompt[];
  categories: Category[];
  aiServices: AIService[];
  settings: AppSettings;
  ui: UIState;
}

export type AppAction =
  | { type: 'ADD_PROMPT'; payload: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> }
  | { type: 'UPDATE_PROMPT'; payload: Partial<Prompt> & { id: string } }
  | { type: 'DELETE_PROMPT'; payload: { id: string } }
  | { type: 'TOGGLE_FAVORITE'; payload: { id: string } }
  | { type: 'INCREMENT_USAGE'; payload: { id: string } }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY'; payload: Partial<Category> & { id: string } }
  | { type: 'DELETE_CATEGORY'; payload: { id: string } }
  | { type: 'ADD_SERVICE'; payload: Omit<AIService, 'id'> }
  | { type: 'UPDATE_SERVICE'; payload: Partial<AIService> & { id: string } }
  | { type: 'DELETE_SERVICE'; payload: { id: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CATEGORY_FILTER'; payload: string | null }
  | { type: 'SET_SERVICE_FILTER'; payload: string | null }
  | { type: 'TOGGLE_FAVORITES_FILTER' }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SORT'; payload: SortBy }
  | { type: 'OPEN_DETAIL'; payload: { id: string } }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'OPEN_EDIT'; payload: { id: string } }
  | { type: 'CLOSE_EDIT' }
  | { type: 'START_CREATE' }
  | { type: 'CLOSE_CREATE' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'CLOSE_SIDEBAR' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'OPEN_CATEGORY_MANAGER' }
  | { type: 'CLOSE_CATEGORY_MANAGER' }
  | { type: 'IMPORT_DATA'; payload: { prompts: Prompt[]; categories: Category[]; aiServices: AIService[] } };

export interface ExportData {
  version: number;
  exportedAt: number;
  prompts: Prompt[];
  categories: Category[];
  aiServices: AIService[];
}
