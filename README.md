# recursive-coding-agents

Talk and website for **Recursive Coding Agents** — Raymond Weitekamp (OpenProse),
AI Engineer World's Fair 2026.

## Layout

```
recursive-coding-agents/
├── web/                       SvelteKit deck + website (the slides are the site)
├── rlm-rubric/                the RLM yardstick: definition + 7 gates + judging method
├── claude-dynamic-workflows/  Claude Code .workflow.js — RLM vs not-RLM (+ a proven run)
└── openprose/                 OpenProse .prose.md — RLM vs not-RLM
```

The deck under `web/` is a real, server-rendered, mobile-responsive website that
also works as a full-screen presentation.

## Instructional materials (standalone of `web/`)

Three sibling folders are a self-contained teaching set for **Recursive Language
Models (RLMs)** — what counts as one, and what doesn't. They stand alone; the deck
may link to them later.

- **[`rlm-rubric/`](rlm-rubric/)** — the yardstick: the RLM definition and seven hard gates (G1–G7), plus the judging methodology.
- **[`claude-dynamic-workflows/`](claude-dynamic-workflows/)** — Claude Code `*.workflow.js` sorted into `rlm/` and `not-rlm/`, plus a `proven-run/` we executed end-to-end.
- **[`openprose/`](openprose/)** — OpenProse `*.prose.md` sorted into `rlm/` and `not-rlm/`.

In every example folder, **the subfolder name is the verdict**: `rlm/` passes all
seven gates; `not-rlm/` holds nearby shapes that each fail one — calibration, so a
judge can't pass everything merely for having tools, subagents, loops, or code.

## Develop

```bash
cd web
bun install
bun run dev          # http://localhost:5173
```

## Build & deploy (Cloudflare)

The site builds to a Cloudflare Worker with static assets via
[`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare).
Build output and the asset binding are configured in `web/wrangler.jsonc`.

```bash
cd web
bun run build        # emits web/.svelte-kit/cloudflare/
bun run deploy:dry   # build + `wrangler deploy --dry-run` (no upload)
bun run deploy       # build + `wrangler deploy`
bun run cf:dev       # build + `wrangler dev` (local Workers runtime)
```

For Cloudflare's Git-connected builds, set the project **root directory** to
`web/`, build command `bun run build`, and let Wrangler pick up `wrangler.jsonc`.

See `web/README.md` for slide authoring, theming, and the full app docs.
