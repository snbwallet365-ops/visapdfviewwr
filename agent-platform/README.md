# VisaHOBe Agent — AI workspace

Live: https://visahobe-agent-app.pages.bu.app/ · access code `666085`

Single-file installable web app (PWA). Dashboard-first, with two independent flows.

## Modules (sidebar)

Chat · Agent · Files · Documents · Tasks · Reports · Social Media · Settings (plus Dashboard)

## Chat

Conversation only. Fast replies, no execution. Answers always use:
Answer · Key Points · Suggestions · Next Steps.

## Agent

Task → Analyze → Preview → Approve → Execute → Results.

- **Analyze** builds the plan and drafts the output — nothing runs yet.
- **Live preview** has four tabs: Plan, Output, Files, Actions.
- **Approve & run** is the only thing that executes.
- **Results** renders the final output and logs the run to Tasks and the dashboard.

## Dashboard cards

Tasks · Agent Runs · Files · Documents · Reports · Social Media

## Runtime

- Gemini API (model key entered in the app, stored in the browser only)
- Browser Use (optional key for real cloud browser sessions)
- Playwright (browser-side execution engine)
- Local engine fallback with identical response formats

## Files

`index.html` · `manifest.json` · `sw.js` · `icon-512.png`

Upload all files to the root of any static host, then install from the browser menu
(Android/desktop) or Share → Add to Home Screen (iOS).
