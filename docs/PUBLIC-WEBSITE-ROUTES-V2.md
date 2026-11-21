# SunPowerOS — Public Website Routes & Navigation Specification (v2)

**Application:** Next.js 15 Web Application (`apps/web`)  
**Scope:** Marketing Portal, Public Navigation & Auth Onboarding  
**Status:** ALL ROUTES VERIFIED & PRERENDERED (43/43 Next.js Pages)  

---

## 1. Route Map

| Path | Purpose | Template | Navigation Elements |
| :--- | :--- | :--- | :--- |
| `/` | Master Marketing Landing Page | `apps/web/src/app/page.tsx` | Topbar, 15 refined sections, Footer |
| `/features` | Deep-Dive Platform Capabilities | `apps/web/src/app/features/page.tsx` | 3 Domain feature breakdowns, CTA |
| `/solutions` | Tailored Solar Use Cases | `apps/web/src/app/solutions/page.tsx` | Residential, C&I, and Multi-Branch cards |
| `/security` | Trust & Architecture Deep-Dive | `apps/web/src/app/security/page.tsx` | PostgreSQL RLS, Argon2id, RBAC, Audit |
| `/contact` | Sales & Office Inquiries | `apps/web/src/app/contact/page.tsx` | Inquiry form, HQ address, phone, email |
| `/login` | 2-Column Authenticated Login | `apps/web/src/app/(auth)/login/page.tsx` | Product highlights + credentials card |
| `/signup` | Self-Service Multi-Tenant Register | `apps/web/src/app/(auth)/signup/page.tsx` | 2-step organization & branch setup |

---

## 2. In-Page Anchor Jumps (with `scroll-mt-24` Offset)

The homepage includes anchor targets with sticky header clearance to prevent topbar occlusion:
- `#workflow`: Connected Process Timeline (Section 2)
- `#crm`: Solar Sales Pipeline & CRM Showcase (Section 3)
- `#customer-360`: Customer 360 Workspace (Section 6)
- `#survey`: Technical Site Surveys & Field Audits (Section 7)
- `#engineering`: Solar PV Sizing & Automated BOM (Section 8)
- `#quotations`: Dynamic GST & Commercial Quotations (Section 9)
- `#ecosystem`: Consolidated 18-App Application Ecosystem (Section 12)
- `#security`: Enterprise Security & PostgreSQL RLS (Section 14)

---

## 3. Navigation Audit Summary

- Dead links (`href="#"`): **0 remaining**. All links connect to active routes or valid anchor targets.
- Responsive mobile drawer: Fully integrated with hamburger toggle and instant route switching.
- Auth routing: Seamless handoff from `/signup` to `/dashboard`, and `/login` to `/dashboard`.
