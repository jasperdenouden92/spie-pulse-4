# Pulse Core 4.0 — Codebase Guide

Facility management dashboard for SPIE. Built with Next.js 15, React 19, TypeScript, Material-UI v7, and Tailwind CSS v4.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15.1.6 (App Router) |
| Language | TypeScript 5.9.3 (strict) |
| UI Components | Material-UI (MUI) v7.3.7 |
| Styling | MUI `sx` prop + Tailwind CSS v4 + Emotion |
| Charts | Nivo v0.99 (bar, line, pie, scatter) |
| Maps | React-Map-GL v8 + MapLibre GL v5 |
| Animation | Framer Motion v12 |
| Drag & Drop | @dnd-kit |
| Annotations | @jasperdenouden92/annotations (Notion-backed) |
| Compiler | React Compiler (experimental, enabled in next.config.ts) |
| Fonts | Inter (body), Jost (headings) via next/font/google |

---

## Routing & Navigation

**All pages live in a single file: `src/app/page.tsx`.**

Navigation is URL query-param based — no file-based Next.js routes. State is derived from `useSearchParams()` and mutations go through two helpers:

- `updateParams(updates)` — `router.replace`, for filter/UI changes (no back-stack entry)
- `navigateTo(updates)` — `router.push`, for real page transitions

### URL Parameters

| Param | Values | Purpose |
|---|---|---|
| `page` | see type below | Current section |
| `building` | building name | Selected building |
| `metric` | `overall` \| metric key | Selected KPI |
| `view` | `dashboard` \| `map` \| `list` | View mode |
| `sort` | sort label | Sort order |
| `dateRange` | period label | Date filter |
| `group` | group name | Building group filter |
| `city` | city name | City filter |
| `tenant` | tenant name | Tenant filter |
| `inspect` | `1` | Inspect mode |
| `explorer` | `1` | Asset explorer panel |
| `btab` | `overview` \| `performance` \| `zones` \| `assets` \| `tickets` \| `quotations` | Building detail tab |
| `ztab` | `overview` \| `assets` \| `tickets` \| `quotations` | Zone detail tab |
| `zone` | zone ID | Selected zone |
| `asset` | asset ID | Selected asset |
| `assetTab` | number | Asset panel tab |

### `currentPage` Type

```ts
type CurrentPage =
  | 'home'
  | 'portfolio' | 'portfolio_buildings' | 'portfolio_clusters'
  | 'portfolio_zones' | 'portfolio_assets' | 'portfolio_equipment_types'
  | 'building_detail' | 'zone_detail'
  | 'insights' | 'insights_alerts' | 'insights_analyses' | 'insights_performance'
  | 'bms' | 'bms_access' | 'bms_logging'
  | 'operations' | 'operations_docs' | 'operations_tickets'
  | 'operations_quotations' | 'operations_maintenance'
  | 'themes' | 'workspaces' | 'exports' | 'dashboards'
```

Default page (when `?page=` is absent): `'portfolio'`

### Adding a New Page

1. Add the new value to the `currentPage` type union in `page.tsx`
2. Add a label mapping in `getCurrentPageName()` (the `if (currentPage === ...)` block)
3. Add `{currentPage === 'my_page' && <MyPage />}` in the render section
4. Add navigation entry to `Sidebar.tsx`

---

## Directory Structure

```
src/
├── app/
│   ├── page.tsx          # Main entry — all routing, layout, page rendering (~1600+ lines)
│   ├── layout.tsx        # Root layout: ThemeRegistry, ThemeModeProvider, AnnotationProvider
│   ├── globals.css       # Tailwind v4 import + CSS vars (--font-jost, --background)
│   └── api/
│       ├── comments/route.ts             # Notion comment CRUD
│       ├── changelog/route.ts            # GitHub commits → changelog
│       └── changelog/highlights/route.ts # Curated highlights
├── components/
│   ├── charts/           # Nivo chart wrappers (15 files)
│   ├── performance/      # Performance-topic card components
│   ├── Sidebar.tsx       # Navigation: drag-drop favorites, building list, search
│   ├── Header.tsx        # Top bar (logo, search, notifications, user menu)
│   ├── TopBar.tsx        # Secondary toolbar (date range, filters, view toggle)
│   ├── AppTabs.tsx       # Reusable tabs (pill or underline variant)
│   ├── KPICard.tsx       # Metric card with custom SVG sparkline (Catmull-Rom)
│   ├── PropertyCard.tsx  # Building card with scores, energy label
│   └── [Feature]Page.tsx # Page-level components (PortfolioPage, BmsPage, etc.)
├── data/                 # All mock data
│   ├── buildings.ts      # 50 buildings, seeded deterministic RNG (xorshift32)
│   ├── metrics.ts        # KPI definitions, theme/operations metrics, period filtering
│   ├── tickets.ts        # Support tickets
│   ├── quotations.ts     # Maintenance quotations
│   ├── maintenance.ts    # Maintenance schedule
│   ├── locations.ts      # City lat/lng coordinates
│   └── generators.ts     # Shared data generation utilities
├── hooks/
│   └── useInfiniteScroll.ts  # Client-side pagination, 300ms artificial delay
├── annotations/
│   ├── config.ts         # Annotation library config + Notion endpoint
│   └── provider.tsx      # AnnotationProvider wrapper
├── colors.ts             # Color token system for light/dark modes
├── theme.ts              # MUI createTheme() factory
├── theme-mode-context.tsx # ThemeModeContext: preference, colorMode, themeColors
└── theme-registry.tsx    # Emotion cache setup for MUI SSR compatibility
```

---

## State Management

No Redux/Zustand. State lives in:

1. **URL params** (primary navigation state) — all routing, selected building, metric, filters
2. **`page.tsx` local state** — UI toggles (panel open/closed, notifications, mobile nav)
3. **`ThemeModeContext`** — theme preference (`system`/`light`/`dark`), resolved `colorMode`, `themeColors`; persisted to `localStorage` as `'theme-mode'`

---

## Styling

**MUI `sx` prop** is the primary styling mechanism. Use theme-aware values (`theme.palette.divider`, etc.).

**Color tokens** are defined in `src/colors.ts` via `getColors(mode: 'light' | 'dark')`. Key tokens:

- `brand`, `brandAlpha(opacity)` — primary brand color
- `secondary`, `secondaryAlpha(opacity)` — accent color
- `statusGood`, `statusModerate`, `statusPoor`, `statusOffline` — traffic-light status
- `textPrimary`, `textSecondary`, `textDisabled`
- `backgroundPaper`, `backgroundDefault`, `backgroundSubtle`
- `chartAxisText`, `chartGridLine`

Access in components via `useThemeMode()` hook → `themeColors`.

**Tailwind CSS v4** is available for utility classes but MUI `sx` takes precedence for component-level styling.

---

## Data Layer

All data is **mock/generated** — no real database. Deterministic generation uses a seeded xorshift32 RNG in `buildings.ts` so data is consistent across reloads.

Key exports from `data/`:
- `buildings` — array of `Building` objects (50 buildings across multiple tenants/cities)
- `tenants` — list of tenant names
- `overallMetrics`, `themeMetrics`, `expandedThemeMetrics`, `operationsMetrics` — KPI definitions
- `getMetricsForPeriod(dateRange)` — adjusts metrics based on selected period
- `sortBuildingsByMetric()`, `sortBuildingsByTrend()` — building sort utilities
- `CONTRACT_HIDDEN_THEME_KEYS`, `CONTRACT_HIDDEN_OPERATIONS_KEYS` — keys hidden per tenant contract

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/comments` | GET | Fetch comments by annotation ID from Notion |
| `/api/comments` | POST | Create comment (stored in Notion) |
| `/api/changelog` | GET | Recent GitHub commits, 5-min ISR revalidation |
| `/api/changelog/highlights` | GET | Curated changelog entries |

**Environment variables required:**

```
NEXT_PUBLIC_MAPTILER_KEY  # MapTiler API key (client-side, for maps)
NOTION_API_KEY            # Notion integration token
NOTION_DATABASE_ID        # Notion comments database
NOTION_PROJECT_ID         # Notion project identifier
GITHUB_TOKEN              # (optional) GitHub PAT for higher API rate limits
```

---

## Theme System

Theme is created in `src/theme.ts` via `createTheme()`. Two providers wrap the app:

1. `ThemeRegistry` (`theme-registry.tsx`) — Emotion cache for MUI SSR
2. `ThemeModeProvider` (`theme-mode-context.tsx`) — manages preference + derived color mode

Access theme in components:
```ts
import { useThemeMode } from '@/theme-mode-context';
const { colorMode, themeColors } = useThemeMode();
```

---

## Component Patterns

- All components are **`"use client"`** functional components
- **Composition** over inheritance — layouts use MUI `Box`/`Paper`/`Container`
- **`AppTabs`** — reusable tab bar, `variant="pill"` or `variant="underline"`
- **`KPICard`** — metric display with custom SVG sparkline (Catmull-Rom interpolation, no external library)
- **`PropertyCard`** — building card with `TopicScore` and `EnergyLabel` sub-components
- Page-level components receive props from `page.tsx` and do not manage routing themselves

---

## Key Conventions

- Path alias `@/` maps to `src/`
- TypeScript strict mode; avoid `any`
- MUI icons from `@mui/icons-material` (Outlined variants preferred)
- `useMemo`/`useCallback` used liberally — React Compiler may eventually remove the need
- Seeded RNG: never use `Math.random()` in data generators — use the seeded utility
- `CONTRACT_HIDDEN_*` constants control which metrics are visible per tenant; check these before adding new metrics

---

## Dev Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm start      # Run production server
npm run lint   # ESLint
```

No test suite is configured.
