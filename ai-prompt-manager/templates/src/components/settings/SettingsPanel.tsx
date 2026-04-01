import { AlertTriangle, Download, HardDrive, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../lib/storage';
import { downloadFile, formatBytes } from '../../lib/utils';
import type { AppSettings } from '../../types';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Separator } from '../ui/separator';

export function SettingsPanel() {
  const { state, dispatch } = useApp();
  const { settings, ui, prompts, categories, aiServices } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  function close() {
    dispatch({ type: 'CLOSE_SETTINGS' });
  }

  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  }

  function handleExport() {
    const json = storage.exportAll(prompts, categories, aiServices);
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(json, `prompt-manager-backup-${date}.json`);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      const data = storage.parseImport(json);
      if (!data) {
        alert('Invalid backup file. Please select a valid Prompt Manager export.');
        return;
      }
      const msg = `Import ${data.prompts.length} prompt(s) from ${new Date(data.exportedAt).toLocaleDateString()}?\n\nExisting prompts will be replaced.`;
      if (confirm(msg)) {
        dispatch({
          type: 'IMPORT_DATA',
          payload: {
            prompts: data.prompts,
            categories: data.categories,
            aiServices: data.aiServices,
          },
        });
        alert('Import successful!');
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  }

  function handleClearData() {
    if (
      confirm(
        'This will permanently delete ALL prompts, categories, and custom services. This cannot be undone.\n\nAre you sure?',
      )
    ) {
      storage.clearAll();
      window.location.reload();
    }
  }

  const { used, total } = storage.getStorageSize();
  const usedPct = Math.round((used / total) * 100);

  return (
    <Sheet open={ui.isSettingsOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Appearance */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Appearance
            </h3>

            <div className="space-y-1.5">
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(v) => updateSetting('theme', v as AppSettings['theme'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Default View</Label>
              <Select
                value={settings.defaultView}
                onValueChange={(v) => updateSetting('defaultView', v as AppSettings['defaultView'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Default Sort</Label>
              <Select
                value={settings.sortBy}
                onValueChange={(v) => updateSetting('sortBy', v as AppSettings['sortBy'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                  <SelectItem value="usage">Most used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator />

          {/* Data & Backup */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Data & Backup
            </h3>

            {/* Stats */}
            <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{prompts.length} prompt{prompts.length !== 1 ? 's' : ''}</span>
                <span>{categories.length} categories</span>
                <span>{aiServices.length} services</span>
              </div>
              {/* Storage bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    Local storage
                  </span>
                  <span>{formatBytes(used)} / {formatBytes(total)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-1.5 rounded-full bg-indigo-400 transition-all"
                    style={{ width: `${Math.min(usedPct, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export backup (JSON)
            </Button>

            <Button variant="outline" className="w-full gap-2" onClick={handleImportClick}>
              <Upload className="h-4 w-4" />
              Import from backup
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </section>

          <Separator />

          {/* Danger zone */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400">
              Danger Zone
            </h3>
            <Button
              variant="outline"
              className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              onClick={handleClearData}
            >
              <AlertTriangle className="h-4 w-4" />
              Clear all data
            </Button>
            <p className="text-[11px] text-slate-400">
              This permanently deletes all prompts, categories, and custom services from your browser.
              Export a backup first.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
