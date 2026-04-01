import type { AIService, AppSettings, Category, ExportData, Prompt } from '../types';

const KEYS = {
  prompts: 'apm_prompts',
  categories: 'apm_categories',
  services: 'apm_services',
  settings: 'apm_settings',
} as const;

const EXPORT_VERSION = 1;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  getPrompts(): Prompt[] {
    return safeParse<Prompt[]>(localStorage.getItem(KEYS.prompts), []);
  },
  savePrompts(prompts: Prompt[]): void {
    localStorage.setItem(KEYS.prompts, JSON.stringify(prompts));
  },

  getCategories(): Category[] {
    return safeParse<Category[]>(localStorage.getItem(KEYS.categories), []);
  },
  saveCategories(categories: Category[]): void {
    localStorage.setItem(KEYS.categories, JSON.stringify(categories));
  },

  getServices(): AIService[] {
    return safeParse<AIService[]>(localStorage.getItem(KEYS.services), []);
  },
  saveServices(services: AIService[]): void {
    localStorage.setItem(KEYS.services, JSON.stringify(services));
  },

  getSettings(): AppSettings | null {
    return safeParse<AppSettings | null>(localStorage.getItem(KEYS.settings), null);
  },
  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  },

  hasData(): boolean {
    return localStorage.getItem(KEYS.prompts) !== null;
  },

  exportAll(prompts: Prompt[], categories: Category[], services: AIService[]): string {
    const data: ExportData = {
      version: EXPORT_VERSION,
      exportedAt: Date.now(),
      prompts,
      categories,
      aiServices: services,
    };
    return JSON.stringify(data, null, 2);
  },

  parseImport(json: string): ExportData | null {
    try {
      const data = JSON.parse(json) as ExportData;
      if (
        typeof data !== 'object' ||
        !Array.isArray(data.prompts) ||
        !Array.isArray(data.categories) ||
        !Array.isArray(data.aiServices)
      ) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  clearAll(): void {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },

  getStorageSize(): { used: number; total: number } {
    let used = 0;
    Object.values(KEYS).forEach((key) => {
      const val = localStorage.getItem(key);
      if (val) used += val.length * 2; // UTF-16 = 2 bytes per char
    });
    // localStorage limit is typically 5–10 MB; we conservatively report 5 MB
    return { used, total: 5 * 1024 * 1024 };
  },
};
