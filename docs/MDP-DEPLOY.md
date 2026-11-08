# MDP workspace deploy (internal notes)

Upstream `docker-compose.yml` (port 18610, `muse2api:latest`, `./data` bind) is
NOT used in the workspace — the root repo composes its own service. Everything
below lives there; this repo's own files are untouched.

## Port / env matrix

| var | value | notes |
|---|---|---|
| container port | `42120` (`MUSE2API_PORT`) | ports.yaml service `muse2api`; internal-only, never routed public |
| `MUSE2API_DRIVER` | prod `browser`, dev `mock` | browser drives real muse.ai sessions (chromium is baked into the image) |
| `MUSE2API_HOST` | `0.0.0.0` | in-network |
| `MUSE2API_DATA_DIR` | `/app/data` | named volume `muse2api-data` (accounts/keys/task state survive recreate) |
| `MUSE2API_MEDIA_RETENTION_DAYS` | `14` (prod) | media of finished tasks is transient; brain rewrites URLs to its own storage |
| `MUSE2API_URL` (env of callers) | prod `http://muse2api:42120`, dev loopback `:42120` | read by brain (proxy) + shell-api (status sync) |
| `MUSE2API_API_KEY` / `MUSE2API_ADMIN_KEY` | root `.env.prod` placeholders `CHANGE_ME` | create keys in the dashboard (`/dashboard`, admin key login) or `POST /admin/keys` — returned once |

## Where it is wired

- `docker-compose.backend.yml` — service `muse2api` (build context `muse2api/`,
  shm 1gb like upstream, healthcheck `GET /healthz` via python urllib — the
  python-slim image has no wget/curl).
- `docker-compose.dev.yml` — driver `mock`, publishes `127.0.0.1:42120` only.
- `docker-compose.server.yml` — driver `browser`, 14-day media retention,
  2 CPU cap. Runs on **box1 only** (deploy filter in `be.yml`, like
  postgrest/cloudflared): the account pool is box-local state, a second box
  serving a split pool would diverge.
- Root `.env.dev` / `.env.prod` carry `MUSE2API_URL` / `MUSE2API_API_KEY` /
  `MUSE2API_ADMIN_KEY` / `MUSE2API_PUBLIC_BASE` (empty — the brain rewrites
  media URLs to its own origin).
- Deploy pipeline: `be.yml` `$sidecarMap` + submodule-aware detect +
  `be-services.mjs SERVICE_TARGETS["muse2api"]` (GHCR prebuild only when this
  submodule changes — the image is ~1 GB because chromium is baked in).

Contract: `docs/MUSE-VIDEO-CONTRACT.md` in the workspace root.
