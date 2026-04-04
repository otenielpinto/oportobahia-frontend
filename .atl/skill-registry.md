# Skill Registry

**Project**: oportobahia-frontend  
**Generated**: 2026-04-03  
**Mode**: engram

---

## User Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| **go-testing** | Writing Go tests, using teatest, adding test coverage | Go testing patterns for Gentleman.Dots, including Bubbletea TUI testing |
| **branch-pr** | Creating a pull request, opening a PR, preparing changes for review | PR creation workflow for Agent Teams Lite following the issue-first enforcement system |
| **issue-creation** | Creating a GitHub issue, reporting a bug, requesting a feature | Issue creation workflow for Agent Teams Lite following the issue-first enforcement system |
| **skill-creator** | User asks to create a new skill, add agent instructions, document patterns for AI | Creates new AI agent skills following the Agent Skills spec |
| **judgment-day** | User says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | Parallel adversarial review protocol that launches two independent blind judge sub-agents simultaneously to review the same target, synthesizes their findings, applies fixes, and re-judges until both pass or escalates after 2 iterations |
| **context7-mcp** | User asks about libraries, frameworks, API references, needs code examples | Use Context7 to fetch current documentation instead of relying on training data. Activates for setup questions, code generation involving libraries, or mentions of specific frameworks like React, Vue, Next.js, Prisma, Supabase, etc. |
| **find-skills** | User asks "how do I do X", "find a skill for X", "is there a skill that can...", expresses interest in extending capabilities | Helps users discover and install agent skills from the open agent skills ecosystem |
| **playwright-cli** | User needs to navigate websites, interact with web pages, fill forms, take screenshots, test web applications, extract information from web pages | Automates browser interactions for web testing, form filling, screenshots, and data extraction |
| **dev** | User asks about rolling dependencies, releasing, other repo maintenance tasks | Development workflows for the playwright-cli repository |

## Project-Level Skills

| Skill | Trigger | Description | Location |
|-------|---------|-------------|----------|
| **frontend-design** | Build web components, pages, landing pages, dashboards, React components, HTML/CSS layouts, styling/beautifying web UI | Create distinctive, production-grade frontend interfaces with high design quality. Generates creative, polished code and UI design. | `.agents/skills/frontend-design/SKILL.md` |
| **frontend-ui-ux-engineer** | Need stunning UI/UX without design mockups, visual polish, component styling | Designer-turned-developer who crafts stunning UI/UX even without design mockups. Code may be messy, visual output is fire. | `.agents/skills/frontend-ui-ux-engineer/SKILL.md` |
| **vercel-react-best-practices** | Writing, reviewing, refactoring React/Next.js code, performance improvements, bundle optimization, data fetching patterns | React and Next.js performance optimization guidelines from Vercel Engineering. 40+ rules across 8 categories prioritized by impact. | `.agents/skills/vercel-react-best-practices/SKILL.md` |

## Project Conventions

- `.agents/skills/vercel-react-best-practices/AGENTS.md` — Vercel React Best Practices (40+ performance rules)

## Compact Rules

### vercel-react-best-practices (for React/Next.js work)

**Waterfalls (CRITICAL)**: Check cheap conditions before async flags. Defer await until needed. Use `Promise.all()` for independent ops. Strategic Suspense boundaries.

**Bundle Size (CRITICAL)**: Avoid barrel file imports (Next.js 13.5+ auto-transforms). Dynamic imports for heavy components. Preload based on user intent.

**Server-Side (HIGH)**: Authenticate server actions like API routes. Use `React.cache()` for per-request deduplication. Minimize serialization at RSC boundaries. Parallel data fetching with component composition.

**Re-render (MEDIUM)**: Calculate derived state during render. Don't define components inside components. Use `useMemo` only for expensive computations. Extract to memoized components.

**Rendering (MEDIUM)**: CSS `content-visibility` for long lists. Hoist static JSX elements. Use `useTransition` over manual loading states.

---

## How to Use This Registry

When launching sub-agents, the orchestrator should:

1. **Resolve relevant skills** based on:
   - Code context (file extensions/paths the sub-agent will touch)
   - Task context (what actions it will perform)

2. **Inject compact rules** into the sub-agent prompt as:
   ```
   ## Project Standards (auto-resolved)
   [Relevant compact rule blocks]
   ```

3. **Skills are pre-digested** — sub-agents receive rules as text, not file paths.

## Skill Resolution Examples

- **Writing Go tests** → inject `go-testing` compact rules
- **Creating a PR** → inject `branch-pr` compact rules
- **Creating an issue** → inject `issue-creation` compact rules
- **Fetching library docs** → invoke `context7-mcp` skill
- **Adversarial review** → invoke `judgment-day` skill
- **React/Next.js work** → inject `vercel-react-best-practices` compact rules
- **UI design/polish** → invoke `frontend-design` or `frontend-ui-ux-engineer` skill