# claude-config

Personal Claude Code configuration and a reference full-stack demo project. This repo doubles as a setup guide — read through it to understand what each piece does and why.

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

---

## CLAUDE.md — Global Instructions

`CLAUDE.md` is the primary way to give Claude persistent, session-wide instructions. Claude loads it at the start of every conversation. Think of it as your standing order sheet: things you'd otherwise have to repeat in every chat.

You can have multiple `CLAUDE.md` files at different levels:

- `~/.claude/CLAUDE.md` — loaded globally, in every project
- `<repo>/CLAUDE.md` — loaded when you open that repo
- `<repo>/src/CLAUDE.md` — loaded when Claude is working inside `src/`

Instructions at lower levels take precedence. Put global preferences (tone, commit style, workflow rules) in the global file and project-specific rules in the repo file.

**What to put in CLAUDE.md:**
- Workflow rules ("always work in a worktree", "run tests before committing")
- Naming conventions and code style rules that aren't obvious from the code
- Where things live ("docs index is at `demo/docs/index.md`, read it first")
- Things Claude tends to forget or get wrong in your specific setup

**What not to put in CLAUDE.md:**
- Architecture docs — put those in actual docs files and tell CLAUDE.md where to find them
- Long reference material — Claude has to read the whole file every session

---

## Worktree Workflow

### What is a git worktree?

A git worktree lets you check out a branch into a separate directory without cloning the repo again. You get a fully independent working copy of the repo, with its own files and index, but they all share the same git history.

```
repo/
├── .git/               ← shared git database
├── ... main branch files
└── .worktrees/
    └── feat/my-feature ← separate checkout of feat/my-feature branch
        └── ... feature branch files
```

### Why use worktrees with Claude?

Claude is an autonomous agent. When it works on main directly, an interrupted session, a failed command, or a mid-flight context compaction can leave your working tree in an unknown state. Worktrees fix this:

- **Isolation** — Claude works in its own directory. Your main branch is untouched until you review and merge.
- **Parallel work** — you can keep using your editor on main while Claude works in a worktree.
- **Clean review** — when Claude is done, you get a normal PR/merge to review, not a pile of uncommitted changes on main.
- **Easy rollback** — if Claude makes a mess, delete the worktree and branch. One command, no damage.

### How it works in practice

CLAUDE.md instructs Claude to:

1. Create `.worktrees/<branch-name>` before writing any code
2. Name branches `feat/...`, `fix/...`, or `chore/...`
3. Work entirely inside the worktree
4. Leave cleanup (worktree removal, branch deletion) for after the merge

```bash
# Claude runs something like this at the start of each task:
git worktree add .worktrees/feat/add-search -b feat/add-search

# All work happens in .worktrees/feat/add-search/
# When done, you merge and clean up:
git merge feat/add-search --ff-only
git worktree remove .worktrees/feat/add-search
git branch -d feat/add-search
```

`.worktrees/` is gitignored so these ephemeral directories never appear in the repo history.

---

## Docs Flow

### The problem

Claude doesn't have memory between sessions. Ask it to add a feature and it starts from scratch every time, re-reading code to understand what's there. For a small codebase this is fine. As the project grows, this cold-start cost grows with it.

Structured documentation that Claude knows about solves this. Instead of re-inferring the architecture from source files, Claude reads a short doc and gets oriented in seconds.

### The setup

Three pieces work together:

**1. `demo/docs/` directory**

Documentation lives alongside the code. Subdirectories match the codebase structure (`backend/`, `frontend/`). Each doc covers one topic: architecture, API reference, component reference, etc.

**2. `demo/docs/index.md` — the TOC**

A single markdown table listing every doc with a one-line description and topic tags. This is what Claude reads first. It tells Claude where to look without making it read everything.

```markdown
| Doc | Description | Tags |
|-----|-------------|------|
| [backend/architecture.md](backend/architecture.md) | Stack, request flow, in-memory storage | backend, architecture |
| [backend/api.md](backend/api.md) | REST endpoints, request/response shapes | backend, api |
```

When Claude needs to know about the backend API, it reads the index, finds the right doc, and reads only that.

**3. Hooks — automated reminders**

`settings.json` registers two hooks that inject prompts into the conversation at key moments:

```
SessionStart → "Read demo/docs/index.md before doing any work on the demo."
SessionEnd   → "If you changed any docs this session, update demo/docs/index.md."
```

This means Claude never has to be reminded manually. Every session starts with orientation. Every session that touches docs ends with the index being updated. The docs stay current without discipline.

### Adding a new doc

1. Create the file under `demo/docs/<area>/your-topic.md`
2. Add a row to `demo/docs/index.md`

Claude will do step 2 automatically if it created the doc (the SessionEnd hook reminds it). For docs you write yourself, update the index manually.

---

## Permissions and the Allow/Ask Lists

### How Claude Code permissions work

Every tool call Claude makes can be:

- **Allowed** — runs without asking
- **Asked** — Claude pauses and asks you to approve before running
- **Denied** — blocked entirely

You configure this in `settings.json` under `permissions.allow` and `permissions.ask`. Rules are matched by specificity: a more-specific rule takes precedence over a less-specific one, regardless of which list it's on.

### The allow list

This config uses a long explicit allow list followed by a catch-all:

```json
"allow": [
  "Bash(git status)", "Bash(git log *)", "Bash(npm run *)",
  ...
  "Bash(*)"
]
```

The catch-all `Bash(*)` at the end means Claude can run any shell command by default. The specific entries above it aren't needed for permission — they're documentation: a record of what Claude routinely needs to do.

### The ask list

The `ask` list is evaluated before the allow list. Even though `Bash(*)` would normally permit everything, anything in `ask` intercepts first:

```json
"ask": [
  "Bash(git push --force*)",
  "Bash(git reset --hard*)",
  "Bash(rm -rf *)",
  "Bash(rm -r *)",
  "Bash(git rebase*)",
  "Bash(git push)"
]
```

These are all **destructive or hard-to-reverse** operations. Requiring confirmation before they run means Claude can't accidentally delete branches, overwrite commits, or push to a shared remote without you seeing it first.

**General rule:** allow anything read-only or easily reversible; ask for anything that deletes, rewrites history, or affects shared state.

---

## Hooks

Hooks let you inject behaviour at specific points in Claude's lifecycle. They're defined in `settings.json` under `"hooks"`:

```json
"hooks": {
  "SessionStart": [{ "hooks": [{ "type": "prompt", "prompt": "..." }] }],
  "SessionEnd":   [{ "hooks": [{ "type": "prompt", "prompt": "..." }] }]
}
```

A `prompt` hook injects text into Claude's context as if you'd typed it. Claude reads it and acts on it.

**Available hook points:**

| Hook | When it fires |
|------|--------------|
| `SessionStart` | Once, at the beginning of a new session |
| `SessionEnd` | Once, when the session ends |
| `PreToolCall` | Before every tool call |
| `PostToolCall` | After every tool call |

Hooks are powerful for enforcing workflows without putting everything in CLAUDE.md. The docs flow here uses SessionStart to orient Claude and SessionEnd to keep the index current — two behaviours that need to fire automatically, not on request.

---

## Context Compaction

Claude has a finite context window. As a session grows, older messages get compressed to make room. `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` controls when this happens:

```json
"CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "80"
```

At `80`, Claude compacts when the context reaches 80% full rather than the default (which is closer to 95%). This gives more headroom between compaction and the hard limit, reducing the chance of running out of context mid-task during long sessions.

---

## Plugins and Skills

Plugins extend Claude with domain-specific workflows called **skills**. A skill is a set of instructions Claude follows when invoked — like a runbook it reads before starting work.

Skills are invoked with the `Skill` tool (or the `/skill-name` shorthand in chat). Claude reads the skill, then follows its process step by step.

### Installed plugins

**superpowers**

The core workflow plugin. Skills include:

| Skill | What it does |
|-------|-------------|
| `superpowers:brainstorming` | Structured design sessions: Claude asks clarifying questions, proposes 2-3 approaches with trade-offs, presents a design for approval, then writes a spec doc |
| `superpowers:writing-plans` | Turns an approved spec into a detailed implementation plan with task-by-task steps, exact file paths, and code snippets |
| `superpowers:subagent-driven-development` | Executes a plan by dispatching a fresh subagent per task (isolated context), then running a spec compliance review and a code quality review before marking the task done |
| `superpowers:executing-plans` | Alternative to subagent-driven: executes a plan inline in the current session with human review checkpoints |
| `superpowers:test-driven-development` | Enforces the red-green-refactor TDD loop: write a failing test, confirm it fails, implement, confirm it passes, commit |
| `superpowers:using-git-worktrees` | Step-by-step guide to setting up an isolated worktree before starting feature work |
| `superpowers:finishing-a-development-branch` | End-of-branch checklist: tests passing, docs updated, branch ready for review |

**Typical workflow:**

```
brainstorming → writes spec to docs/superpowers/specs/
writing-plans → writes plan to docs/superpowers/plans/
subagent-driven-development → implements plan task by task, with reviews
finishing-a-development-branch → wraps up and prepares for merge
```

**code-review**

PR review workflow. Gives Claude a structured process for reviewing pull requests: summary, risk assessment, per-file comments, and an overall verdict.

**frontend-design**

UI and component design guidance. Helps Claude reason about component structure, props, state ownership, and accessibility when building or reviewing frontend code.

**Notion**

MCP integration for Notion. Lets Claude read and write Notion pages, databases, and comments directly from the conversation — useful for syncing project docs to Notion or querying a Notion knowledge base.

**slack**

Slack workflow tools. Lets Claude post messages, read channel history, and interact with Slack — useful for automated summaries or status updates.

---

## Running the demo

```bash
cd demo
npm install          # installs concurrently
npm run install:all  # installs backend + frontend deps
npm start            # starts both, colour-coded output
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend — no CORS config needed. Ctrl+C stops both.

## Running backend tests

```bash
cd demo/backend && npm test
```
