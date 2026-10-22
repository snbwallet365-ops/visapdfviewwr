# VisaMOTion Implementation Plan

## Phase 0 — Confirm scope and protect credentials

- Confirm admin email address(es), download policy, and whether existing `/cases` remains.
- Do not store the supplied passwords in source, Git, deployment configuration, or chat logs. Create/rotate them through Supabase Auth.
- Confirm the initial wordmark direction and brand palette; default proposal: dark navy base, electric violet/blue motion accent, high-contrast white surfaces.

## Phase 1 — Data and authorization foundation

- Add Supabase migrations for profiles/roles, countries, visa_documents, homepage_cards, blog_posts, chat threads/messages, and audit events.
- Add `is_admin()` helper policy function and RLS policies.
- Create private storage buckets/policies for managed PDF and image assets.
- Add typed client helpers for role lookup, signed document URLs, catalog queries, admin mutations, and audit writes.
- Seed countries and document types without seeding dummy PDF binaries.

Acceptance: a normal user can read only published catalog rows; an admin can mutate; direct unauthorized table/storage mutations fail.

## Phase 2 — Authentication and route guards

- Replace the current generic authenticated wrapper with role-aware guards.
- Add login, password reset, password change, sign out, forbidden, account, and admin layout routes.
- Add a safe admin bootstrap path that requires a known admin email and a secure one-time setup action; no client-side role escalation.
- Add visible user/admin identity and role-aware navigation.

Acceptance: user and admin sessions route correctly; a user cannot open `/admin` or invoke admin mutations.

## Phase 3 — Real catalog and document management

- Remove bundled dummy PDFs from `public/docs`.
- Replace static `visa-data.ts` document URLs with database-backed countries and documents.
- Build user country list, country detail, PDF preview, and permitted download behavior.
- Build admin country/document tables with search, filters, upload, replace, metadata edit, publish/unpublish, reorder, and delete confirmation.
- Implement file validation, signed URLs, orphan cleanup, and audit events.

Acceptance: admin CRUD works end-to-end; users see only published documents; deleted/unpublished documents disappear from user views and old signed links expire.

## Phase 4 — VisaMOTion visual system and homepage CMS

- Rename all visible copy, metadata, chat greetings, and document references to VisaMOTion.
- Build wordmark, logo mark, color/type tokens, favicon, Apple touch icon, OG image, and branded auth/admin shells.
- Replace hardcoded hero/card copy with homepage_cards content managed from `/admin/homepage`.
- Add `/blog` and `/blog/:slug`, plus admin blog CRUD with draft/published status, cover image upload, excerpt, body, ordering, and preview.

Acceptance: a non-developer admin can change homepage cards and publish a blog post without a code change.

## Phase 5 — User/admin live chat

- Define thread/message schema and RLS.
- Add user inbox/thread screens and admin inbox/thread screens.
- Add Realtime subscriptions, unread counts, assignment, read state, close/reopen, and optimistic message sending.
- Keep AI chat separate or remove it from navigation based on the confirmed scope.

Acceptance: a user and admin can exchange messages in real time; users cannot read another user's thread.

## Phase 6 — PWA and quality hardening

- Add manifest, service worker, install prompt, offline fallback, icons, update notification, and safe caching rules.
- Add accessibility labels, keyboard/focus behavior, responsive breakpoints, reduced motion, and error/loading/empty states.
- Run build, targeted lint/format on changed files, RLS tests, storage tests, and browser acceptance flows.
- Remove all placeholder/dummy assets and verify no sensitive values are tracked.

Acceptance: installable PWA shell works offline, private data is not cached, and all role/security acceptance flows pass.

## Phase 7 — Permanent deployment

- Commit only reviewed source/migrations/assets.
- Push to production branch after remote-main reconciliation.
- Configure production Supabase environment variables through the deployment provider's secret manager.
- Deploy to a permanent hosting project and verify production auth, storage, chat, PWA, and document preview.
- Attach a custom domain only after the first production deployment is healthy.

## Delivery gates

1. Scope confirmation and admin email received.
2. RLS/security review passed.
3. User/admin flows passed.
4. PWA and branding passed.
5. Production build passed.
6. Permanent deployment verified.

## Phase 4.5 — Premium mobile product polish

- Implement a complete installable PWA experience for Android and iPhone-compatible browsers: manifest, maskable/app icons, standalone mode, theme/splash colors, service worker, offline shell, install prompt, and update prompt.
- Replace ad-hoc page headers with a shared fixed/sticky responsive shell. The header must preserve safe-area spacing, remain usable while scrolling, and provide role-aware navigation for users and admins.
- Apply the VisaMOTion premium design system across user and admin surfaces: refined type scale, logo lockup, elevated cards, subtle motion, polished loading/error/empty states, consistent buttons, and accessible focus/contrast.
- Validate the experience at 360px, 390px, 430px and desktop widths, including touch interactions and installed standalone mode.

Acceptance: a user can install VisaMOTion to a phone home screen, reopen it as an app-like experience, navigate with the fixed header, and use all primary flows without layout overlap or broken offline shell.
