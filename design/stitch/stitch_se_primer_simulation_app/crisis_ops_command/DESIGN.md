---
name: Crisis Ops Command
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#1bbd85'
  on-tertiary-container: '#00452e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system drives a high-stakes, mission-critical site reliability simulation platform. The brand personality balances ruthless operational precision with a cinematic cyberpunk edge: cool under pressure, hyper-vigilant, technically uncompromising, and authoritative. It speaks directly to staff software engineers, incident commanders, and platform leads who need telemetry clarity amidst system degradation.

The visual style blends modern DevOps observability dashboards with tactical high-contrast incident response design. Deep slate and charcoal substrates reduce retinal fatigue during extended triage sessions, while sharp cyan telemetry markers, glowing warning tiers, and monospaced diagnostic streams deliver an intense yet structured visual hierarchy. The emotional baseline is absolute control over simulated chaos.

## Colors

The palette operates under an uncompromising dark mode framework. The canvas substrate sits at `#0B0F17` (Deep Obsidian Void), layered with elevated control panels at `#111827` (Charcoal Slate) and elevated hover overlays at `#1F2937`. 

- **Primary (`#06B6D4` - Cyber Cyan):** Primary interactive targets, real-time log ingestion anchors, healthy diagnostic pulses, and active system traces.
- **Secondary (`#8B5CF6` - Neural Violet):** Dedicated exclusively to the autonomous intelligence assistant, root-cause recommendations, synthetic drills, and cognitive hints.
- **Tertiary (`#10B981` - Metric Emerald):** Resolved states, optimal latency percentiles, and healthy circuit breakers.
- **Operational Status Rails:**
  - **Emergency Crimson (`#EF4444`):** Production Sev-0/Sev-1 outages, unhandled runtime crashes, data corruption warnings, and critical button triggers.
  - **Amber Warning (`#F59E0B`):** Thrashing CPU spikes, throttling thresholds, and unacknowledged alerts.

Contrast ratios meet WCAG AAA requirements across all critical telemetry labels, pairing high-luminance accent colors against dark neutral bases.

## Typography

Typography enforces a strict cognitive division: **Inter** handles top-level context, modal titles, and navigation structures, while **JetBrains Mono** governs the data plane—including logs, stack traces, latency statistics, metric readouts, and tactical labels.

1. **Tabular Metrics:** All numbers, percentiles, timestamps, and memory dumps must be rendered in `JetBrains Mono` with fixed tracking to eliminate visual jitter during real-time metric streaming.
2. **Incident Readouts:** Alert banners and severity badges leverage uppercase `label-sm` or `label-md` with `0.05em` letter spacing for split-second readability under stress.
3. **Headlines:** Set in `Inter` with tight letter tracking (`-0.02em` on sizes above 24px) to convey modern, dense, enterprise authority.

## Layout & Spacing

Layout geometry follows an 8pt base grid with a fluid multi-pane structure designed for dense screen real estate:

- **Desktop (1024px+):** 12-column dynamic grid. Optimized for simultaneous split views: Telemetry Topology / Log Stream / Incident Command Actions.
- **Tablet (768px - 1023px):** 8-column layout. Split-pane collapsible drawers for auxiliary AI metrics.
- **Mobile (< 768px):** 4-column viewport-locked column. Stacked card decks with sticky operational command bars anchored to the thumb zone.

Spacing uses tight internal padding (`space-xs` to `space-sm`) inside diagnostic components and terminal emulators to preserve high information density, while reserving `space-md` and `space-lg` for macro boundaries between structural incident stages.

## Elevation & Depth

Visual hierarchy uses tonal surface layering combined with soft edge luminescence instead of standard diffuse drop shadows:

- **Level 0 (Base Canvas):** `#0B0F17` flat substrate.
- **Level 1 (Panels & Feed Cards):** `#111827` with a low-contrast 1px border (`#1F2937`).
- **Level 2 (Active Runbooks & Modals):** `#161F30` with subtle border illumination matching the current incident state (`#06B6D4` for normal ops, `#EF4444` for active outages).
- **Incident Luminescence:** Tactical components utilize localized glow rings (`box-shadow: 0 0 16px rgba(6, 182, 212, 0.15)`) to signal operational anomalies without occluding surrounding text data.
- **Backdrop Filters:** Overlay panes, command prompts, and floating triage bars implement `backdrop-filter: blur(12px)` over semi-transparent charcoal surfaces (`rgba(17, 24, 39, 0.85)`).

## Shapes

The design uses standard rounded geometry (`0.5rem` / `rounded-md` base, `1rem` / `rounded-lg` for prominent containers, and `1.5rem` / `rounded-xl` for large diagnostic viewports and floating modals). 

This rounding softens the technical cyberpunk atmosphere, making the dense engineering workspace feel modern, refined, and approachable. Micro-elements such as terminal badge indicators, status tags, and metric chips maintain compact `0.5rem` corner radiuses for crisp alignment against rigid monospaced lines.

## Components

### Buttons & Trigger Controls
- **Tactile Incident Buttons:** High-contrast buttons with a 1px border and a subtle top-edge inner highlight. Primary actions use `#06B6D4` text and glow borders against a `#083344` substrate.
- **Sev-0 Panic Button:** High-intensity `#EF4444` background with white bold Inter text, paired with an emergency pulsing border (`box-shadow: 0 0 12px rgba(239, 68, 68, 0.4)`).
- **AI Tutor Triggers:** Bound to `#8B5CF6`, rendering with a soft purple rim lighting for contextual suggestions and dynamic debugging.

### Telemetry Cards & Incident Panels
- Base cards use `#111827` with `rounded-lg` (1rem) corners and 1px borders tinted to `#1E293B`.
- Active outage cards swap their border tint to `#EF4444` and include a top 2px glowing accent strip indicating the active Sev status.

### Metric Chips & Diagnostic Tags
- Compact `label-sm` chips constructed with JetBrains Mono.
- Statuses display semi-transparent backgrounds:
  - Critical: `rgba(239, 68, 68, 0.12)` with `#EF4444` text.
  - Warning: `rgba(245, 158, 11, 0.12)` with `#F59E0B` text.
  - Steady: `rgba(16, 185, 129, 0.12)` with `#10B981` text.

### Log Terminal & Input Fields
- Inputs feature deep slate fields (`#0D131F`) with monospaced text, a steady `1px solid #1F2937` border, and an active cyan focus ring (`#06B6D4`).
- Log lines feature alternate row shading with color-coded timestamps, log levels, and stack trace expanders.

### Toggle Switches & Selection Controls
- Checkboxes and radio buttons feature custom hexagonal or geometric squared rounded profiles (`rounded: 0.25rem`) filled with `#06B6D4` when armed, maintaining visual alignment with command-line terminal syntax.