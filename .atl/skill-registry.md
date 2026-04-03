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

## Project Conventions

No project-level conventions found (no AGENTS.md, CLAUDE.md, .cursorrules, or similar files detected).

## Compact Rules

No project-specific compact rules defined.

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