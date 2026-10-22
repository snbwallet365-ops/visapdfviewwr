# VisaMOTion Task List

- [ ] Confirm admin email(s), preview/download policy, and existing cases/AI-chat fate.
  - Acceptance: decisions are recorded in `SPEC-VISAMOTION.md`.
  - Verify: inspect the approved scope before coding.

- [ ] Add role-aware Supabase auth and RLS.
  - Acceptance: user/admin sessions are distinct; unauthorized table and storage writes fail.
  - Verify: authenticated user/admin and direct API policy checks.

- [ ] Remove bundled dummy PDFs and add database-backed document catalog.
  - Acceptance: no dummy PDF ships; users see published records only.
  - Verify: bundle/public asset scan and user browser flow.

- [ ] Build admin document/country CRUD.
  - Acceptance: upload, replace, edit, publish/unpublish, reorder, and delete work with audit entries.
  - Verify: admin browser flow plus storage/database inspection.

- [ ] Build VisaMOTion branding, homepage cards, blog cards, favicon, and metadata.
  - Acceptance: brand is consistent and card/blog content is admin-editable.
  - Verify: responsive visual review and metadata inspection.

- [ ] Build direct user-admin live chat.
  - Acceptance: realtime user/admin messages, read state, assignment, and close/reopen work.
  - Verify: two-session browser test and RLS isolation test.

- [ ] Build installable PWA.
  - Acceptance: manifest, icons, service worker, offline shell, and update flow work without caching private data.
  - Verify: browser PWA audit and offline reload.

- [ ] Deploy permanently.
  - Acceptance: production URL serves the reviewed build and all auth/storage/chat checks pass.
  - Verify: production smoke test before sharing the URL.

- [ ] Complete premium mobile/PWA polish.
  - Acceptance: Android/iPhone-compatible browsers offer install/Add to Home Screen, standalone mode opens correctly, offline shell works, and fixed headers remain usable at mobile and desktop widths.
  - Verify: install/launch/offline checks at 360px, 390px, 430px and desktop viewports.
