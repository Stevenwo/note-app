# glassnotes.app: Cloudflare Lockdown (READ FIRST)

**Status: LOCKED DOWN as of 2026-11-26.** The live site is intentionally unreachable.
The project is paused, not abandoned. If you are resuming work, read this whole file
before touching DNS, Cloudflare, or the server.

## Why

The app is a personal, private project that was never meant to be public. Cloudflare
analytics showed ~1,000 requests/day from automated vulnerability scanners (Israel,
Switzerland, Thailand, India, US, ...) probing for WordPress/PHP holes
(`/xmlrpc.php`, `/wp-content/plugins/...`, `/file.php`, `/dpack.php`, etc.).
The Cloudflare account itself was NOT compromised (audit log checked: only the owner
plus Cloudflare "System" actions, 0 failures).

## What is in place

Cloudflare account: owner's account (stevenwo93@...), zone `glassnotes.app`, **Free plan**.

| Setting | Value |
|---|---|
| Location | Cloudflare dashboard → glassnotes.app → Security → Security rules → Custom rules |
| Rule name | `lockdown-block-all` |
| Expression | `(http.host contains "glassnotes.app")` |
| Action | **Block** |
| Status | Active |
| Coverage | 100% of zone traffic (apex, `www`, `test`, any subdomain) |

DNS: there are **no A records** (removed 2026-11-26, see "Current state" below). To
revive, deploy to a new host and add fresh A records, Proxied (orange cloud). MX/TXT
records are Namecheap email forwarding (eforward1-5.registrar-servers.com).

## Current state (updated 2026-11-26): app retired, domain kept

- The production server **glassnotes-prod** (Hetzner CPX21, Ashburn, project
  `glassnotes-validation`) **no longer exists**. It was deleted at some point before
  Aug 2026, and its IP has since been reassigned to another Hetzner customer. No
  snapshots/backups remain, so the old production notes data is presumed lost.
  The code in this repo is the surviving copy.
- The `glassnotes.app`, `www` and `test` A records were **deleted** from Cloudflare on
  2026-11-26 (they were pointing at the stranger's reassigned IP). The domain currently
  serves nothing.
- Kept: the domain itself (owner renews it at Namecheap), the `lockdown-block-all` rule,
  and the MX/TXT email-forwarding records.
- The other Hetzner server (`mmm-opencode`) is unrelated to this app.

To revive later: restore the DB dump on a new host (e.g. the owner's Oracle Cloud ARM
server) with Docker, ideally reachable only over Tailscale rather than publicly.

## How to unlock (resume development)

Pick one, least exposure first:

1. **Preferred: login gate.** Cloudflare Zero Trust → Access → add a self-hosted app for
   `glassnotes.app` and `*.glassnotes.app`, policy "Allow, emails: owner's email"
   (one-time PIN). The Zero Trust Free plan is $0 for up to 50 users but **requires the owner to add a
   payment method on file**. An agent must not enter payment details; ask the owner to do it.
   Then disable `lockdown-block-all`.
2. **IP allowlist.** Edit the rule expression to
   `(http.host contains "glassnotes.app" and not ip.src in {<owner IP>})`.
   The owner moves between Alabama and Michigan, so the IP changes; update it as needed.
3. **Fully public.** Toggle `lockdown-block-all` to Disabled. Only do this if the owner
   explicitly asks, and add auth to the app first.

## If you redeploy: lock down the new server

The Cloudflare rule only filters traffic that goes *through* Cloudflare. On any new host:

- Firewall: allow inbound 80/443 **only** from Cloudflare IP ranges
  (https://www.cloudflare.com/ips/), SSH key-only, deny everything else. Or serve the
  app only over Tailscale and skip public DNS entirely.
- `docker-compose.yml` publishes Postgres on `5432:5432` with a password that is in this
  public repo. Never deploy it as-is: remove the port mapping (or bind to `127.0.0.1`)
  and use a real secret from a private `.env`.

## Notes for agents

- This repo is **public**. Never commit IPs, `.env` files, tokens, or DB credentials.
- Don't touch the other zones in the Cloudflare account (e.g. `modestmoneymaps.com`).
- Never pick paid Cloudflare plans or enter payment info; ask the owner.
