# SolarOS ERP — Authentication Architecture

## 1. Overview
SolarOS ERP employs stateful server-side sessions paired with secure client transports (HttpOnly cookies with fallback to Bearer authorization headers).

## 2. Authentication Lifecycle
```mermaid
sequenceDiagram
    participant Client as Web Browser / API Client
    participant Auth as AuthController / AuthService
    participant DB as PostgreSQL (solaros_dev)

    Client->>Auth: POST /api/v1/auth/login (email, password, orgSlug)
    Auth->>DB: Query user by email (include memberships, roles)
    Auth->>Auth: Verify Argon2id password hash
    alt Password Invalid
        Auth->>DB: Increment failedLoginAttempts
        alt attempts >= 5
            Auth->>DB: Set lockedUntil = now() + 15 min
            Auth-->>Client: 403 Account Locked
        else
            Auth-->>Client: 401 Invalid Credentials
        end
    else Password Valid
        Auth->>DB: Reset failedLoginAttempts = 0, update lastLoginAt
        Auth->>Auth: Generate 32-byte crypto random token
        Auth->>DB: Store session (tokenHash = SHA256(token), expiresAt)
        Auth-->>Client: Set-Cookie: solaros_session (HttpOnly, Lax) + 200 OK (AuthResponseDto)
    end
```

## 3. Account Protection Rules
- **Argon2id Hashing**: High computational and memory resistance against GPU/ASIC cracking.
- **Account Lockout**: 5 failed consecutive attempts triggers an automatic 15-minute lock.
- **Password Recovery**: Single-use, time-limited (1 hour) reset tokens stored as SHA-256 hashes. Password reset terminates all active user sessions across all devices immediately.
- **Logout**: Explicit session record revocation in PostgreSQL and immediate cookie clearance.
