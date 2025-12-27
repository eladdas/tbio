# Design Guidelines: SaaS Keyword Rank Tracking Platform

## Design Approach

**Reference-Based SaaS Dashboard Design**
Drawing inspiration from professional SEO tools (Ahrefs, SEMrush) and SaaS platforms (Linear, Notion) with emphasis on data clarity and efficient workflows. This is a utility-focused platform where information density and scanability are paramount.

## Layout System

**Sidebar Navigation Architecture**
- Fixed left sidebar (260px wide) for primary navigation with collapsible state (64px icons-only)
- Main content area uses container max-width of 1400px with horizontal padding of 6 (p-6)
- Consistent vertical spacing rhythm: sections use py-8, cards use p-6, inner elements use gap-4
- Dashboard widgets arranged in responsive grid: 2 columns on desktop (grid-cols-2), stacking on mobile
- Data tables span full width within content area for maximum information display

**Spacing Primitives**
Use Tailwind units: 2, 4, 6, 8 for consistent micro-spacing; 12, 16, 20 for section spacing

## Typography

**Font Families**
- Primary: Inter (via Google Fonts CDN) for clean, professional data presentation
- Fallback: system-ui, -apple-system, sans-serif

**Hierarchy**
- Page titles: text-3xl font-bold (30px)
- Section headings: text-xl font-semibold (20px)
- Card titles: text-lg font-medium (18px)
- Body text: text-base (16px)
- Small labels/metadata: text-sm (14px)
- Micro text (table cells): text-sm with tabular-nums for number alignment

## Core Components

**Navigation**
- Sidebar with icon + label navigation items
- Active state: background accent with left border indicator
- Top bar contains: breadcrumbs, search, notifications, user menu with avatar

**Dashboard Widgets**
- Metric cards with large number display, trend indicator (up/down arrows), sparkline charts
- Quick stats grid showing: total keywords, average position, domains tracked, today's changes
- Recent activity feed with timestamp and status badges

**Data Tables**
- Sticky header row with sort indicators (chevron icons)
- Row hover state with subtle background change
- Inline actions (view, edit, delete icons) appear on hover
- Pagination controls at bottom with rows-per-page selector
- Filter dropdowns and search input integrated above table

**Forms & Inputs**
- Floating labels or top-aligned labels for all inputs
- Input groups for complex fields (domain + keyword combination)
- Multi-select dropdowns for bulk keyword entry
- Clear validation states with inline error messages below fields

**Charts & Visualization**
- Line charts for rank position over time (inverted Y-axis: lower numbers at top)
- Bar charts for competitor comparison
- Position change indicators with colored badges (green up, red down, gray unchanged)
- Date range picker for historical data filtering

**Status Indicators**
- Badge components for subscription tiers (Free, Pro, Enterprise)
- Position change pills with +/- prefix and directional colors
- Processing status dots (animated pulse for "checking", static for "complete")

**Admin Panel Components**
- User management table with role badges, status toggles, action menus
- System metrics dashboard with real-time data refresh
- Tenant overview cards showing usage statistics per account

## Multi-Tenant Features

**Workspace Switcher**
- Dropdown in sidebar header showing current tenant/workspace
- Account switching without re-authentication
- Visual separator between personal and managed accounts

**Subscription Display**
- Current plan badge in sidebar footer
- Usage progress bars (keywords used / limit, domains tracked / limit)
- Upgrade CTA when approaching limits

## Images

**Dashboard Context**
- NO hero image on dashboard pages (data-first interface)
- Empty state illustrations for: no keywords added, no data available, trial expired
- Placeholder avatars using initials with colored backgrounds
- Optional: subtle background pattern in sidebar (very low opacity geometric shapes)

**Marketing Landing Page** (if included)
- Large hero section with abstract data visualization or dashboard mockup screenshot
- Feature section images showing: rank tracking interface, chart visualization, mobile view
- Trust indicators: customer logos, testimonials with headshots

## Navigation Patterns

**Dashboard Pages**
- Keywords Overview (default landing)
- Add Keyword / Domain
- Historical Reports
- Competitors Analysis
- Account Settings
- Billing & Subscription
- Admin Panel (admin-only)

**Information Hierarchy**
- Dashboard uses prominent metric cards above detailed data tables
- Filtering controls precede data displays
- Critical actions (Add Keyword) placed prominently in top-right of content area

## Responsive Behavior

**Mobile Adaptations**
- Sidebar collapses to bottom navigation bar
- Data tables convert to card layout with stacked information
- Charts maintain aspect ratio, become scrollable horizontally if needed
- Touch-friendly target sizes (44px minimum)

This design creates a professional, data-dense SaaS interface optimized for frequent use by SEO professionals who need quick access to ranking data and trends.