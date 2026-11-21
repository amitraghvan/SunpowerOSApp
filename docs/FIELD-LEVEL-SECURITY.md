# SolarOS ERP — Field-Level Security & Data Masking

## 1. Principles
SolarOS protects sensitive pricing, customer PII, and financial margin data from unauthorized viewing:
- **Product Margins & Base Costs**: Field technicians and basic sales reps can browse product hardware specs, but base supplier costs (`costPrice`, `minimumMarginPercent`) require `catalog:pricing:read` or `catalog:pricing:update`.
- **User Hashes & Secrets**: Passwords (`passwordHash`), 2FA secrets (`twoFactorSecret`), and recovery codes (`twoFactorRecoveryCodes`) are stripped from all API outputs via Prisma select projections and class-transformer `@Exclude()`.
- **Customer Financial Identifiers**: GSTIN, tax registration numbers, and bank details in customer accounts require `customer:customers:update` or `customer:360:read`.

## 2. DTO Whitelisting
NestJS `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` ensures client requests cannot inject unauthorized fields (e.g. attempting to promote account to `isSuperAdmin: true` or manually set `lockedUntil` during user registration).
