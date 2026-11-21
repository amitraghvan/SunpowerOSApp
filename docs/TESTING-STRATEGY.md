# SOLAROS ERP — TESTING STRATEGY SPECIFICATION

---

## 1. Testing Pyramid

```text
       /\
      /  \      E2E Tests (Playwright) - Critical user journeys
     /----\
    /      \    Integration Tests (Supertest) - API endpoints & RLS
   /--------\
  /          \  Unit Tests (Jest) - Business domain logic & algorithms
 /------------\
```

---

## 2. Test Execution Commands

```bash
# Unit & Integration Tests across all workspaces
pnpm test

# Type Checking
pnpm check-types

# Playwright Browser E2E Tests
pnpm test:e2e

# k6 Performance & Load Verification
k6 run tests/performance/k6-health-load.js
```
