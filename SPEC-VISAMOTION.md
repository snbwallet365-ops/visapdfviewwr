# VisaMOTion — Product Specification

## Objective

Transform the current First Fly visa PDF dashboard into **VisaMOTion**, a secure, production-ready visa information platform with separate admin and user experiences.

Users sign in and can browse countries and view/preview available visa PDFs. Admins can manage the country catalog, PDF files, homepage card content, blog-style cards, branding content, and user/admin live chat. Dummy bundled PDFs must be removed; production documents must be managed through protected storage and a database catalog.

## Roles and permissions

### User

- Sign in with an email and password.
- Browse the VisaMOTion home page and country cards.
- Open a country and view available PDFs.
- Preview documents in-browser; download permission is a product decision to confirm before implementation.
- Use live chat with an admin.
- Cannot upload, edit, replace, delete, or reorder PDFs.
- Cannot change homepage cards, blog content, users, roles, or settings.

### Admin

- Sign in through the same secure authentication system with an admin role.
- Manage countries and country metadata.
- Upload, replace, edit metadata for, hide/show, reorder, and delete PDFs.
- Manage homepage country cards and blog-style cards.
- See user conversations and send live-chat replies.
- Manage supported document types and publication status.
- Review audit history for destructive content actions.

Authorization must be enforced in both the UI and Supabase Row Level Security/storage policies. A hidden button is not a security boundary.

## Authentication and security

- Use Supabase Auth with email/password sessions.
- Store passwords only through Supabase Auth; never hardcode, commit, log, or expose passwords in source code.
- The supplied credentials must be entered through the secure Auth/admin setup flow and should be rotated before production because they are weak for a public website.
- Add a role/profile table with `user` and `admin` roles. Admin role changes must be server/RLS-protected.
- Add protected routes for `/admin/*`; unauthenticated users go to `/login`, authenticated users without admin role go to `/forbidden`.
- Use RLS for catalog rows, blog cards, chat threads/messages, and storage objects.
- Add audit events for upload, replacement, metadata edit, publish/unpublish, and delete.

## Content model

Create Supabase migrations for:

- `profiles`: `id`, `email`, `display_name`, `role`, timestamps.
- `countries`: `id`, `slug`, `name`, `region`, `flag_path`, `cover_path`, `sort_order`, `is_published`, timestamps.
- `visa_documents`: `id`, `country_id`, `document_type`, `title`, `description`, `storage_path`, `mime_type`, `file_size`, `version`, `is_published`, `sort_order`, `uploaded_by`, timestamps.
- `homepage_cards`: `id`, `eyebrow`, `title`, `body`, `image_path`, `link_type`, `link_value`, `sort_order`, `is_published`, timestamps.
- `blog_posts`: `id`, `title`, `slug`, `excerpt`, `body`, `cover_path`, `status`, `published_at`, `author_id`, timestamps.
- `chat_threads`: `id`, `user_id`, `assigned_admin_id`, `status`, timestamps.
- `chat_messages`: `id`, `thread_id`, `sender_id`, `sender_role`, `body`, `read_at`, timestamps.
- `audit_events`: `id`, `actor_id`, `action`, `entity_type`, `entity_id`, `metadata`, timestamp.

Use a private `visa-documents` storage bucket and signed URLs for authenticated viewing. Do not rely on public `/public/docs` files for managed documents.

## Application surfaces

### Public/auth surfaces

- `/login`: branded VisaMOTion login.
- `/forgot-password` and password reset flow.
- `/`: authenticated user home/catalog; unauthenticated users are redirected to login.
- `/countries/:slug`: country detail and document list.
- `/documents/:id`: authenticated document preview.
- `/blog` and `/blog/:slug`: published blog cards/posts.
- `/chat`: user live-chat inbox.
- `/chat/:threadId`: user/admin conversation view.
- `/account`: profile, password change, sign out.

### Admin surfaces

- `/admin`: dashboard with country/document/blog/chat counts and recent activity.
- `/admin/countries`: country CRUD, publish state, ordering.
- `/admin/countries/:id`: country details and document management.
- `/admin/documents`: searchable document table with upload, replace, edit, publish/unpublish, and delete.
- `/admin/homepage`: hero and card management.
- `/admin/blog`: post/card CRUD and publishing workflow.
- `/admin/chat`: conversation list, assignment, unread state, replies.
- `/admin/audit`: audit history.
- `/admin/settings`: brand settings and supported document types.

## Branding and PWA

- Rename all visible product copy from First Fly to **VisaMOTion**.
- Create a distinctive wordmark combining `Visa` and `MOTion` with a clear typographic hierarchy; no generic default text logo.
- Define brand tokens for primary color, accent, navy, surfaces, success, warning, and danger.
- Replace favicon with a VisaMOTion mark and add Apple touch icon, maskable icon, and social preview metadata.
- Add `manifest.webmanifest`, service worker registration, install prompt handling, offline app shell, update notification, and an offline fallback page.
- Cache only safe static shell assets and published metadata. Do not cache private chat, profile, or signed document responses.
- Verify responsive behavior at mobile and desktop sizes, keyboard navigation, focus states, labels, and reduced-motion behavior.

## Live chat

- User starts a thread and sends messages.
- Admin sees unread threads, opens a thread, replies, marks read, and closes/reopens the thread.
- Use Supabase Realtime for new messages and unread counts.
- Enforce thread visibility in RLS: users see their own threads; admins see all assigned/authorized threads.
- Retain current AI chat only if explicitly desired; the first implementation should prioritize direct user-admin messaging.

## Commands and verification

- Install: `npm install`
- Development: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint` (existing repository currently has many pre-existing Prettier violations; do not claim lint is clean until fixed or scoped.)
- Verify: SQL migration review, RLS policy review, route protection checks, build, responsive browser checks, and manual admin/user acceptance flows.

## Boundaries

### Always do

- Enforce permissions in RLS and server-side operations.
- Validate file type, file size, filename, and metadata.
- Confirm destructive deletes and write audit events.
- Keep production secrets and passwords out of Git.
- Run build and targeted authentication/storage checks before deployment.

### Ask first

- Final admin email address(es) to seed as admin.
- Whether user document downloads are allowed or preview-only.
- Brand colors and final logo direction if the initial VisaMOTion proposal is not accepted.
- Whether the existing applicant-case workflow remains in the product or is removed from user navigation.

### Never do

- Never hardcode the supplied passwords.
- Never expose Supabase service-role keys in browser code.
- Never leave dummy PDFs discoverable after migration.
- Never treat client-side route hiding as authorization.
- Never deploy before admin/user/RLS tests pass.

## Success criteria

1. No dummy PDF files remain in the shipped frontend bundle.
2. User login works and a normal user can view published documents but cannot mutate catalog data.
3. Admin login works and an admin can upload, replace, edit metadata, publish/unpublish, reorder, and delete documents.
4. Unauthorized direct API/storage requests are rejected by RLS/policies.
5. Homepage cards and blog cards can be managed from the admin panel.
6. User-admin live chat sends and receives messages in real time.
7. VisaMOTion branding, favicon, manifest, install flow, and offline shell work on supported browsers.
8. Build and deployment complete only after the above checks pass.

## Open questions

- Confirm the admin email address(es) to seed; passwords will be entered securely and not stored in code.
- Confirm whether users may download PDFs or only preview them.
- Confirm whether `/cases` and the existing AI chat should remain accessible after the new catalog/chat architecture is added.

## Additional mobile and premium UX requirements

- The app must be installable on supported Android and iPhone browsers through the PWA install/Add to Home Screen flow, with a valid manifest, icons, standalone display mode, splash/theme colors, service worker, offline shell, and an in-app install/update prompt where the platform supports it.
- The main header and relevant admin/user navigation must remain fixed or sticky while scrolling, respect safe-area insets, and never cover content or form controls.
- The visual direction is premium and production-quality: consistent spacing, polished typography, purposeful motion, strong empty/loading/error states, high-contrast controls, responsive layouts, and separate refined user/admin shells rather than a generic dashboard.
- Mobile-first QA must cover 360px, 390px, 430px and desktop widths, including portrait orientation, keyboard focus, touch target sizing, offline launch, install state, and fixed-header scrolling.
