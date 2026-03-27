# claude-config

Personal Claude Code configuration and a reference full-stack demo project.

## What's here

```
.
├── CLAUDE.md                    — Global instructions loaded by Claude in every session
├── .claude/
│   ├── settings.json            — Permissions, hooks, plugins, env vars
│   └── plugins/                 — Installed plugin metadata
├── demo/                        — Full-stack todo app (reference project)
│   ├── backend/                 — Node.js + Express REST API
│   ├── frontend/                — Vite + React + React Query
│   └── docs/                    — Project documentation
│       ├── index.md             — Doc index (read this first)
│       ├── backend/             — Backend architecture + API reference
│       └── frontend/            — Frontend architecture + component reference
└── docs/superpowers/
    ├── specs/                   — Design specs (brainstorming outputs)
    └── plans/                   — Implementation plans
```

## Claude setup

### CLAUDE.md

Global instructions that Claude loads at the start of every session. Currently covers:

- **Worktree workflow** — all feature work happens in isolated git worktrees under `.worktrees/`, never directly on main
- **Demo docs** — instructs Claude to read `demo/docs/index.md` at session start and update it when docs change

### settings.json

Key configuration:

| Setting | Value | Why |
|---------|-------|-----|
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | `80` | Compact context at 80% usage instead of default, avoiding getting too close to the limit |
| `permissions.ask` | destructive git/fs commands | Require confirmation before `git push --force`, `rm -rf`, `git reset --hard`, etc. |
| `hooks.SessionStart` | prompt | Injects a reminder to read the demo docs index at session start |
| `hooks.SessionEnd` | prompt | Injects a reminder to update `demo/docs/index.md` if docs changed |

### Plugins

- **superpowers** — brainstorming, TDD, planning, subagent-driven development, and more
- **code-review** — PR review workflow
- **frontend-design** — UI/component design guidance
- **Notion** — Notion MCP integration
- **slack** — Slack workflow tools

## Running the demo

```bash
# Backend (localhost:3001)
cd demo/backend && npm install && npm start

# Frontend (localhost:5173)
cd demo/frontend && npm install && npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend — no CORS config needed.

## Running backend tests

```bash
cd demo/backend && npm test
```
