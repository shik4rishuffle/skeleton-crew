# Agent notes

- Read `README.md` first. This is a Next.js static export with TinaCMS visual editing on `@skeleton-crew/blocks`.
- Content is `content/pages/*.json`, `content/globals/site.json` and `content/portfolio/*.json`. The schema comes from `defineSiteConfig` in `tina/config.ts`; the opt-in block list is `site.blocks.ts`.
- Bespoke blocks live in `src/blocks/<name>/` with the library's shape. Templates import field helpers from `@skeleton-crew/blocks/fields`, never from `/schema` (server code loads them too).
- The look is tokens in `src/tokens.css` plus overrides in `src/app/globals.css`; the theirs/ours demo is `src/app/before.css`. Run `npm run test:before-mode` after adding a block.
- `legacy-static/` and `payload/` are the old stack, kept until the VPS Payload container is retired. Do not extend them.
- Never vertically align code. Use hyphens, not em dashes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
