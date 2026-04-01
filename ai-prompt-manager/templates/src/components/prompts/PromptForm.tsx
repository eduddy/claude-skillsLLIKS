import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp, usePrompt } from '../../context/AppContext';
import { extractVariables } from '../../lib/utils';
import type { Prompt, PromptVariable } from '../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

type PromptDraft = Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;

function emptyDraft(defaults: { categoryId: string; aiServiceId: string }): PromptDraft {
  return {
    title: '',
    content: '',
    description: '',
    aiServiceId: defaults.aiServiceId,
    categoryId: defaults.categoryId,
    tags: [],
    isFavorite: false,
    variables: [],
  };
}

export function PromptForm() {
  const { state, dispatch } = useApp();
  const { ui, categories, aiServices } = state;

  const isOpen = ui.isCreating || !!ui.editingPromptId;
  const existingPrompt = usePrompt(ui.editingPromptId);

  const defaultCategoryId = categories.find((c) => c.isDefault)?.id ?? categories[0]?.id ?? '';
  const defaultServiceId = aiServices[0]?.id ?? '';

  const [draft, setDraft] = useState<PromptDraft>(emptyDraft({ categoryId: defaultCategoryId, aiServiceId: defaultServiceId }));
  const [tagInput, setTagInput] = useState('');
  const [detectedVars, setDetectedVars] = useState<string[]>([]);

  // Sync draft when opening edit
  useEffect(() => {
    if (existingPrompt) {
      setDraft({
        title: existingPrompt.title,
        content: existingPrompt.content,
        description: existingPrompt.description ?? '',
        aiServiceId: existingPrompt.aiServiceId,
        categoryId: existingPrompt.categoryId,
        tags: existingPrompt.tags,
        isFavorite: existingPrompt.isFavorite,
        variables: existingPrompt.variables,
      });
    } else if (ui.isCreating) {
      setDraft(emptyDraft({ categoryId: defaultCategoryId, aiServiceId: defaultServiceId }));
      setTagInput('');
    }
  }, [existingPrompt, ui.isCreating, ui.editingPromptId]);

  // Detect {variables} in content
  useEffect(() => {
    const vars = extractVariables(draft.content);
    setDetectedVars(vars);
    // Auto-sync variable list: add new, keep existing with their defaults
    setDraft((prev) => {
      const existing = new Map(prev.variables.map((v) => [v.name, v]));
      const updated: PromptVariable[] = vars.map((name) =>
        existing.get(name) ?? { name, defaultValue: '', description: '' },
      );
      return { ...prev, variables: updated };
    });
  }, [draft.content]);

  function close() {
    if (ui.isCreating) dispatch({ type: 'CLOSE_CREATE' });
    if (ui.editingPromptId) dispatch({ type: 'CLOSE_EDIT' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) return;

    if (ui.editingPromptId) {
      dispatch({ type: 'UPDATE_PROMPT', payload: { id: ui.editingPromptId, ...draft } });
    } else {
      dispatch({ type: 'ADD_PROMPT', payload: draft });
    }
    close();
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !draft.tags.includes(tag)) {
      setDraft((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setDraft((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  function updateVariable(name: string, field: keyof PromptVariable, value: string) {
    setDraft((prev) => ({
      ...prev,
      variables: prev.variables.map((v) =>
        v.name === name ? { ...v, [field]: value } : v,
      ),
    }));
  }

  const isValid = draft.title.trim().length > 0 && draft.content.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{ui.editingPromptId ? 'Edit Prompt' : 'New Prompt'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              placeholder="Descriptive name for this prompt"
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="content">
              Prompt Content *
              <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                Use {'{variable}'} syntax for dynamic parts
              </span>
            </Label>
            <Textarea
              id="content"
              value={draft.content}
              onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
              placeholder="Write your prompt here…"
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          {/* Variables detected */}
          {detectedVars.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
              <p className="mb-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                Detected variables — add descriptions and defaults:
              </p>
              <div className="space-y-2">
                {draft.variables.map((v) => (
                  <div key={v.name} className="flex items-center gap-2">
                    <code className="w-28 shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      {'{' + v.name + '}'}
                    </code>
                    <Input
                      value={v.defaultValue ?? ''}
                      onChange={(e) => updateVariable(v.name, 'defaultValue', e.target.value)}
                      placeholder="Default value"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={v.description ?? ''}
                      onChange={(e) => updateVariable(v.name, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      className="h-7 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={draft.description ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short description (optional)"
            />
          </div>

          {/* Service + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>AI Service</Label>
              <Select
                value={draft.aiServiceId}
                onValueChange={(v) => setDraft((p) => ({ ...p, aiServiceId: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiServices.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={draft.categoryId}
                onValueChange={(v) => setDraft((p) => ({ ...p, categoryId: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag…"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {draft.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {draft.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              {ui.editingPromptId ? 'Save Changes' : 'Create Prompt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
