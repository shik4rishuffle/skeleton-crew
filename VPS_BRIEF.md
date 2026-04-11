# VPS Brief - Stand Up Payload CMS 3 for Skeleton Crew

## What Is Being Done

Replace Ghost CMS with Payload CMS 3 on the Skeleton Crew VPS. Ghost is a
blog platform that cannot handle structured content types. Payload CMS 3
provides custom collections with discrete, labelled fields - headlines, prices,
image uploads, feature lists - editable by non-technical clients.

This brief covers infrastructure only: containers, database, routing, volumes.
The Payload application code (content model, config, seed script) is built and
tested in the `skeleton-crew` frontend repo and delivered as a Docker image.

---

## Current VPS State

The VPS is already running the Skeleton Crew stack:

| Container | Purpose | Notes |
|---|---|---|
| `skeleton-traefik` | Reverse proxy, TLS (Let's Encrypt) | Traefik v3, handles all routing |
| `skeleton-nginx` | Serves static frontend files | Per-client site directories |
| `skeleton-ghost` | Ghost CMS (to be replaced) | Currently at `cms.skeleton-crew.co.uk` |
| `skeleton-mysql` | MySQL database (used by Ghost only) | Shared container `skeleton-mysql` |

- **Available RAM:** 2.6 GB out of 3.7 GB total
- **Domain:** `skeleton-crew.co.uk` (frontend), `cms.skeleton-crew.co.uk` (CMS admin + API)
- **TLS:** Managed by Traefik with Let's Encrypt
- **Deploy tool:** `skeleton deploy [client-slug]`

---

## What Needs To Be Done

### 1. Add a PostgreSQL container

- **Container name:** `skeleton-postgres`
- **Image:** `postgres:16-alpine`
- **Persistent volume:** `postgres-data` mounted to `/var/lib/postgresql/data`
- **Estimated RAM:** ~100-150 MB
- **Network:** Must be accessible by the Payload container (same Docker network)
- **Initial setup:** Create a database called `payload` with a dedicated user
- **Environment variables:**
  ```
  POSTGRES_USER=payload
  POSTGRES_PASSWORD=<generate-secure-password>
  POSTGRES_DB=payload
  ```

### 2. Build and deploy the Payload CMS container

- **Container name:** `skeleton-payload`
- **Image:** Custom build from the Payload app in the `skeleton-crew` repo
  (Dockerfile will be provided in the repo at `payload/Dockerfile`)
- **Port:** 3000 (internal only - Traefik handles external access)
- **Persistent volume:** `payload-media` mounted to `/app/media` (uploaded images)
- **Estimated RAM:** ~250-350 MB
- **Environment variables:**
  ```
  DATABASE_URI=postgres://payload:<password>@skeleton-postgres:5432/payload
  PAYLOAD_SECRET=<generate-random-32-char-string>
  PAYLOAD_PUBLIC_SERVER_URL=https://cms.skeleton-crew.co.uk
  ```
- **Behaviour on first start:** Payload auto-runs database migrations and creates
  the schema. No manual migration step needed.

### 3. Update Traefik routing

Route `cms.skeleton-crew.co.uk` to the Payload container instead of Ghost.

- **Current rule:** `cms.skeleton-crew.co.uk` -> `skeleton-ghost:2368`
- **New rule:** `cms.skeleton-crew.co.uk` -> `skeleton-payload:3000`

This can be done via Traefik labels on the Payload container:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.payload.rule=Host(`cms.skeleton-crew.co.uk`)"
  - "traefik.http.routers.payload.entrypoints=websecure"
  - "traefik.http.routers.payload.tls.certresolver=letsencrypt"
  - "traefik.http.services.payload.loadbalancer.server.port=3000"
```

### 4. Keep Ghost running temporarily

Do NOT remove Ghost or MySQL yet. The frontend migration in the `skeleton-crew`
repo will happen in parallel. The cutover sequence is:

1. Stand up Payload + Postgres (this brief)
2. Frontend repo rewrites the CMS API client to fetch from Payload
3. Seed Payload with content
4. Deploy updated frontend
5. Verify everything works
6. **Then** remove Ghost and MySQL (separate brief, after confirmation)

Ghost should remain accessible during the transition but does not need to
stay on `cms.skeleton-crew.co.uk` once Payload takes that route. If needed,
temporarily move Ghost to a different subdomain (e.g. `ghost.skeleton-crew.co.uk`)
or just stop the Ghost container once the frontend is switched over.

---

## Constraints

- Do not remove or modify the existing `skeleton-traefik`, `skeleton-nginx`,
  or static frontend file serving - these are unrelated to this work
- Do not remove Ghost or MySQL until explicitly instructed (step 6 above)
- All new containers must be on the same Docker network as existing containers
- TLS for `cms.skeleton-crew.co.uk` must continue to work (Traefik + Let's Encrypt)
- Postgres data and Payload media uploads must be on persistent volumes
  (not lost on container restart)
- The Payload container must be restartable without data loss

---

## Success Criteria

- `skeleton-postgres` is running with a `payload` database
- `skeleton-payload` is running and accessible at `https://cms.skeleton-crew.co.uk`
- The Payload admin panel loads at `https://cms.skeleton-crew.co.uk/admin`
- First admin user can be created via the admin panel
- Traefik serves Payload over HTTPS with a valid Let's Encrypt certificate
- Ghost remains running and accessible (on a different route or stopped but not removed)
- Both persistent volumes survive a `docker compose down && docker compose up`

---

## Per-Client Pattern (future reference)

This setup is designed to be repeated per client. The long-term pattern:

- **Shared:** One `skeleton-postgres` container with one database per client
- **Per-client:** One `skeleton-payload` container per client, each with:
  - Its own `DATABASE_URI` pointing to a client-specific database
  - Its own `PAYLOAD_SECRET`
  - Its own `PAYLOAD_PUBLIC_SERVER_URL` (e.g. `https://cms.acme-client.co.uk`)
  - Its own media volume
  - Its own Traefik router label

Each additional client adds ~250-350 MB RAM (Payload container only, shared Postgres).

---

## Files the Frontend Repo Will Provide

The `skeleton-crew` repo will contain:

- `payload/` directory with:
  - `payload.config.ts` - content model (collections, fields)
  - `Dockerfile` - builds the Payload app
  - `package.json` - dependencies
  - `tsconfig.json` - TypeScript config
  - `src/` - any custom components or hooks

The VPS orchestrator should be able to build the Payload Docker image from
this directory and deploy it as `skeleton-payload`.
