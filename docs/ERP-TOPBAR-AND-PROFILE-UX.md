# SUNPOWEROS — ERP TOPBAR & USER PROFILE UX SPECIFICATION

## 1. Ergonomic Design Objectives
The SunPowerOS ERP topbar implements an Odoo Enterprise-grade header layout:
- Height: 58px fixed (`h-[58px]`)
- Background: `#714B67` (SunPower Plum)
- Z-Index: Layered safely at `z-40` to avoid colliding with page-level modals or overlapping page action buttons.
- App Navigation: 9-dot launcher providing quick grid access to all core modules.

---

## 2. Authenticated User Identity Spec
```
[Avatar/Initials] [User Full Name] ▾
[Role Display / Organization Context]
```

### Components:
1. **Avatar Circle**:
   - Renders custom profile image if configured in user profile.
   - Falls back to uppercase initial glyphs (`firstName[0] + lastName[0]`).
   - Renders neutral pulse placeholder while profile resolves.
2. **User Display Name**:
   - Derived directly from `ApiClient.getMe()`.
   - Formatted as `{firstName} {lastName}` with truncation on mobile.
3. **Role Context**:
   - Secondary role badge (`ORG_ADMIN`, `SOLAR_ENGINEER`, `PROCUREMENT_MANAGER`).
   - Active organization title with Row-Level Security badge.
4. **Dropdown Actions**:
   - My Profile (`/settings`)
   - Preferences & Security (`/settings/security`)
   - My Organization (`/settings/organizations`)
   - My Permissions (`/settings/roles`)
   - Customer Support Desk (`SupportTicketModal`)
   - Sign Out (revokes server session and clears tokens).
5. **Keyboard & Event Handling**:
   - Mouse click-outside listener.
   - Global `Escape` key handler to dismiss open menus.
