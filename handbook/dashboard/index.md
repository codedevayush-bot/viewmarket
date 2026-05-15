# Dashboard

Authenticated user area — trading workspace, charts, broker management.

## Goals

- High-density, professional trading interface
- Responsive sidebar navigation
- Real-time charting with multiple timeframes
- Broker connection management (30+ brokers)
- Clean separation of concerns (workspace, settings, support)

## Files

- `layout.md` — Shell structure, sidebar, topbar, routing
- `features.md` — Trading workspace, charts, broker list, order management
- `permissions.md` — Role-based access, user tiers

## Current Implementation

- Next.js App Router with nested layouts
- Sidebar with collapsible sections
- TradingView-style charting integration
- Profile dropdown with user settings

## Status

_In progress — core layout and navigation working._
