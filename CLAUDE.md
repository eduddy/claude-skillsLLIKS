# CLAUDE.md — AI Assistant Guide for claude-skillsLLIKS

This file documents the repository structure, conventions, and development workflows for AI assistants working in this codebase.

## Repository Purpose

This is Anthropic's official open-source reference repository for **Claude Agent Skills** — modular packages that extend Claude's capabilities with specialized knowledge, workflows, and tool integrations. It serves as:

- An educational resource and pattern library for skill developers
- A plugin marketplace for distribution via Claude Code and claude.ai
- Reference implementations for complex document processing and creative workflows

> Skills in this repo are demonstration examples. While some ship pre-included with Claude, implementations may differ. Always test thoroughly before production use.

---

## Repository Structure

```
claude-skillsLLIKS/
├── CLAUDE.md                      # This file
├── README.md                      # Public-facing overview
├── agent_skills_spec.md           # Formal skill format specification (v1.0)
├── THIRD_PARTY_NOTICES.md         # Third-party licensing attributions
├── .gitignore                     # Minimal (.DS_Store only)
│
├── .claude-plugin/
│   └── marketplace.json           # Plugin marketplace registration
│
├── document-skills/               # Proprietary (source-available) - pre-bundled with Claude
│   ├── docx/                      # Word document creation/editing/analysis
│   ├── pdf/                       # PDF manipulation (merge, split, extract, forms)
│   ├── pptx/                      # PowerPoint creation and editing
│   └── xlsx/                      # Excel spreadsheet handling and formula recalculation
│
└── [example skills]/              # Apache 2.0 licensed — reference/adapt freely
    ├── algorithmic-art/           # Generative art with p5.js
    ├── artifacts-builder/         # React + Tailwind + shadcn/ui HTML artifacts
    ├── brand-guidelines/          # Anthropic branding resources
    ├── canvas-design/             # Visual art/design creation
    ├── internal-comms/            # Enterprise communication templates
    ├── mcp-builder/               # MCP server development guide
    ├── skill-creator/             # Meta-skill: creates new skills
    ├── slack-gif-creator/         # Animated GIF creation for Slack
    ├── template-skill/            # Minimal starter template
    └── theme-factory/             # Professional styling themes for artifacts
```

---

## Skill Format Specification

Every skill **must** contain a `SKILL.md` file with YAML frontmatter. This is the canonical skill format per `agent_skills_spec.md`.

### Required SKILL.md Frontmatter

```yaml
---
name: my-skill-name        # lowercase, hyphen-case, alphanumeric + hyphens only
description: >             # when/why this skill should be activated
  Trigger description for AI to recognize when to use this skill.
---
```

### Optional Frontmatter Fields

```yaml
license: Apache-2.0        # SPDX license identifier
allowed-tools:             # tools pre-approved for Claude Code use
  - Bash
  - Read
  - Write
metadata:                  # arbitrary key-value pairs
  key: value
```

### Preferred SKILL.md Content Structure

1. **Overview** — 1-2 sentences on purpose and capabilities
2. **Workflow/Tasks** — Step-by-step instructions, decision trees
3. **Examples/Guidelines** — Concrete usage patterns and anti-patterns
4. **Resources** — Documentation of bundled scripts, references, and assets

Writing style: imperative/infinitive verb-first ("To do X, run Y"), objective language, designed for AI consumption.

---

## Standard Skill Directory Layout

```
skill-name/
├── SKILL.md           # Required: instructions + metadata
├── scripts/           # Executable code (Python/Bash) — run without loading context
├── references/        # Documentation loaded as needed for context
└── assets/            # Output resources (templates, fonts, images, boilerplate)
```

Only `SKILL.md` is mandatory. The `scripts/`, `references/`, and `assets/` subdirectories are conventions, not requirements.

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Skill name (frontmatter) | lowercase hyphen-case | `slack-gif-creator` |
| Skill directory | matches skill name exactly | `slack-gif-creator/` |
| Python scripts | snake_case | `init_skill.py` |
| Bash scripts | hyphen-case | `bundle-artifact.sh` |
| Reference docs | hyphen-case `.md` | `mcp-best-practices.md` |

---

## Licensing

| Skill Group | License | Notes |
|---|---|---|
| Example skills (10) | Apache 2.0 | Freely adaptable |
| Document skills (4) | Proprietary (source-available) | Do not redistribute |

When creating a new skill, specify the `license` field in frontmatter. See `THIRD_PARTY_NOTICES.md` for full third-party attributions.

---

## Marketplace Registration

Skills are published via `.claude-plugin/marketplace.json`. This file registers two plugin bundles:

- **document-skills**: `xlsx`, `docx`, `pptx`, `pdf`
- **example-skills**: all 10 example skills

When adding a new skill, register it under the appropriate bundle in `marketplace.json`:

```json
{
  "name": "my-skill-name",
  "path": "./path/to/skill"
}
```

---

## Development Workflows

### Creating a New Skill

Use the `skill-creator` skill or follow these steps manually:

1. Create a directory under the appropriate category (`document-skills/` or a new top-level dir for examples)
2. Run the initializer (if using skill-creator): `python skill-creator/scripts/init_skill.py <name> --path <path>`
3. Edit `SKILL.md` with proper frontmatter and instructions
4. Add supporting files under `scripts/`, `references/`, `assets/` as needed
5. Validate: `python skill-creator/scripts/quick_validate.py <path>`
6. Package: `python skill-creator/scripts/package_skill.py <path> [output.zip]`
7. Register in `.claude-plugin/marketplace.json`

### Building Artifacts (artifacts-builder skill)

```bash
bash artifacts-builder/scripts/init-artifact.sh <project-name>
# ... edit source files ...
bash artifacts-builder/scripts/bundle-artifact.sh   # produces bundle.html
```

Stack: Vite + TypeScript + React + Tailwind CSS + shadcn/ui (40+ components pre-packaged in `shadcn-components.tar.gz`).

### Creating Slack GIFs (slack-gif-creator skill)

Install dependencies: `pip install pillow imageio imageio-ffmpeg numpy`

Constraints:
- Message GIFs: max 2MB, 480×480px
- Emoji GIFs: max 64KB strict, 128×128px

Templates available: zoom, kaleidoscope, flip, move, explode, slide, fade, spin, shake, pulse, bounce, morph, wiggle.

### MCP Server Development (mcp-builder skill)

Four-phase workflow: research/planning → implementation → testing → deployment.

Reference files:
- `mcp-builder/references/mcp_best_practices.md`
- `mcp-builder/references/python_mcp_server.md`
- `mcp-builder/references/node_mcp_server.md`

---

## Key Conventions and Patterns

### Resource Organization (Three-Tier System)

- **`scripts/`** — Executable code; run directly. Do not embed long scripts in SKILL.md.
- **`references/`** — Load into context only when needed. Use for detailed API docs, large reference material.
- **`assets/`** — Binary or static files: fonts, images, pre-built templates, archives.

### Progressive Disclosure Design

Skills should reveal complexity progressively:
1. `SKILL.md` frontmatter → activation trigger and tool permissions
2. `SKILL.md` body → core workflow and instructions
3. `references/` → detailed documentation loaded on demand
4. `scripts/` → executable logic, not duplicated in SKILL.md

### Quality Standards

Skills in this repo emphasize craftsmanship. When writing SKILL.md instructions:
- Document anti-patterns explicitly (e.g., artifacts-builder warns against "AI slop" patterns: centered layouts, purple gradients, generic card grids)
- Specify concrete constraints (file sizes, dimensions, version requirements)
- Include decision trees for complex workflows
- Reference external standards where relevant (OOXML, MCP protocol, SPDX)

### Document Skills (OOXML-based)

The `docx`, `xlsx`, and `pptx` skills rely on OOXML format manipulation:
- Reference documentation is in `document-skills/<type>/references/`
- `docx` references: `docx-js.md` (500+ lines), `ooxml.md` (600+ lines)
- `pdf` skill uses `pypdf` and `pdfplumber` libraries
- `xlsx` includes `recalc.py` for formula recalculation after programmatic edits

---

## No Build System or CI/CD

This repository has no:
- Package manager lock files (no `package-lock.json`, `poetry.lock`, etc.)
- CI/CD pipelines (no `.github/workflows/`)
- Linting configuration (no `.eslintrc`, `.prettierrc`)
- Git hooks
- Unified test runner

Dependencies are documented per-skill (e.g., `slack-gif-creator/requirements.txt`). Each skill is self-contained.

---

## Anthropic Brand Guidelines (brand-guidelines skill)

When creating visual assets or UI:

| Token | Value |
|---|---|
| Dark background | `#141413` |
| Light background | `#faf9f5` |
| Accent orange | `#d97757` |
| Accent blue | `#6a9bcc` |
| Accent green | `#788c5d` |
| Heading font | Poppins |
| Body font | Lora |

---

## Git Workflow

- Default branch: `main`
- Commit style: descriptive imperative sentences (e.g., "Add Claude Code instructions to the readme")
- No squash policy enforced; PRs merged with merge commits
- `.gitignore` is minimal — only `.DS_Store` excluded

---

## Skill Installation

Skills can be installed by users via:
- **Claude Code CLI**: `claude mcp add` or through the marketplace
- **claude.ai**: Skills panel in the UI

The marketplace URL and distribution mechanism are managed by the `.claude-plugin/marketplace.json` registration.
