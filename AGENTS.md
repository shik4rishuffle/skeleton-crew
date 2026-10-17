# Agent notes

- Read `README.md` first. This is a Next.js static export with TinaCMS visual editing on `@skeleton-crew/blocks`.
- Content is `content/pages/*.json`, `content/globals/site.json` and `content/portfolio/*.json`. The schema comes from `defineSiteConfig` in `tina/config.ts`; the opt-in block list is `site.blocks.ts`.
- Bespoke blocks live in `src/blocks/<name>/` with the library's shape. Templates import field helpers from `@skeleton-crew/blocks/fields`, never from `/schema` (server code loads them too).
- The look is tokens in `src/tokens.css` plus overrides in `src/app/globals.css`; the theirs/ours demo is `src/app/before.css`. Run `npm run test:before-mode` after adding a block.
- `legacy-static/` and `payload/` are the old stack, kept until the VPS Payload container is retired. Do not extend them.
- Never vertically align code. Use hyphens, not em dashes.
