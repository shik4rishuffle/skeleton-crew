# Architect Recommendation: Ghost CMS Seeding in Deployment Workflow

## 1. Where Seeding Should Happen

**After deploy, as an automatic post-deploy step.**

The `skeleton deploy [client-slug]` command deploys static files to Nginx. Ghost CMS is a separate container that must already be running before seeding can happen. The sequence should be:

1. `skeleton deploy [client-slug]` - deploys static frontend (existing behaviour, unchanged)
2. Seed script runs automatically as a post-deploy hook
3. Fallback JSON regeneration runs (existing `scripts/regenerate-fallback.js`)

The seed step should be triggered by deploy, not bundled into it. If the deploy command supports post-deploy hooks or a `--seed` flag, use that. Otherwise, wrap the sequence in a thin shell script (e.g. `scripts/deploy-with-seed.sh`) that calls deploy then seeds.

Seeding must not block or gate the deploy itself - if seeding fails, the static site is still live with fallback content. Log the failure loudly but don't roll back the deploy.

## 2. Parameterisation for Different Clients

The current script has two problems: hardcoded API credentials and hardcoded Skeleton Crew content. These need to be separated differently.

**API credentials** - read from environment variables, not the script:

```
GHOST_ADMIN_URL=https://cms-{slug}.dev.skeleton-crew.co.uk
GHOST_ADMIN_KEY=69d7d6005a7f310001fd4208:6e92b7e884de...
```

The seed script should read `GHOST_ADMIN_URL` and `GHOST_ADMIN_KEY` from `process.env` and fail immediately with a clear message if either is missing. These can live in a `.env` file per client (gitignored) or be passed by the deploy tooling.

**Content data** - loaded from a per-client JSON seed file (see section 3).

The script invocation becomes:

```
GHOST_ADMIN_URL=... GHOST_ADMIN_KEY=... node scripts/seed-ghost-content.js --seed-file clients/skeleton-crew/seed-data.json
```

Or more practically, the deploy wrapper resolves the client slug to the right env vars and seed file automatically.

## 3. Where Seed Data Should Live

**A per-client JSON file, not in the script.**

Move the hardcoded content arrays (tags, portfolio entries, pricing tiers, site pages) out of `seed-ghost-content.js` into a JSON template. The script becomes a generic engine that reads any seed file.

Proposed structure:

```
clients/
  skeleton-crew/
    seed-data.json    <-- content for this client's Ghost instance
    public/           <-- static frontend (already exists)
  future-client/
    seed-data.json
    public/
```

The seed JSON schema:

```json
{
  "tags": [
    { "name": "Portfolio", "slug": "portfolio", "description": "Client portfolio entries" }
  ],
  "posts": [
    {
      "title": "Fungi & Forage",
      "slug": "fungi-and-forage",
      "custom_excerpt": "A bespoke website for a small mushroom growing business.",
      "status": "published",
      "tags": ["portfolio"]
    }
  ],
  "pages": [
    {
      "title": "Websites that don't look like everyone else's.",
      "slug": "site-hero",
      "custom_excerpt": "Bespoke web design for small UK businesses.",
      "status": "published"
    }
  ]
}
```

The script resolves tag references in posts/pages by slug lookup (create tags first, then use returned IDs when creating posts). This is cleaner than the current approach of embedding tag ID objects in the post definitions.

**Why JSON, not YAML or keeping it in the script:**
- JSON is native to Node - no parser dependency, consistent with Ghost API payloads
- Separating data from logic means a non-developer operator could duplicate and edit a seed file for a new client without touching the seeding engine
- The seed file doubles as documentation of what content a client site expects

## 4. Idempotency

The current script already handles idempotency reasonably well - it checks for existing slugs before creating and treats 422 (duplicate) responses as skips. This approach is correct and should be preserved.

**What works now:**
- Tags: checked by slug before creation, 422 treated as "already exists"
- Posts: checked by slug before creation, 422 treated as "already exists"
- Pages: checked by slug before creation, 422 treated as "already exists"

**What needs attention:**
- **Content updates are not handled.** If the operator changes a seed file and re-runs, existing content is skipped, not updated. This is the right default - seed data is initial content, not a sync source. The operator edits content in Ghost after seeding. Document this clearly.
- **Add a `--force` flag** for the rare case where the operator wants to re-seed from scratch (e.g. after a Ghost database reset). With `--force`, the script deletes existing content matching the seed slugs and recreates it. Without `--force`, existing content is always preserved.
- **The sleep(1000) between pricing tiers** (for distinct `published_at` timestamps) should be kept - it ensures correct sort order. This is a pragmatic workaround for Ghost not having an explicit sort-order field.

## 5. Next Steps

1. **Extract seed data to JSON.** Create `clients/skeleton-crew/seed-data.json` from the hardcoded arrays currently in `seed-ghost-content.js`. The script's content arrays become the first seed file verbatim.

2. **Refactor the seed script.** Make `seed-ghost-content.js` a generic engine:
   - Read `GHOST_ADMIN_URL` and `GHOST_ADMIN_KEY` from environment variables
   - Accept `--seed-file <path>` argument
   - Resolve tag references by slug (create tags first, then look up IDs for posts/pages)
   - Keep the existing idempotency logic (skip if slug exists)
   - Add `--force` flag for full reseed
   - Add `--dry-run` flag that logs what would be created without calling the API

3. **Add post-deploy hook.** Create `scripts/deploy-with-seed.sh` that wraps:
   ```
   skeleton deploy "$1"
   node scripts/seed-ghost-content.js --seed-file "clients/$1/seed-data.json"
   node scripts/regenerate-fallback.js
   ```

4. **Remove hardcoded credentials.** Strip `API_URL` and `ADMIN_KEY` constants from the script. Read from env vars only. Add a `.env.example` showing the required variables.

5. **Test the idempotency guarantee.** Run the refactored script twice against a fresh Ghost instance and verify the second run produces all `[skip]` messages with no errors or duplicates.
