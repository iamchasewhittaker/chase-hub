<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent skills

Configured by [`/setup-matt-pocock-skills`](https://github.com/mattpocock/skills) on 2026-05-21. Read by `/diagnose`, `/tdd`, `/to-issues`, `/to-prd`, `/triage`, `/grill-with-docs`, `/improve-codebase-architecture`, `/zoom-out`.

### Issue tracker

GitHub Issues on `iamchasewhittaker/chase-hub`. See [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).

### Triage labels

Default 5-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).

### Domain docs

Single-context. `CONTEXT.md` and `docs/adr/` will be created lazily by `/grill-with-docs` as terms and decisions get resolved. See [`docs/agents/domain.md`](docs/agents/domain.md).
