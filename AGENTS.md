# AI Agent Directives

## 1. Project Context & Vision

**Project:** ViewMarket (Enterprise-Grade Algorithmic Trading Platform)  
**Scope:** Highly scalable data visualization (charting) and automated trading capabilities integrating with **30+ brokers**.  
**Standard:** All code, architecture, and security measures MUST reflect enterprise-level standards for financial software (low latency, high performance, robust error handling, and strict security).

## 2. Execution & Environment Rules

- **NEVER** run the development server (`npm run dev`) or build process (`npm run build`) unless the user explicitly instructs you to do so.

## 3. MCP Server Usage Protocol

You must leverage the installed MCP servers for their respective domains:

- **Documentation & Context:** ALWAYS use **Context7 MCP** to fetch up-to-date documentation, API references, or context for any library, framework, or tool.
- **Web Research & Scraping:** ALWAYS use **Firecrawl MCP** to search the web, scrape websites, or fetch external online content.
- **Database Operations:** ALWAYS use **Neon MCP** for any database-related tasks (querying, schema updates, migrations).
  - _Approval Rule:_ You may execute non-destructive database commands autonomously. You MUST ask for user approval BEFORE executing any destructive commands (e.g., DROP, DELETE, TRUNCATE).

## 4. Mandatory Skill Utilization

You are equipped with specialized Agent Skills located in the `.agents/skills` directory. You MUST use the relevant skill for _each and every task_ you perform.

Before starting a task, identify the applicable skill(s) and follow their specific instructions to ensure enterprise-grade, scalable, and optimal results.

**Core Skill Domains Available:**

- **Architecture & Planning:** `battle-plan`, `planning-setup`, `scalability-playbook`
- **Frontend & UI:** `tailwind-design-system`, `web-design-guidelines`, `charting`, `vercel-react-view-transitions`
- **Backend & Data:** `neon-postgres`, `neon-drizzle`
- **Framework & Types:** `next-best-practices`, `typescript-advanced-types`, `vercel-react-best-practices`
- **External & DevOps:** `aws-cli`, `devops-engineer`, `firecrawl`, `context7-mcp`
- **Quality Assurance:** `webapp-testing`

_System Directive:_ Think step-by-step. Identify the domain -> Consult the relevant skill -> Execute the task strictly following the skill's documented best practices.

## 5. Reference Code Adaptation (OpenAlgo)

- **Multi-Tenant Planning:** The local `_reference/openalgo` repository is built for a single user. Since this project is a **public, multi-user platform**, you MUST NOT blindly copy its logic.
- **Mandatory Planning:** Whenever instructed to take reference from OpenAlgo, you must first execute a deep planning phase (e.g., using the `battle-plan` skill) to adapt its code for a multi-tenant, enterprise-grade architecture with strict user isolation, scalability, and security.

## 6. UI & Typography Standards

### 1. The Monochrome Layer System (Softer Redesign)

#### Dark Theme (Premium Off-Black)

- **Darkest (Page Background):** `#1c1c1c`
- **Surface Level 1 (Containers/Sections):** `#242424`
- **Surface Level 2 (Cards/Active Rows):** `#2d2d2d`
- **Hover/Interactive:** `#383838` or `rgba(255, 255, 255, 0.08)`
- **Borders:** `1px solid rgba(255, 255, 255, 0.08)` (subtle) or `0.15` (strong)

#### Light Theme (Eye-Friendly Zinc)

- **Page Background:** `#e4e4e7` (Zinc 200 - Distinctly gray base)
- **Surface Level 1 (Containers/Sections):** `#fafafa` (Zinc 50 - Lighter cards to pop)
- **Surface Level 2 (Cards/Active Rows):** `#d4d4d8` (Zinc 300 - Darker sidebars for depth)
- **Hover/Interactive:** `#c0c0c4` (Zinc 400)
- **Borders:** `1px solid rgba(24, 24, 27, 0.08)` (subtle)
- **Primary Text:** `#18181b` (Zinc 950 - softer than black)

## 7. ViewMarket Component Philosophy

- **Clean & Essentialist:** Only show absolutely necessary elements. Avoid clutter. Hide advanced settings in modals.
- **Compact Density:** Maintain high information density using small, legible text (primary: `0.875rem`, badges: `0.625rem`). Use tight spacing balanced by clear section dividers.
- **Layered Monochrome:** Use alpha-transparent overlays (e.g., `rgba(255, 255, 255, 0.015)`) for surface elevation instead of solid gray tones.
- **Full-Width Lists:** For dashboard lists (like Brokers), use edge-to-edge horizontal separators (`border-top`/`border-bottom`) instead of floating "island" containers.
- **Interactive Precision:** Implement high-precision hover states (subtle vertical lift, background brightness shift) for all interactive rows and buttons.

## 8. Planning Methodology

For complex tasks requiring >5 tool calls, I must use the planning-setup skill to maintain persistent planning files (`planning/task_plan.md`, `planning/findings.md`, `planning/progress.md`) and adhere to `planning/planning-rules.md`.
