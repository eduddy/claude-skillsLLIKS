import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { PromptGrid } from './components/prompts/PromptGrid';
import { PromptForm } from './components/prompts/PromptForm';
import { PromptDetail } from './components/prompts/PromptDetail';
import { CategoryManager } from './components/categories/CategoryManager';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { MobileSidebarOverlay } from './components/layout/MobileSidebarOverlay';
import { PromptBuilder } from './components/builder/PromptBuilder';

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

function AppShell() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar — always visible */}
        <div className="hidden w-56 shrink-0 lg:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar — slide-over */}
        <MobileSidebarOverlay />

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <PromptGrid />
        </main>
      </div>

      {/* Dialogs & Sheets — rendered outside layout flow */}
      <PromptForm />
      <PromptDetail />
      <CategoryManager />
      <SettingsPanel />
      <PromptBuilder />
    </div>
  );
}
