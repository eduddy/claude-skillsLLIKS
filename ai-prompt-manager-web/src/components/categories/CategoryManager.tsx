'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { Category } from '@/types';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRESET_COLORS = [
  '#64748b', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899',
  '#10b981', '#ef4444', '#f97316', '#06b6d4', '#84cc16',
];

export function CategoryManager() {
  const { state, dispatch } = useApp();
  const { categories, ui, prompts } = state;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  function close() {
    dispatch({ type: 'CLOSE_CATEGORY_MANAGER' });
    setEditingId(null);
    setName('');
    setColor(PRESET_COLORS[0]);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color);
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setColor(PRESET_COLORS[0]);
  }

  function handleSave() {
    if (!name.trim()) return;
    if (editingId) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { id: editingId, name: name.trim(), color } });
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: { name: name.trim(), color } });
    }
    cancelEdit();
  }

  function handleDelete(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (cat?.isDefault) return;
    const count = prompts.filter((p) => p.categoryId === id).length;
    const msg = count > 0
      ? `Delete "${cat?.name}"? ${count} prompt${count !== 1 ? 's' : ''} will be moved to the default category.`
      : `Delete "${cat?.name}"?`;
    if (confirm(msg)) {
      dispatch({ type: 'DELETE_CATEGORY', payload: { id } });
    }
  }

  return (
    <Dialog open={ui.isCategoryManagerOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        {/* Category list */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {categories.map((cat) => {
            const isEditing = editingId === cat.id;
            const count = prompts.filter((p) => p.categoryId === cat.id).length;

            if (isEditing) {
              return (
                <CategoryEditRow
                  key={cat.id}
                  name={name}
                  color={color}
                  onNameChange={setName}
                  onColorChange={setColor}
                  onSave={handleSave}
                  onCancel={cancelEdit}
                />
              );
            }

            return (
              <div
                key={cat.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                  {cat.name}
                </span>
                <span className="text-xs text-slate-400">{count}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => startEdit(cat)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                {!cat.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-400 hover:text-red-600"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add new — only when not editing */}
        {!editingId && (
          <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
            <p className="mb-2 text-xs font-medium text-slate-500">Add category</p>
            <CategoryEditRow
              name={name}
              color={color}
              onNameChange={setName}
              onColorChange={setColor}
              onSave={handleSave}
              onCancel={() => {
                setName('');
                setColor(PRESET_COLORS[0]);
              }}
              isNew
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CategoryEditRow({
  name,
  color,
  onNameChange,
  onColorChange,
  onSave,
  onCancel,
  isNew = false,
}: {
  name: string;
  color: string;
  onNameChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}) {
  return (
    <div className="space-y-2 rounded-md border border-slate-200 p-2 dark:border-slate-700">
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder="Category name"
          className="h-7 text-sm"
          autoFocus
        />
        <Button
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={onSave}
          disabled={!name.trim()}
        >
          {isNew ? <Plus className="h-3.5 w-3.5" /> : 'Save'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
      {/* Color swatches */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            className="h-5 w-5 rounded-full ring-offset-1 transition-transform hover:scale-110 focus:outline-none"
            style={{
              backgroundColor: c,
              boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : undefined,
            }}
            onClick={() => onColorChange(c)}
            aria-label={c}
          />
        ))}
        {/* Custom color picker */}
        <label className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] text-slate-400 hover:bg-slate-50">
          <span>+</span>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute h-0 w-0 opacity-0"
          />
        </label>
      </div>
    </div>
  );
}
