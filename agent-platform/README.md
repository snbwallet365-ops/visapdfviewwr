# VisaHOBe Agent — AI platform

Live: https://visahobe-agent-app.pages.bu.app/ · access code `666085`

A single-file, installable web app (PWA): dashboard-first, with two independent flows.

## Flows

| | Chat | Agent |
|---|---|---|
| Purpose | Conversation only | Execution: browser, automation, workflows |
| Input | Composer at the bottom of the chat | Task box + fixed prompt dock |
| Output | Answer · Key Points · Suggestions · Next Steps | Preview panel + logged run |

### Agent flow (6 stages)

1. **Analyze task** — intent, skills, runtime
2. **Execution plan** — ordered steps
3. **Live progress** — step-by-step console
4. **Preview results** — output rendered before delivery
5. **Approve & run** — sign-off (runs straight through by default)
6. **Final output** — delivered, saved to Preview, logged to Tasks/Runs

Every run renders automatically — no confirmation needed. The preview panel is always on,
with a fixed prompt box underneath on mobile so a task can be started from anywhere.

## Sidebar modules

Dashboard · Chat · Agent · Browser · Files · Documents · Reports · Email · Social Media ·
CRM · Knowledge Base · Research · Workflows · Tasks · Analytics · Settings

## Built-in skills

Research · Content Writing · SEO · Recruitment · Visa Operations · CRM · Reporting ·
PDF Generator · Data Analysis · Project Management · Automation

## Execution status

`pending` → `running` → `reviewing` → `completed` / `failed`

## Live validation

Self-check · Output review · Error detection · Preview · Link validation — visible per run.

## Runtime

- **Gemini API** — model key entered in the app (Settings → Connect), stored in the browser only
- **Browser Use** — optional key for real cloud browser sessions
- **Playwright** — browser-side execution engine for the agent worker
- **Local engine** — offline fallback with the same response formats

## Files

- `index.html` — the whole app
- `manifest.json` — PWA manifest
- `sw.js` — network-first service worker
- `icon-512.png` — app icon

Upload all files to the root of any static host, then install from the browser menu
(Android/desktop) or Share → Add to Home Screen (iOS).
