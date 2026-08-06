# QA Retest Report — Task Manager Backend

**Tester:** Emmanuel Adeniran
**Date:** August 6, 2026
**Scope:** Retest of previously reported auth issues + new IDOR (Insecure Direct Object Reference) testing on task endpoints
**Environment:** Local, Node.js, personal Supabase test project

---

## Summary

Following the recent commits (Zod validation, error handling improvements, Supabase client relocation, README, license), a retest was performed on the previously reported authentication issues, and a new round of authorization testing was carried out on the task endpoints to check for IDOR vulnerabilities. One prior fix is confirmed resolved, two remain open, and one new observation surfaced during testing. The IDOR test itself returned a positive result — no authorization bypass was found.

---

## 1. Retest of Previously Reported Issues

### 1.1 Missing `ErrorApp` import — ✅ Fixed
Requests with no `Authorization` header previously crashed the server with a `ReferenceError`. This is now resolved — the endpoint correctly returns a `401` with a clean JSON error body, and the server remains stable.

### 1.2 Incorrect status code on invalid/expired tokens — ❌ Still open
**Steps to reproduce:**
```
GET /tasks
Authorization: Bearer garbage.invalid.token
```
**Expected:** `401 Unauthorized`
**Actual:** `500 Internal Server Error`

**Root cause:** In `auth.middlewares.js`, the status code is passed as a second argument to `next()` instead of into the `ErrorApp` constructor:
```js
next(new ErrorApp('Invalid or expired access token.'), 500);
```
This is the same defect reported previously; only the status code value changed (401 → 500 in the arguments), the placement bug itself was not corrected. Compare to the correct usage earlier in the same file:
```js
return next(new ErrorApp("Unauthorized!", 401))
```

### 1.3 Incorrect status code on malformed auth header — 🆕 New finding, same root cause
**Steps to reproduce:**
```
GET /tasks
Authorization: Basic sometoken
```
**Expected:** `401 Unauthorized`
**Actual:** `500 Internal Server Error`

This branch is syntactically correct (status is inside the `ErrorApp` constructor), but the value itself is wrong:
```js
return next(new ErrorApp('Invalid or missing access token', 500))
```
Should be `401`, consistent with the other two auth failure branches in the same file.

**Recommendation:** All three failure branches in `authMiddleware` (missing header, malformed scheme, invalid/expired token) should consistently return `401`.

---

## 2. Route Prefix Change (`/user/*` → `/*`)

Registration and login previously lived under `/user/registration` and `/user/login`. In the current version, `userRouter` is mounted at `/` instead of `/user`, so the routes are now `/registration` and `/login` directly off the root.

Confirmed this is intentional. Noting the trade-offs for the record:

**Advantages:**
- Shorter, slightly cleaner URLs for auth-related actions
- Reasonable if auth is conceptually treated as separate from user resource management (e.g. future `/user/:id` profile routes wouldn't collide with `/user/login`)

**Disadvantages:**
- Breaks convention consistency — `/tasks` remains namespaced under its resource, while auth routes now sit at the root with no shared prefix (`/login`, `/registration`, `/logout`, `/refresh`), which reads less clearly as "these all belong to user/auth"
- Any existing API consumers (frontend, Postman collections, documentation) referencing the old `/user/...` paths will break silently with a generic `404`, with no deprecation warning or redirect
- Root-level routes are more likely to collide with future unrelated routes as the API grows (e.g. a future `/login` for a different purpose is now harder to avoid)

No action required if this is a deliberate design decision, flagging for awareness only.

---

## 3. IDOR Testing — Task Endpoints

**Objective:** Verify that a user cannot view, modify, or delete another user's tasks by referencing their resource ID directly.

**Method:** Two test users (A and B) were registered and authenticated. A task was created under User A. User B then attempted to update, complete, and delete that task using their own valid access token.

| Action attempted by User B on User A's task | Blocked? | Status returned |
|---|---|---|
| Update (`PATCH /tasks/:id`) | ✅ Yes | 500 |
| Mark complete (`PATCH /tasks/:id/complete`) | ✅ Yes | 500 |
| Delete (`DELETE /tasks/:id`) | ✅ Yes | 500 |

**Result: No IDOR vulnerability found.** Confirmed via a follow-up `GET /tasks` as User A that the task's name, description, and completion state were unchanged after all three attempts. The `.eq("userId", userId)` filter applied alongside `.eq("id", ...)` in every write query in `tasks.services.js` correctly scopes each operation to the requesting user. This is solid, security-conscious query design.

**Issue found: wrong status code on blocked actions.** All three blocked actions return a generic `500 Internal Server Error` rather than a `403 Forbidden` or `404 Not Found`. This happens because Supabase's `.single()` throws when zero rows match (as expected when the task doesn't belong to the requester), and that error is currently caught and rethrown as a generic 500 in each service function, rather than being distinguished from an actual server/database failure.

**Recommendation:** Distinguish "no matching row" (authorization failure) from genuine query errors, and return `404` (or `403`) in the former case. This also makes debugging easier going forward, since a real database outage would currently be indistinguishable from a normal "not your task" rejection.

---

## 4. Additional Findings (lower priority)

| # | Finding | Detail |
|---|---|---|
| 4.1 | `POST /tasks` returns `200` instead of `201` | `POST /registration` correctly returns `201 Created`; task creation should follow the same convention. |
| 4.2 | `PATCH /tasks/:id` requires all fields | `taskSchema` has no `.optional()` on `name`/`description`, so a partial update (e.g. description only) fails validation. This defeats the purpose of `PATCH`, which should allow partial updates. |
| 4.3 | Zod error message mismatch | `taskSchema`'s `description` field has `.max(500, 'Description must not exceed 1000 characters.')` — the limit (500) and the message text (1000) don't match. |
| 4.4 | Generic Zod error messages | Validation errors (e.g. `"Invalid input: expected string, received undefined"`) don't name the missing/invalid field, which slows down debugging for API consumers. |

---

## Overall Assessment

The core authentication and authorization logic is fundamentally sound — the IDOR test result in particular reflects careful, deliberate query design. The remaining issues are consistent and narrow in scope (status code correctness), which should be quick to address. Nice progress since the last pass.

Happy to retest once these are addressed, or to continue into deeper edge-case testing (expired refresh tokens, concurrent logins, password edge cases) in the meantime.
