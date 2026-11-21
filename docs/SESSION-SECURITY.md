# SolarOS ERP — Session Security & Management

## 1. Threat Model & Design Goals
SolarOS session management is designed to protect against:
- **Session Hijacking**: Raw tokens are never stored in plaintext in the database.
- **XSS-based Token Theft**: Session cookies use `HttpOnly`, preventing script access.
- **CSRF Attacks**: Session cookies enforce `SameSite=Lax`.
- **Database Compromise**: If an unauthorized dump of the database occurs, attackers obtain only SHA-256 hashes of session tokens, making impersonation mathematically infeasible.

## 2. Session Token Specifications
- **Entropy**: Generated using `crypto.randomBytes(32)` (256 bits of CSPRNG entropy).
- **Transport**:
  - Primary: Cookie `solaros_session; Path=/; HttpOnly; SameSite=Lax; MaxAge=...`
  - Secondary: `Authorization: Bearer <64-char-hex-token>` for headless scripts and automated tests.
- **Database Storage**:
  - `sessions.tokenHash`: `crypto.createHash('sha256').update(rawToken).digest('hex')` (Indexed for $O(1)$ constant-time lookup).
  - Expiration: 24 hours standard; 30 days if "Remember me" is checked.

## 3. Revocation & Concurrency Control
- **Single Session Invalidation**: `DELETE /api/v1/sessions/:id` sets `revokedAt = now()`.
- **Global Invalidation ("Sign out everywhere else")**: `DELETE /api/v1/sessions` sets `revokedAt = now()` on all active sessions belonging to the user except the calling session ID.
- **Security Event Revocation**: Changing password or email automatically revokes all existing sessions.
