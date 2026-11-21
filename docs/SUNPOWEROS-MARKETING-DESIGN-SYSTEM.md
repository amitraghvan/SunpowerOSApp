# SunPowerOS Marketing Design System

## 1. Design Tokens Specification

Implemented in `apps/web/src/styles/marketing.css` and imported globally:

```css
:root {
  /* Brand Palette */
  --sp-brand-plum: #714B67;
  --sp-brand-plum-hover: #624159;
  --sp-brand-plum-soft: #F1EAF0;

  /* Editorial Accents */
  --sp-accent-coral: #FF747C;
  --sp-accent-teal: #06C6AE;
  --sp-accent-amber: #FFB32C;
  --sp-accent-sky: #36B9F6;

  /* Text & Surfaces */
  --sp-ink: #151A2B;
  --sp-text-primary: #202536;
  --sp-text-body: #475065;
  --sp-text-muted: #737B8B;
  --sp-text-inverse: #FFFFFF;

  --sp-page: #FFFFFF;
  --sp-surface: #FFFFFF;
  --sp-surface-soft: #F4F4F6;
  --sp-surface-muted: #F8F8FA;
  --sp-surface-dark: #242531;

  /* Borders & Shadows */
  --sp-border: #E4E5E9;
  --sp-border-strong: #D7D9E0;
  --sp-shadow-card: 0 8px 28px rgba(21, 26, 43, 0.055);
  --sp-shadow-product: 0 24px 70px rgba(21, 26, 43, 0.10);
  --sp-shadow-button: 0 4px 12px rgba(113, 75, 103, 0.18);

  /* Typography */
  --sp-font-display: "Caveat", cursive, sans-serif;
  --sp-font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --sp-text-hero: clamp(3.2rem, 6.5vw, 5.5rem);
  --sp-text-section: clamp(2.8rem, 5vw, 4.25rem);
}
```

---

## 2. Color Balance Rules

- **80% White & Soft Neutral Surfaces**: Keeps the page clean, readable, and open without heavy saturated background fills.
- **15% Dark Typography & Plum**: High contrast `#151A2B` for headings, `#475065` for body text, and plum `#714B67` for primary interactive elements.
- **5% Hand-Drawn Expressive Accents**: Coral (`#FF747C`), Teal (`#06C6AE`), and Amber (`#FFB32C`) used strictly on selected words, underlines, sketch arrows, and sparks.

---

## 3. Typography Hierarchy

1. **Display Headings (`font-display`)**:
   - Uses `Caveat` Google Font with `Inter` / system fallbacks.
   - Tight line-height (0.98–1.08) for dramatic editorial presence.
2. **Body & UI Controls (`font-body`)**:
   - Clean sans-serif `Inter` with 1.6–1.75 line height for maximum legibility.
   - Never use handwritten display font for paragraph copy or table data.
