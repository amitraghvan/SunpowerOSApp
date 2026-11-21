# Odoo Public Website Reference Analysis & Adaptation

## 1. Visual Benchmark Comparison

The redesign benchmarked against Odoo's official public CRM product website:

| Visual Attribute | Odoo CRM Public Benchmark | SunPowerOS Adaptation |
| :--- | :--- | :--- |
| **Canvas Background** | Pure white (`#FFFFFF`) with soft grey feature strips (`#F4F4F6`) | Exact match: 80% white canvas, `#F4F4F6` alternating sections |
| **Headline Style** | Handwritten display font with compact line-height | Implemented with `Caveat` (78–88px desktop, compact line height) |
| **Primary Action Color** | Signature Plum (`#714B67`) with soft hover states | Exact brand token `--sp-brand-plum: #714B67` for `Start Free` buttons |
| **Editorial Accents** | Hand-drawn coral highlight, teal underline, amber sketch arrows | Custom SVGs: `AccentUnderline`, `AccentCircle`, `SketchArrow`, `CoralSpark` |
| **Product Screenshot Framing** | Browser window with toolbar, dots, URL bar, and subtle shadow | `product-window` component with 18px radius, `#E4E5E9` border, toolbar, and caption |
| **Storytelling Rhythm** | Alternating 43%/57% text and product visual grids | `.feature-story` and `.feature-story--reverse` grid patterns |
| **Footer** | Dark navy surface with organized multi-column navigation | `#242531` dark surface with 4 columns + brand block |

---

## 2. Adaptations for Solar EPC Specifics

Instead of generic CRM copy, every section is populated with real solar domain realities:
1. **Solar Capacity & Topologies**: 3 kW, 5 kW, 10 kW, 50 kW On-Grid, Off-Grid with battery storage, and Hybrid.
2. **Indian Statutory Realities**: DISCOM consumer numbers (DHBVN, BSES), sanctioned loads, 13.8% composite Indian solar GST, PM Surya Ghar Muft Bijli Yojana subsidy tiers.
3. **Engineering Integrity**: Direct linking from approved surveys to string temperature calculations and automated 6-topology BOM compilation.
