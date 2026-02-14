# Test Coverage Analysis — CoproPilot

## Current State

### Infrastructure

The project has **Vitest** configured for both workspaces with the appropriate testing libraries installed:

| | Backend | Frontend |
|---|---|---|
| **Runner** | Vitest 4.0.18 (Node) | Vitest 4.0.18 (jsdom) |
| **HTTP testing** | Supertest 7.2.2 | — |
| **Component testing** | — | @testing-library/react 16.3.2 |
| **DOM matchers** | — | @testing-library/jest-dom 6.9.1 |
| **Coverage** | Not configured | Not configured |

### Existing Tests

Only **2 smoke test files** exist, created in a single commit (`3d9516e`):

- `apps/backend/tests/smoke.test.js` — 7 tests covering health endpoints, 404 handling, auth protection on a sample of routes, JSON parsing, and CORS headers.
- `apps/frontend/tests/smoke.test.tsx` — 5 tests covering module imports, Login page rendering, auth store initial state, and QueryClient setup.

### CI Pipeline Gap

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs linting, type-checking, and builds, but **does not run tests**. This means the existing smoke tests are never validated in CI.

---

## Codebase Inventory (untested)

| Layer | Backend | Frontend |
|---|---|---|
| Controllers / Pages | 37 controllers | 25 pages |
| Services / Hooks | 40 services | 37 hooks |
| Models / API calls | 36 models | 38 API modules |
| Middleware / Stores | 4 middleware | 2 stores |
| Routes / Components | 39 route files | 61 components |
| Utils / Lib | 1 utility | 4 utilities |

**None of these have any unit or integration tests beyond the smoke tests.**

---

## Recommended Improvements

### 1. Add a test step to CI (quick win)

The CI pipeline does not execute tests. Adding a single step is the highest-impact, lowest-effort improvement.

```yaml
# In .github/workflows/ci.yml, after the lint steps:
- name: Test backend
  run: npm test --workspace=@copro-pilot/backend

- name: Test frontend
  run: npm test --workspace=copro-pilot-frontend
```

### 2. Configure coverage tracking

Neither workspace has coverage thresholds or reporting. Add Vitest coverage configuration to both `vitest.config` files using `@vitest/coverage-v8`, and set minimum thresholds to prevent regression as tests are added.

### 3. Backend — Middleware tests (high priority)

The 4 middleware files handle authentication, error formatting, request logging, and input validation. They are critical to every request and are easily testable in isolation.

**What to test:**

- **`auth.js`** — `requireAuth()` returns 401 when no session exists; `requireAdmin()` returns 403 for non-admin users; valid sessions attach `req.user`.
- **`errorHandler.js`** — Maps `ValidationError` to 400, `UnauthorizedError` to 401, `NotFoundError` to 404; masks error details in production mode.
- **`validation.js`** — `validateJSON` rejects non-JSON Content-Type on POST/PUT/PATCH; `validateIdParam` rejects non-integer and negative IDs.
- **`requestLogger.js`** — Redacts sensitive fields (`password`, `token`, `secret`) from logged request bodies.

**Approach:** Mock `req`/`res`/`next` objects. Mock Better Auth for auth middleware. These tests need no database.

### 4. Backend — Service layer tests (high priority)

The 40 services contain the business logic. Most are thin CRUD wrappers, but several have meaningful logic worth testing:

**High-value targets:**

- **`ExportService.js`** — Orchestrates multi-table data queries and passes results to PDF/Excel generation. Test the data assembly logic with mocked models.
- **`CoproprieteService.js`** — Enriches copropriete objects with statistics (lot count, tantieme totals, co-owner count). Test enrichment logic.
- **`PvGenerationService.js`** — Generates meeting minutes. Test document assembly.
- **`ExportPdfService.js` / `ExportExcelService.js`** — Test that they produce valid output for given input data.

**Approach:** Mock the model layer (Knex calls). Test data transformations, error handling, and business rules.

### 5. Backend — Model integration tests (medium priority)

The 36 models are Knex query builders. Unit-testing query construction has limited value, but integration tests against a real (test) database would catch schema mismatches, broken JOINs, and aggregation errors.

**High-value targets:**

- **`CoproprieteModel.getStats()`** — Uses COUNT, SUM, COUNT DISTINCT across multiple queries.
- **`LotModel`** — Uses LEFT JOIN to pull co-owner names.
- Any model with filtering, sorting, or pagination logic.

**Approach:** Use a dedicated test database (PostgreSQL in Docker or via `compose.local.yml`). Run migrations before tests, seed minimal data, clean up after.

### 6. Frontend — Auth store tests (high priority)

`authStore.ts` (202 lines) is the most complex frontend module. It manages sign-in/sign-up flows, token validation, user data transformation (name parsing), localStorage persistence, and error recovery.

**What to test:**

- Initial state is unauthenticated (partially covered by smoke test).
- `signIn()` / `signUp()` call the auth client and update state on success.
- `signIn()` / `signUp()` handle API errors and set error state.
- `logout()` clears user, token, and localStorage.
- `validateToken()` recovers from invalid sessions.
- `initializeAuth()` restores state from localStorage.
- User transformation logic (name parsing from email, role mapping).

**Approach:** Mock `authClient` methods. Test state transitions with `useAuthStore.getState()`.

### 7. Frontend — API base module tests (medium priority)

`api.ts` (69 lines) is the generic fetch wrapper used by all 37 domain API modules. Testing it once covers all API calls.

**What to test:**

- GET/POST/PUT/DELETE methods set correct HTTP method and headers.
- Query parameters are serialized correctly.
- Credentials are included (`credentials: 'include'`).
- Non-OK responses throw with structured error info.
- Response JSON is parsed and returned.

**Approach:** Mock `fetch` globally. Verify request construction and response handling.

### 8. Frontend — Form validation schemas (medium priority)

The 41 form dialog components use React Hook Form + Zod for validation. The Zod schemas encode business rules (required fields, string lengths, email formats, number ranges) and can be tested in isolation without rendering components.

**What to test:**

- Required fields reject empty input.
- Email/phone fields validate format.
- Numeric fields (tantiemes, amounts) reject negative values or enforce ranges.
- Optional fields accept undefined/null.

**Approach:** Import the Zod schema from each component and call `.safeParse()` with valid and invalid data. No rendering needed.

### 9. Frontend — Custom hooks tests (lower priority)

The 37 hooks follow a uniform pattern (React Query wrappers). Testing one or two representative hooks validates the pattern for all.

**What to test:**

- Query hooks use correct query keys and API calls.
- `enabled` conditionals prevent queries when ID is missing.
- Mutation hooks invalidate the correct cache entries on success.

**Approach:** Use `@testing-library/react` with `renderHook`, wrap in `QueryClientProvider`, mock the API layer.

### 10. Frontend — Page-level integration tests (lower priority)

Pages orchestrate hooks, components, and navigation. Full page tests are slower to write but catch integration bugs.

**Recommended starting points:**

- **`LoginPage`** — Test form submission, error display, redirect on success (partially covered).
- **`CoproprietesPage`** — Test list rendering, search/filter, create/edit/delete flows.
- **`Dashboard`** — Test data loading and widget rendering.

**Approach:** Mock the API layer (MSW or mocked fetch), render pages with router and query providers, test user interactions.

---

## Prioritized Roadmap

| Priority | Area | Estimated Tests | Impact |
|---|---|---|---|
| **P0** | Add test step to CI | 0 (config only) | Prevents merging broken tests |
| **P0** | Configure coverage reporting | 0 (config only) | Visibility into coverage gaps |
| **P1** | Backend middleware tests | ~15-20 tests | Validates auth, errors, validation on every request |
| **P1** | Frontend auth store tests | ~10-12 tests | Validates auth flows, the most complex frontend module |
| **P2** | Backend service tests (complex services) | ~20-30 tests | Validates business logic in exports, enrichment, generation |
| **P2** | Frontend API base module tests | ~8-10 tests | Validates all API communication in one place |
| **P2** | Frontend Zod schema tests | ~40-50 tests | Validates form business rules without UI rendering |
| **P3** | Backend model integration tests | ~15-20 tests | Catches schema/query bugs (requires test DB) |
| **P3** | Frontend hook tests (representative) | ~5-8 tests | Validates React Query patterns |
| **P4** | Frontend page integration tests | ~10-15 tests | End-to-end flow validation |

---

## Missing Testing Libraries

The current setup may benefit from:

- **`@vitest/coverage-v8`** — Coverage provider for both workspaces.
- **`msw` (Mock Service Worker)** — For intercepting fetch calls in frontend tests instead of manually mocking fetch. Provides more realistic API mocking.
- **`@faker-js/faker`** — For generating test data (names, emails, addresses) in both workspaces.

---

## Summary

The project has solid test infrastructure (Vitest, Testing Library, Supertest) but virtually no test coverage beyond basic smoke tests. The CI pipeline does not run tests at all.

The highest-impact improvements are:
1. **Enable tests in CI** — zero-effort safeguard.
2. **Test backend middleware** — small surface area, high criticality.
3. **Test the auth store** — most complex frontend module, handles all authentication flows.
4. **Test Zod validation schemas** — large number of business rules testable without UI rendering.
