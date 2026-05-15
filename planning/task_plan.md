# Plan: Standardize Monochrome Color Palette Across ViewMarket

## Context

Research across 8 major platforms (Spotify, GitHub, Discord, Notion, Apple, Binance, Twitter/X, Material Design) revealed that ViewMarket's current dark base (`#1c1c1c`) is lighter than the industry standard (`#121212`), and the light base (`#e4e4e7`) diverges from the universal `#ffffff` convention. The user chose to align with industry-standard palettes.

## Target Palettes

### Dark Theme (Spotify/Material Design standard)

| Role                  | Current   | New       | Source                              |
| --------------------- | --------- | --------- | ----------------------------------- |
| `--bg-page`           | `#1c1c1c` | `#121212` | Material Design recommended surface |
| `--bg-surface`        | `#242424` | `#1a1a1a` | +8 steps from base                  |
| `--bg-surface-alt`    | `#2d2d2d` | `#242424` | +12 steps from base                 |
| `--bg-elevated`       | `#383838` | `#2d2d2d` | +1b steps from base                 |
| Overlays/borders/text | unchanged | unchanged | Already well-calibrated             |

### Light Theme (GitHub/Apple/Notion standard)

| Role                 | Current                  | New                      | Source                                   |
| -------------------- | ------------------------ | ------------------------ | ---------------------------------------- |
| `--bg-page`          | `#e4e4e7`                | `#ffffff`                | Industry standard white                  |
| `--bg-surface`       | `#fafafa`                | `#f5f5f7`                | Apple-style subtle gray                  |
| `--bg-surface-alt`   | `#d4d4d8`                | `#e8e8ed`                | Lighter sidebar, more contrast with page |
| `--bg-elevated`      | `#c0c0c4`                | `#d4d4d8`                | Zinc 300 hover states                    |
| `--text-primary`     | `#18181b`                | `#18181b`                | Unchanged — already optimal              |
| `--nav-bg`           | `rgba(228,228,231,0.85)` | `rgba(255,255,255,0.85)` | Match new white page                     |
| All overlays/borders | `rgba(24,24,27,...)`     | `rgba(24,24,27,...)`     | Unchanged                                |

## Files to Modify

### 1. `app/globals.css` (primary — all CSS custom properties)

- **Dark `:root`**: Update `--bg-page`, `--bg-surface`, `--bg-surface-alt`, `--bg-elevated`
- **Light `[data-theme='light']`**: Update `--bg-page`, `--bg-surface`, `--bg-surface-alt`, `--bg-elevated`, `--nav-bg`
- All overlay, border, and text tokens remain unchanged

### 2. `app/components/Hero.module.css` (3 hardcoded values)

- Line 240: `#d4d4d8` → `var(--bg-surface-alt)` or updated hex
- Line 248: `#d4d4d8` → same
- Line 311: `#d4d4d8` → same

### 3. `app/components/FeaturesSection.module.css` (2 hardcoded values)

- Line 40: `#d4d4d8` → `var(--bg-surface-alt)` or updated hex
- Line 76: `#c0c0c4` → `var(--bg-elevated)` or updated hex

### 4. `app/cart/Cart.module.css` (1 hardcoded value)

- Line 32: `rgba(24, 24, 27, 0.05)` — light theme shadow, unchanged (still correct)

## Execution Order

1. Update dark theme tokens in `globals.css` `:root`
2. Update light theme tokens in `globals.css` `[data-theme='light']`
3. Fix hardcoded hex values in `Hero.module.css` (replace with CSS var references)
4. Fix hardcoded hex values in `FeaturesSection.module.css` (replace with CSS var references)
5. Verify `Cart.module.css` shadow is still appropriate (no change expected)

## What Stays Unchanged

- All `rgba()` overlay values (dark theme) — already industry-calibrated
- All border tokens — already correct
- All text opacity levels — already match Material Design spec (98%, 80%, 60%, 50%, 35%)
- All semantic/status colors (green, red, yellow)
- Navbar tokens in dark mode (already derived from `--bg-page`)
- All `.tsx` files — no hardcoded colors found

## Verification

- Visual check: dark theme should feel slightly deeper/richer (closer to Spotify feel)
- Visual check: light theme should feel cleaner/brighter (closer to GitHub/Apple feel)
- No build required per project rules
