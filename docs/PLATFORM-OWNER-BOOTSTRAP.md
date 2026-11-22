# SUNPOWEROS — PLATFORM OWNER SECURE BOOTSTRAP SPECIFICATION

## 1. Overview
The SunPowerOS Platform Admin Control Center (`http://localhost:3001`) manages multi-tenant organizations, global user directories, system health, and customer support. It requires a database-backed `PLATFORM_OWNER` account provisioned securely in PostgreSQL.

---

## 2. CLI Provisioning Command

```bash
pnpm --filter @solaros/api platform:bootstrap-owner
```
Or from the project root:
```bash
pnpm platform:bootstrap-owner
```

### Environment Configuration
| Variable | Description | Default |
|:---|:---|:---|
| `PLATFORM_BOOTSTRAP_EMAIL` | Owner email address | `superadmin@sunpowersolutions.in` |
| `PLATFORM_BOOTSTRAP_PASSWORD` | Secure initial password | `SunPowerOwner2026!#` |
| `PLATFORM_BOOTSTRAP_FIRST_NAME` | First Name | `Platform` |
| `PLATFORM_BOOTSTRAP_LAST_NAME` | Last Name | `Owner` |

---

## 3. Security Implementation
1. **Password Complexity**:
   - Minimum 10 characters.
   - Enforces uppercase, lowercase, numeric, and special character presence.
2. **Argon2id Hash Generation**:
   - Algorithm: Argon2id (`argon2.argon2id`)
   - Memory Cost: 19 MiB (`19456 KB`)
   - Time Cost: 2 iterations
   - Parallelism: 1 thread
3. **Database Entities**:
   - `User`: Created or updated with `isSuperAdmin = true`, `status = 'ACTIVE'`, `isActive = true`, `failedLoginAttempts = 0`.
   - `PlatformAdministrator`: Linked via `userId` with `role = 'PLATFORM_OWNER'`, `isActive = true`, `permissions = ['*']`.
4. **Immutable Audit Logging**:
   - Writes a record into PostgreSQL `platform_audit_events` with `action = 'BOOTSTRAP_PLATFORM_OWNER'`.
5. **Strict Idempotency**:
   - Running the script repeatedly safely upgrades existing accounts without throwing primary key conflicts.
