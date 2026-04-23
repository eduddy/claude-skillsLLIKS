'use client';

import { useApp } from '@/context/AppContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { PromptGrid } from '@/components/prompts/PromptGrid';
import { PromptForm } from '@/components/prompts/PromptForm';
import { PromptDetail } from '@/components/prompts/PromptDetail';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { PromptBuilder } from '@/components/builder/PromptBuilder';
import { cn } from '@/lib/utils';

export function AppShell() {
  const { state } = useApp();
  const { ui } = state;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Header />
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            'shrink-0 overflow-y-auto transition-all duration-200',
            'hidden lg:block lg:w-56 xl:w-64',
            ui.isSidebarOpen && 'fixed inset-y-0 left-0 z-30 block w-64 shadow-xl lg:static lg:shadow-none',
          )}
        >
          <Sidebar />
        </aside>

        {/* Overlay for mobile sidebar */}
        {ui.isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => {}}
          />
        )}

        {/* Main content */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <PromptGrid />
        </main>
      </div>

      {/* Modals / panels */}
      {(ui.isCreating || ui.editingPromptId) && <PromptForm />}
      {ui.activePromptId && <PromptDetail />}
      {ui.isCategoryManagerOpen && <CategoryManager />}
      {ui.isSettingsOpen && <SettingsPanel />}
      {ui.isBuilderOpen && <PromptBuilder />}
    </div>
  );
}
