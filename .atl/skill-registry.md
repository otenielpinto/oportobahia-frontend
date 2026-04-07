# Skill Registry

**Project**: oportobahia-frontend  
**Generated**: 2026-04-07  
**Mode**: engram

---

## User Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| **go-testing** | Writing Go tests, using teatest, adding test coverage | Go testing patterns for Gentleman.Dots, including Bubbletea TUI testing |
| **branch-pr** | Creating a pull request, opening a PR, preparing changes for review | PR creation workflow for Agent Teams Lite with issue-first enforcement |
| **issue-creation** | Creating a GitHub issue, reporting a bug, requesting a feature | Issue creation workflow for Agent Teams Lite with issue-first enforcement |
| **skill-creator** | User asks to create a new skill, add agent instructions, document AI patterns | Creates new AI agent skills following the Agent Skills spec |
| **judgment-day** | User says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | Parallel adversarial dual-judge review protocol |
| **context7-mcp** | User asks about libraries/frameworks/APIs or requests code examples | Fetches up-to-date docs via Context7 (resolve library ID → query docs) |
| **playwright-cli** | User needs browser automation, form filling, screenshots, extraction | Automates browser interactions through playwright-cli |
| **dev** | User asks about playwright-cli maintenance, roll/release workflows | Development workflows for the playwright-cli repository |

## Project-Level Skills

| Skill | Trigger | Description | Location |
|-------|---------|-------------|----------|
| **frontend-design** | Build/stylize web components, pages, dashboards, landing pages | Distinctive production-grade frontend UI with strong aesthetic direction | `.agents/skills/frontend-design/SKILL.md` |
| **frontend-ui-ux-engineer** | Need polished UI/UX without design mockups | Designer-turned-developer focused on visual quality | `.agents/skills/frontend-ui-ux-engineer/SKILL.md` |
| **vercel-react-best-practices** | Writing/reviewing/refactoring React/Next.js code and performance | Vercel React/Next.js optimization rules (waterfalls, bundle, server, rendering) | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| **find-skills** | Skill discovery and installation requests | Project override for skills ecosystem guidance | `.agents/skills/find-skills/SKILL.md` |

## Project Conventions

- `.github/copilot-instructions.md` — ShadCN + Tailwind, dark/light mode, responsive layout, loading/error states, TypeScript-first, PT-BR text preference.
- `.agents/skills/vercel-react-best-practices/AGENTS.md` — high-priority performance rules for React/Next.js execution and review.

## Compact Rules

### project-ui-conventions
- Prefer **ShadCN components + Tailwind CSS** for UI composition.
- Ensure **dark/light mode support**, responsive spacing/alignment, hover/focus accessibility states.
- For data operations, include **loading + error + success feedback** (skeletons/toasts where relevant).
- Keep components **properly typed in TypeScript** and align with Next.js App Router conventions.
- Prefer **PT-BR copy** in user-facing text when generating UI content.

### vercel-react-best-practices
- **Eliminate waterfalls**: cheap sync guards first, then async; use `Promise.all` for independent calls.
- **Protect bundle size**: avoid barrel-import bloat, use dynamic imports for heavy modules.
- **Server-side discipline**: authenticate server actions, avoid shared mutable module state, minimize RSC serialization.
- **Render efficiency**: derive state during render, avoid inline component definitions, use `useTransition`/Suspense intentionally.
- **Use caching intentionally**: React `cache()` for per-request dedupe; LRU for cross-request hot data.

### context7-mcp
- For library/framework/API questions, **always** resolve library ID first, then query docs.
- Prefer official/high-reputation docs and version-specific references when available.

### branch-pr
- Every PR must link an approved issue and include exactly one `type:*` label.
- Keep branch naming `type/description` and use conventional commits.

### issue-creation
- Use issue templates (no blank issues), include repro/context, and follow approval workflow.

### go-testing
- Use table-driven tests; keep tests deterministic and explicit on expected errors.

---

## How to Use This Registry

When launching sub-agents, resolve skills by code/task context and inject matching compact rule blocks under:

```md
## Project Standards (auto-resolved)
[matching compact rules]
```
