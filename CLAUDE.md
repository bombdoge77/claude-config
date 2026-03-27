# Claude Code Global Instructions

## Worktree Workflow for New Features

For every new feature, bug fix, or chore, work must be done in an isolated git worktree. Never work directly on the main/master branch for feature work.

### Rules

1. **Always create a new worktree** for each new feature, fix, or chore before writing any code.
2. **Worktrees live inside the repo** under a `.worktrees/` directory (e.g., `<repo-root>/.worktrees/<branch-name>`).
3. **`.worktrees/` must be gitignored** — verify `.gitignore` contains `.worktrees/` before starting. Add it if missing.
4. **Branch names** must follow the convention:
   - `feat/<descriptive-name>` — new features (e.g., `feat/create-login-screen`)
   - `fix/<descriptive-name>` — bug fixes (e.g., `fix/crash-on-startup`)
   - `chore/<descriptive-name>` — maintenance tasks (e.g., `chore/update-dependencies`)

### Steps for Starting Feature Work

```bash
# 1. Ensure .worktrees is gitignored
grep -q '.worktrees' .gitignore || echo '.worktrees/' >> .gitignore

# 2. Create the worktree with a new branch
git worktree add .worktrees/feat/create-x-screen -b feat/create-x-screen

# 3. Work inside the worktree
cd .worktrees/feat/create-x-screen
```

### Cleanup After Merging

```bash
# Remove the worktree after the branch is merged
git worktree remove .worktrees/feat/create-x-screen
git branch -d feat/create-x-screen
```

## Demo Docs

The `demo/docs/` directory contains project documentation.
`demo/docs/index.md` is a table of contents — read it at the start of every session
to orient yourself before touching demo code.

At the end of a session where you added or changed docs, update `index.md` to
reflect any new or renamed files.
