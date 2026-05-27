---
name: Modern Governance System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4e5e82'
  primary: '#031636'
  on-primary: '#ffffff'
  primary-container: '#1a2b4c'
  on-primary-container: '#8293ba'
  inverse-primary: '#b6c6f0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#001c10'
  on-tertiary: '#ffffff'
  tertiary-container: '#003320'
  on-tertiary-container: '#00a774'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b6c6f0'
  on-primary-fixed: '#071b3b'
  on-primary-fixed-variant: '#364669'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter-md: 16px
  sidebar-width: 280px
  sidebar-collapsed: 72px
---

## Brand & Style
This design system is engineered for high-stakes GovTech environments where clarity, authority, and data integrity are paramount. The aesthetic follows a **Corporate/Modern** direction infused with **Minimalist** principles to manage the high cognitive load inherent in administrative SaaS platforms.

The visual language emphasizes transparency through open layouts and "High-Tech" precision via sharp, intentional alignment. The interface must feel institutional yet innovative—moving away from legacy bureaucratic software toward a responsive, data-driven future. 

**Key Principles:**
- **Authority through Density:** Information-dense views that remain legible, reflecting professional-grade tooling.
- **Visual Evidence:** Every UI element must serve a functional purpose; decorative flourishes are removed to maintain a "single source of truth" atmosphere.
- **Reliability:** Standardized patterns that evoke the stability of government institutions.

## Colors
The palette is anchored by **Deep Navy (#1A2B4C)**, providing an immediate sense of institutional weight and security. **Royal Blue (#2563EB)** is reserved for primary actions and interactive states, ensuring high discoverability against dense data backgrounds.

**Functional Color Usage:**
- **Primary (Navy):** Headers, navigation sidebars, and high-level structural elements.
- **Secondary (Royal):** Buttons, links, active states, and focus indicators.
- **Success/Growth (Teal):** Used for "Resolved" statuses, positive trend lines, and completed milestones.
- **Semantic Alerts:** Amber and Red are used strictly for system-level notifications and urgent data validation to prevent "alert fatigue."

The system supports a **Subtle Grey (#F8FAFC)** foundation to reduce eye strain during prolonged administrative sessions, with a logical mapping for dark mode transition in specialized admin panels.

## Typography
**Inter** is the primary typeface, chosen for its exceptional legibility in data-heavy dashboards and systematic, neutral character. To enhance the "high-tech" and "data-driven" personality, **JetBrains Mono** is utilized for technical strings, IDs, and tabular figures within data widgets.

**Hierarchy Rules:**
- **Headlines:** Use tighter letter-spacing and heavier weights to maintain a strong presence.
- **Body Text:** Standardized at 14px for dashboards to maximize information density without compromising accessibility.
- **Labels:** Use Medium weight and slight capitalization for secondary metadata and form headings.

## Layout & Spacing
The system utilizes a **12-column fluid grid** for main content areas, allowing data visualizations to expand and contract based on available real estate.

**Spatial Rules:**
- **Sidebar Navigation:** A fixed left-hand rail at 280px provides the primary hierarchy. It may collapse to 72px for expert users who prioritize workspace.
- **The 8px Grid:** All vertical and horizontal rhythm is based on 8px increments (4px, 8px, 16px, 24px, 32px, etc.).
- **Data Density:** In complex tables and Kanban boards, padding may be reduced to 4px (compact mode) to allow more rows to be visible above the fold.
- **Breakpoints:**
  - Mobile: < 768px (Single column, hidden sidebar via drawer).
  - Tablet: 768px - 1280px (Fluid content, collapsed sidebar).
  - Desktop: > 1280px (Fixed sidebar, fluid content).

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Ambient Shadows** to create a structured hierarchy that feels organized rather than cluttered.

- **Level 0 (Background):** The base canvas uses #F8FAFC. 
- **Level 1 (Cards/Widgets):** Surfaces that hold primary content use a white background with a 1px border (#E2E8F0) and an ultra-soft ambient shadow (Blur: 4px, Y: 2px, Opacity: 4% Black).
- **Level 2 (Overlays/Modals):** Elements that require immediate focus use a more defined shadow (Blur: 12px, Y: 8px, Opacity: 8% Navy) to physically lift them above the dashboard.
- **Sidebar Depth:** The sidebar uses a slight tonal shift (Deep Navy) instead of shadows to anchor the navigation.

## Shapes
The shape language is **Soft (0.25rem)**, striking a balance between the rigid "sharp" edges of legacy software and the overly "bubbly" roundedness of consumer apps.

- **Buttons & Inputs:** 4px (0.25rem) corner radius.
- **Cards & Kanban Columns:** 8px (0.5rem) corner radius.
- **Status Badges:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.
- **Data Visualization Bars:** Sharp 2px radius to maintain a precise, technical look.

## Components
Consistent component behavior ensures the platform remains scalable and easy for government employees to master.

- **Buttons:** 
  - *Primary:* Solid Royal Blue with white text.
  - *Secondary:* Navy Blue outline with Navy text.
  - *Ghost:* No border, Navy text, appears on hover for low-priority actions.
- **Status Badges:** High-contrast text on a low-opacity background of the same color (e.g., Teal text on 10% Teal background) for immediate scanning.
- **Input Fields:** Standardized height of 40px. Use a 1px border (#CBD5E1) that transitions to Royal Blue on focus.
- **Kanban Boards:** Columns are defined by a subtle grey background (#F1F5F9). Cards within columns use Level 1 elevation and include a color-coded top-border representing the status.
- **Sidebar Navigation:** Use an "Active Indicator" (a 4px vertical Royal Blue bar on the left edge) to show the current location. Support nested folders for complex hierarchies.
- **Data Widgets:** Consistent header structure with title on the left and "Export/Filter" actions on the right.