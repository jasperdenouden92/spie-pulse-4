# Pulse Core 4.0 — Codebase Guide

Facility management dashboard for SPIE. Built with Next.js 15, React 19, TypeScript, Material-UI v7, and Tailwind CSS v4.

> **Maintenance rule:** This file must be updated with every PR to reflect the current state of the codebase. If your changes affect routing, directory structure, conventions, environment variables, or any other documented area, update the relevant section before merging.

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

**File-based routing** using Next.js App Router. All pages live under `src/app/(shell)/` which shares a common shell layout (sidebar, header, overlays).

Navigation uses actual URL paths (e.g., `/portfolio/buildings`, `/buildings/b-001`). Filter/preference state uses query params (e.g., `?tab=performance&metric=comfort`).

Two URL helpers from `useURLState()` hook (`src/hooks/useURLState.ts`):

- `setURLParams(updates)` — `router.replace`, for filter/UI changes (no back-stack entry)
- `navigateTo(path, params?)` — `router.push`, for real page transitions

### Route Structure

| Path | Purpose |
|---|---|
| `/` | Redirects to `/control-room` |
| `/home` | Home page |
| `/control-room` | Main dashboard with KPI metrics |
| `/portfolio/buildings` | Buildings list |
| `/portfolio/clusters` | Clusters view |
| `/portfolio/assets` | Assets list (supports `groupBy=zone` tree view) |
| `/portfolio/equipment-types` | Equipment types |
| `/buildings/[slug]` | Building detail (dynamic, numeric ID e.g. `b-001`) |
| `/zones/[id]` | Zone detail (dynamic, e.g. `z-0001`) |
| `/assets/[id]` | Asset detail (dynamic, e.g. `a-0001`) |
| `/insights/alerts` | Insights — Alerts |
| `/insights/analyses` | Insights — Analyses |
| `/insights/performance` | Insights — Performance |
| `/operations` | Operations overview |
| `/operations/tickets` | Tickets list |
| `/operations/tickets/[id]` | Ticket detail |
| `/operations/quotations` | Quotations list |
| `/operations/quotations/[id]` | Quotation detail |
| `/operations/documents/[[...path]]` | Documents list (root + folder navigation) |
| `/operations/maintenance` | Maintenance list |
| `/operations/maintenance/[id]` | Maintenance detail |
| `/bms/access` | BMS — Access |
| `/bms/logging` | BMS — Logging |
| `/dashboards` | Dashboard builder |
| `/exports` | Exports |
| `/settings` | Settings |

### URL Query Parameters (still used for filters/state)

| Param | Values | Purpose |
|---|---|---|
| `building` | building name | Selected building (control room) |
| `metric` | `overall` \| metric key | Selected KPI |
| `view` | `dashboard` \| `map` \| `list` | View mode |
| `sort` | sort label | Sort order |
| `dateRange` | period label | Date filter |
| `group` | group name | Building group filter |
| `city` | city name | City filter |
| `tenant` | tenant name | Tenant filter |
| `tab` | varies by page | Active tab (building: `overview`/`zones`/etc., control room: `portfolio`/`performance`/`insights`) |
| `contract` | `yes` | Contract filter active (omitted = overall/all buildings) |
| `peek` | `building:b-001` \| `zone:z-0001` \| `asset:a-0001` | Side peek entity (shareable) |
| `doc` | document id (e.g. `DOC-2024-001`) | Open document preview overlay (global, shareable) |
| `statusFilter` | comma-separated status values | Pre-filter tickets/quotations by status |
| `search` | text | Search filter (portfolio pages, tickets, quotations) |
| `groupBy` | `none` \| `city` \| `group` \| etc. | Group by filter |

### Adding a New Page

1. Create `src/app/(shell)/my-page/page.tsx` with page content
2. Add navigation entry to `Sidebar.tsx` (uses `usePathname()` + `useRouter()` internally)
3. For detail pages: create a template in `src/templates/` and a dynamic route `[id]/page.tsx`

---

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout: ThemeRegistry, Annotations, AppStateProvider
│   ├── globals.css       # Tailwind v4 import + CSS vars
│   ├── (shell)/          # Route group — all pages share the shell layout
│   │   ├── layout.tsx    # Shell: sidebar, TopBar, overlays, side peek panels
│   │   ├── page.tsx      # / → redirects to /control-room
│   │   ├── control-room/ # Main KPI dashboard
│   │   ├── home/         # Home page
│   │   ├── portfolio/    # buildings/, clusters/, assets/, equipment-types/
│   │   ├── buildings/[slug]/  # Building detail (dynamic route)
│   │   ├── zones/[id]/        # Zone detail (dynamic route)
│   │   ├── assets/[id]/       # Asset detail (dynamic route)
│   │   ├── insights/    # alerts/, analyses/, performance/
│   │   ├── operations/  # tickets/, quotations/, documents/, maintenance/ + [id] detail routes
│   │   ├── bms/         # access/, logging/
│   │   ├── dashboards/  # Dashboard builder
│   │   ├── exports/     # Exports
│   │   └── settings/    # Settings
│   └── api/
│       ├── comments/route.ts
│       ├── changelog/route.ts
│       └── changelog/highlights/route.ts
├── templates/            # Reusable detail page templates (used by routes AND side peek)
│   ├── building.tsx      # Building detail UI
│   ├── zone.tsx          # Zone detail UI
│   ├── asset.tsx         # Asset detail UI
│   ├── ticket.tsx        # Ticket detail (stub)
│   ├── quotation.tsx     # Quotation detail (stub)
│   ├── document.tsx      # Document detail (stub)
│   └── maintenance.tsx   # Maintenance detail (stub)
├── components/           # Reusable UI components (atoms/molecules/organisms)
│   ├── charts/           # Nivo chart wrappers
│   ├── performance/      # Performance-topic card components
│   ├── Sidebar.tsx       # Navigation sidebar (uses usePathname + useRouter)
│   ├── TopBar.tsx        # Secondary toolbar (breadcrumbs, filters, uses usePathname)
│   ├── SidePeekPanel.tsx # Slide-in detail preview panel
│   ├── ZonesList.tsx     # Reusable zones table (used by portfolio, building detail, side peek)
│   ├── AssetsList.tsx    # Reusable assets table (used by portfolio, building detail, side peek)
│   ├── LinkedDocumentsList.tsx # Reusable documents table scoped by asset/building (detail pages + side peek)
│   ├── DocumentPreviewOverlay.tsx # Fullscreen document preview overlay driven by `?doc=` query param
│   ├── FilterChip.tsx    # Filter chip UI component
│   ├── FilterDropdown.tsx # Filter dropdown popover
│   └── ...               # Cards, lists, modals, etc.
├── context/
│   └── AppStateContext.tsx  # Shared ephemeral UI state (side peek, favorites, sidebar, etc.)
├── hooks/
│   ├── useURLState.ts    # URL query-param helpers (setURLParams, navigateTo, derived state)
│   ├── useFilterParams.ts # Bind filter/sort/search state to URL query params
│   └── useInfiniteScroll.ts
├── utils/
│   └── slugs.ts          # Building ID ↔ URL slug conversion
├── data/                 # All mock data (deterministic, seeded RNG)
├── annotations/          # Notion-backed annotation system
├── colors.ts             # Color token system
├── theme.ts              # MUI theme factory
├── theme-mode-context.tsx
└── theme-registry.tsx
```

---

## State Management

No Redux/Zustand. State lives in:

1. **URL paths** (primary navigation) — file-based routes determine the current page
2. **URL query params** (filters/preferences) — managed via `useURLState()` hook and `useFilterParams()` hook
3. **`AppStateContext`** (`src/context/AppStateContext.tsx`) — cross-route ephemeral UI state: side peek panels (single-peek enforced), favorites, sidebar collapsed, notifications, asset quickview
4. **Shell layout local state** — filter anchors, hover state
5. **`ThemeModeContext`** — theme preference (`system`/`light`/`dark`), resolved `colorMode`, `themeColors`

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
- **Atomic design**: `components/` = atoms/molecules/organisms, `templates/` = detail page templates, `app/(shell)/*/page.tsx` = pages
- **Templates** (`src/templates/`) are used by both full-page routes AND side peek panels (e.g., `building.tsx` renders in `/buildings/[slug]` and in the `SidePeekPanel`)
- **`AppTabs`** — reusable tab bar, `variant="pill"` or `variant="underline"`
- **`KPICard`** — metric display with custom SVG sparkline (Catmull-Rom interpolation, no external library)
- **`PropertyCard`** — building card with `TopicScore` and `EnergyLabel` sub-components
- **`ZonesList`** / **`AssetsList`** — reusable list components with optional `showFilters` prop for inline search, group by, and filter chips
- **Side peek** — single-peek enforced via `AppStateContext` wrappers; state synced to `?peek=` URL param for shareable links
- Navigation uses `router.push('/path')` from `useRouter()` or `navigateTo('/path', params)` from `useURLState()`
- Navigation callbacks (`onViewAllTickets`, etc.) use `router.push('/operations/tickets?statusFilter=...')`

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
