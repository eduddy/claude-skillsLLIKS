'use client';

import { AlertTriangle, Download, Upload, Database } from 'lucide-react';
import { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { downloadFile } from '@/lib/utils';
import type { AppSettings, ExportData } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export function SettingsPanel() {
  const { state, dispatch } = useApp();
  const { settings, ui, prompts, categories, aiServices } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  function close() { dispatch({ type: 'CLOSE_SETTINGS' }); }

  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  }

  function handleExport() {
    const exportData: ExportData = {
      version: 2,
      exportedAt: Date.now(),
      prompts,
      categories: categories.filter((c) => !c.isDefault),
      aiServices: aiServices.filter((s) => !s.isBuiltIn),
    };
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(JSON.stringify(exportData, null, 2), `prompt-vault-backup-${date}.json`);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const text = await file.text();
    let data: ExportData;
    try {
      data = JSON.parse(text);
      if (!Array.isArray(data.prompts)) throw new Error('Invalid format');
    } catch {
      alert('Invalid backup file.');
      return;
    }

    const msg = `Import ${data.prompts.length} prompt(s) from ${new Date(data.exportedAt).toLocaleDateString()}? They will be added to your existing library.`;
    if (!confirm(msg)) return;

    setImporting(true);
    try {
      // Get current default category id to use as fallback
      const defaultCat = categories.find((c) => c.isDefault);

      // Import prompts sequentially (avoids rate-limiting on large sets)
      for (const p of data.prompts) {
        const { id: _id, createdAt: _ca, updatedAt: _ua, usageCount: _uc, ...payload } = p as any;
        await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            categoryId: payload.categoryId ?? defaultCat?.id ?? categories[0]?.id,
            aiServiceId: payload.aiServiceId ?? 'svc_claude',
          }),
        });
      }
      // Re-fetch data
      dispatch({ type: 'CLOSE_SETTINGS' });
      window.location.reload();
    } catch {
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  }

  async function handleClearData() {
    if (!confirm('This will permanently delete ALL your prompts. Categories and services are kept.\n\nAre you sure?')) return;
    setClearing(true);
    try {
      await Promise.all(prompts.map((p) => fetch(`/api/prompts/${p.id}`, { method: 'DELETE' })));
      window.location.reload();
    } catch {
      alert('Could not delete all prompts. Please try again.');
    } finally {
      setClearing(false);
    }
  }

  const customServices = aiServices.filter((s) => !s.isBuiltIn);

  return (
    <Sheet open={ui.isSettingsOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Appearance */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Appearance</h3>
            <div className="space-y-1.5">
              <Label>Theme</Label>
              <Select value={settings.theme} onValueChange={(v) => updateSetting('theme', v as AppSettings['theme'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Default View</Label>
              <Select value={settings.defaultView} onValueChange={(v) => updateSetting('defaultView', v as AppSettings['defaultView'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Default Sort</Label>
              <Select value={settings.sortBy} onValueChange={(v) => updateSetting('sortBy', v as AppSettings['sortBy'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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

          {/* Library stats */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Library</h3>
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Stored in Postgres</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Prompts',    value: prompts.length },
                  { label: 'Categories', value: categories.length },
                  { label: 'Services',   value: customServices.length + ' custom' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded bg-white px-2 py-1.5 dark:bg-slate-900">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{value}</p>
                    <p className="text-[10px] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Separator />

          {/* Backup */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Backup & Import</h3>
            <Button variant="outline" className="w-full gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export backup (JSON)
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()} disabled={importing}>
              <Upload className="h-4 w-4" />
              {importing ? 'Importing…' : 'Import from backup'}
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
            <p className="text-[11px] text-slate-400">
              Imported prompts are added to your library — existing prompts are not overwritten.
            </p>
          </section>

          <Separator />

          {/* Danger zone */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400">Danger Zone</h3>
            <Button
              variant="outline"
              className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              onClick={handleClearData}
              disabled={clearing}
            >
              <AlertTriangle className="h-4 w-4" />
              {clearing ? 'Deleting…' : 'Delete all prompts'}
            </Button>
            <p className="text-[11px] text-slate-400">
              Permanently deletes all your prompts from the database. Categories and services are kept. Export a backup first.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
