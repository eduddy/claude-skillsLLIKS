---
name: ai-prompt-manager
description: >
  Build and deliver a self-contained AI Prompt Manager web application.
  Use when users want to save, organize, search, categorize, or manage prompts
  for any AI service (Claude, GPT-4, Gemini, Mistral, etc.). Produces a single
  bundle.html artifact with full localStorage persistence — no backend required.
  Trigger phrases include: "prompt manager", "prompt library", "save my prompts",
  "organize AI prompts", "prompt organizer".
license: Apache 2.0
---

# AI Prompt Manager

A fully self-contained web application for saving, organizing, and managing prompts
across multiple AI services. All data is stored locally in the browser via localStorage —
no backend, no account, no data leaves the user's machine.

## Features

- **CRUD prompts** — create, edit, and delete prompts with title, content, description, and tags
- **AI service tagging** — assign prompts to Claude, GPT-4, Gemini, Mistral, or custom services
- **Custom categories** — organize prompts into color-coded categories
- **Full-text search** — search across title, content, description, and tags
- **Filter & sort** — filter by category, service, or favorites; sort by date, name, or usage count
- **Favorites** — star important prompts for quick access
- **Template variables** — `{variable}` syntax with interactive substitution UI before copying
- **One-click copy** — copy prompt to clipboard with usage count tracking
- **Import/Export** — JSON backup and restore
- **Dark/light mode** — theme toggle with persistence
- **Responsive** — works on mobile, tablet, and desktop

## Building the Application

### Step 1: Initialize the React project

From the skill's parent directory (where `artifacts-builder/` lives):

```bash
bash artifacts-builder/scripts/init-artifact.sh prompt-manager
cd prompt-manager
```

### Step 2: Install the source files

Copy all template files from `ai-prompt-manager/templates/src/` into `src/`, replacing
the default Vite boilerplate:

```bash
cp -r ../ai-prompt-manager/templates/src/. src/
```

Then remove the default Vite assets that are no longer needed:

```bash
rm -f src/assets/react.svg public/vite.svg
```

### Step 3: Bundle to a single HTML file

```bash
bash ../artifacts-builder/scripts/bundle-artifact.sh
```

This creates `bundle.html` — a fully self-contained artifact with all JavaScript,
CSS, and dependencies inlined.

### Step 4: Share with the user

Display the contents of `bundle.html` as a Claude artifact so the user can interact
with the application directly in the conversation.

### Step 5: Testing (optional)

Only test if requested or if an issue arises. Use the webapp-testing skill or
Playwright to verify functionality.

## Technical Architecture

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3.4.1 + shadcn/ui components
- **Icons**: lucide-react
- **State**: React Context + useReducer
- **Storage**: localStorage (namespaced keys: `apm_prompts`, `apm_categories`, `apm_services`, `apm_settings`)
- **Bundling**: Parcel → html-inline → single `bundle.html`

## Design Notes

- Layout: sidebar navigation on desktop, collapsible on mobile
- Color scheme: neutral slate base with colored accent badges per service/category
- Typography: system font stack (no external font imports for performance)
- Avoid AI slop: no purple gradients, no excessive rounded corners, no centered hero layouts
