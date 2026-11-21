# SunPowerOS Public Component Library

## 1. Overview & Directory Structure

All public marketing components are organized under `apps/web/src/components/marketing/`:

```
apps/web/src/components/marketing/
├── sunpower-logo.tsx             (Geometric solar symbol + SunPowerOS wordmark)
├── accents.tsx                   (Hand-drawn SVG accents: underline, circle, sketch arrow, spark)
├── marketing-navbar.tsx          (Sticky blur navbar, dropdowns, Sign In & Start Free CTAs)
├── hero-section.tsx              (Master hero, handwritten heading, browser CRM preview)
├── workflow-section.tsx          (8-step horizontal solar lifecycle journey)
├── crm-showcase-section.tsx      (Odoo CRM-inspired Kanban showcase with kW tags)
├── activity-flow-section.tsx     (Connected 4-activity timeline with SVG arrows)
├── communication-section.tsx     (Email, Phone, WhatsApp, and SMS channels)
├── customer-showcase-section.tsx (Customer 360 multi-site rooftop workspace preview)
├── survey-showcase-section.tsx   (Technical site survey audit with MinIO photo gallery)
├── engineering-showcase-section.tsx (Solar electrical design, 5-point check, BOM categories)
├── quotation-showcase-section.tsx(13.8% Indian composite GST proposal preview)
├── contracts-showcase-section.tsx(4-milestone schedule & 4-gate sales order prerequisites)
├── reporting-section.tsx         (Operational analytics cards with sample labels)
├── feature-grid-section.tsx      (9 editorial feature cards over #F4F4F6 surface)
├── ecosystem-section.tsx         (Unified application grid mapped to capability registry)
├── security-section.tsx          (Argon2id, RBAC, and PostgreSQL RLS trust cards)
├── final-cta-section.tsx         (Minimal, emotional final CTA with Start Free button)
└── marketing-footer.tsx          (Dark navy #242531 footer with links and copyright)
```

---

## 2. Component Interfaces & Visual Tokens

- **Brand Plum Actions**: All primary interactive buttons use `.btn-primary` with `--sp-brand-plum: #714B67` and `--sp-shadow-button`.
- **Product Window Frame**: Reusable `.product-window` with toolbar, macOS-style dots, URL bar, interior body, and descriptive footer caption.
- **Editorial Accents**: Lightweight inline SVG components that render crisp hand-drawn annotations across any resolution without heavy image assets.
