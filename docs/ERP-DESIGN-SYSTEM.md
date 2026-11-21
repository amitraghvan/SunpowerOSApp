# SunPowerOS — ERP Design System Specification

**Product:** SunPowerOS  
**Design Paradigm:** Odoo Enterprise Information Density & Visual Hierarchy  
**Stylesheet:** `apps/web/src/styles/erp.css`  

---

## 1. Color Palette & Design Tokens

```css
:root {
  /* Brand Primary */
  --erp-primary: #714B67;          /* Odoo Enterprise Plum */
  --erp-primary-hover: #5D3D54;
  --erp-primary-light: #F1EAF0;

  /* Accent & Action */
  --erp-secondary: #008784;        /* Odoo Enterprise Teal */
  --erp-secondary-hover: #016B69;
  --erp-secondary-light: #E6F3F3;
  --erp-accent: #E95B5B;           /* Coral Highlight */
  --erp-accent-light: #FDE8E8;
  --erp-amber: #F59E0B;            /* Pending / Warning */
  --erp-amber-light: #FEF3C7;

  /* Surfaces & Canvas */
  --erp-canvas: #F6F6F6;           /* Neutral App Background */
  --erp-surface: #FFFFFF;          /* Card & Sheet Canvas */
  --erp-surface-subtle: #F8F9FA;   /* Header & Ribbon Background */
  --erp-surface-hover: #F1F3F5;

  /* Borders & Dividers */
  --erp-border: #DEE2E6;           /* Standard Structural Border */
  --erp-border-subtle: #E9ECEF;
  --erp-border-focus: #714B67;

  /* Typography */
  --erp-text: #212529;             /* Primary Text */
  --erp-text-muted: #6C757D;       /* Subtext & Secondary Labels */
  --erp-text-subtle: #ADB5BD;      /* Placeholder & Icons */

  /* Dimensions */
  --erp-topbar-height: 58px;
  --erp-sidebar-width: 252px;
  --erp-sidebar-collapsed-width: 64px;
}
```

---

## 2. Component Class Standards

### 2.1 Control Panel Ribbon (`.erp-control-panel`)
The horizontal action and filter bar that sits directly above record lists and forms:
- Background: `#FFFFFF`
- Border: `1px solid #DEE2E6`
- Spacing: `0.75rem 1.25rem`
- Holds breadcrumbs, search bars, filter dropdowns, and primary action buttons.

### 2.2 Smart Button (`.erp-smart-btn`)
Odoo-style rectangular metric counters positioned at the top-right of record sheets:
- Metric value: `1.125rem`, bold, plum color, tabular numbers.
- Label: `0.6875rem`, bold uppercase muted gray.
- Hover effect: Subtle border tint and 1px drop shadow.

### 2.3 Status Pipeline Ribbon (`.erp-statusbar`)
Displays sequential document stages (e.g., `Draft → Submitted → Approved → Confirmed`):
- Active stage: Solid plum pill with white text (`.erp-stage-pill--active`).
- Completed stage: Subtle teal background with teal text (`.erp-stage-pill--completed`).
- Pending stage: Transparent background with muted gray text (`.erp-stage-pill--pending`).

### 2.4 Enterprise Data Table (`.erp-table`)
High-density data table for complex operational lists:
- Header: `#F8F9FA`, uppercase 11px font, bold, sticky top border.
- Body cells: 13px font, `#212529`, with `#FAFBFD` hover tint.
- Tabular figures: Enabled by default on all numeric, currency, and date columns.

### 2.5 Form Sheet Container (`.erp-sheet`)
Standard container mimicking physical paper documents:
- Border: `1px solid #DEE2E6`, border radius `8px`.
- Box shadow: Soft `0 1px 3px rgba(0, 0, 0, 0.04)`.
- Divided into header ribbon, smart buttons, tab bar, field grid, and audit footer.
