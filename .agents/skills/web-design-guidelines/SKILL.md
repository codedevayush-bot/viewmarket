---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## ViewMarket Design Language (Project-Specific)

In addition to general Vercel guidelines, all ViewMarket UI MUST follow these specific principles:

### 1. The Monochrome Layer System

- **Darkest (Page Background):** `#000000`
- **Surface Level 1 (Containers/Sections):** `rgba(255, 255, 255, 0.015)`
- **Surface Level 2 (Cards/Active Rows):** `rgba(255, 255, 255, 0.03)`
- **Hover/Interactive:** `rgba(255, 255, 255, 0.06)` to `0.08`
- **Borders:** `1px solid rgba(255, 255, 255, 0.08)` (subtle) or `0.15` (strong)

### 2. Typography Rules (Inter)

- **Titles:** `font-weight: 500`, `letter-spacing: -0.03em`.
- **Primary Text:** `font-size: 0.875rem`, `color: #ffffff`.
- **Secondary/Meta:** `color: rgba(255, 255, 255, 0.45)` or `0.6`.
- **Badges:** `font-size: 0.625rem`, `font-weight: 600`, `letter-spacing: 0.05em`.

### 3. Layout Patterns

- **Full-Width Lists:** Use edge-to-edge separators (`border-bottom`) instead of card margins.
- **Compactness:** Use `gap: 12px` for lists and `gap: 8px` for buttons.
- **Alignment:** Consistent `24px` horizontal padding for all content areas.

### 4. Interactive Details

- **Hover States:** Always include `transition: all 0.2s ease`.
- **Visual Feedback:** Use subtle vertical shifts (`translateY(-1px)`) for card-like elements.
- **Connected Status:** Monochrome badges with `0.08` background opacity.

## Usage Guide

When asked to review UI, always cross-reference with these project-specific tokens and patterns to ensure "Clean & Compact" delivery.
