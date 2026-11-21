# SolarOS ERP — Odoo 19-Inspired Enterprise Design System

## 1. Design Philosophy
SolarOS ERP delivers an authentic Odoo 19 enterprise backend experience tailored to commercial solar engineering and field installations:
- **High Information Density**: 14px typography, 36px inputs and buttons, optimized for rapid keyboard data entry.
- **Unified Color Palette**:
  - Primary / Brand Header: `#714B67` (Classic Odoo plum / deep purple).
  - Primary Dark / Hover: `#58394F`.
  - Secondary Action Accent: `#017E84` (Odoo teal).
  - Background Canvas: `#F6F6F6` (Odoo light neutral).
  - Card & Surface: `#FFFFFF`.
  - Borders & Dividers: `#DEE2E6` / `#CED4DA`.
  - Text Primary: `#212529`.
  - Text Muted: `#6C757D`.
- **System Typography**: Native system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).

## 2. Shell Components
1. **Top Bar (`OdooTopbar`)**:
   - 48px height (`h-12`) with `#714B67` background.
   - App Launcher icon (9-dot grid) that reveals a categorized dropdown of all ERP applications.
   - Company switcher dropdown with active organization badge.
   - Branch locator pill (`GitBranch`).
   - User profile menu with initials avatar, role badge, quick links to Settings, and Logout button.
2. **Sub-Bar / Breadcrumbs**:
   - Clean white bar (`#FFFFFF`) with thin `#DEE2E6` border.
   - Path breadcrumbs: e.g. *Settings / Access Rights & Roles*.
   - Primary action buttons: e.g. *New User*, *Create Role*, *Save*, *Discard*.
3. **List Views & Form Views**:
   - Compact table headers with uppercase 11px font.
   - Badge pills for status indicators (ACTIVE, INVITED, PENDING, ACCEPTED).
