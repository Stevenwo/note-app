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

DNS (unchanged by the lockdown): `glassnotes.app`, `www`, `test` A records → the Hetzner
VPS origin, all **Proxied** (orange cloud). Look up the origin IP in the Cloudflare DNS
tab; it is deliberately not written in this public repo. MX/TXT records are Namecheap
email forwarding (eforward1-5.registrar-servers.com).

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

## Known gap (server side, NOT yet done)

The Cloudflare rule only filters traffic that goes *through* Cloudflare. Anyone who knows
the origin IP can still hit the Hetzner VPS directly. To close this:

- Hetzner Cloud Firewall (or `ufw`) on the VPS: allow inbound 80/443 **only** from
  Cloudflare IP ranges (https://www.cloudflare.com/ips/), allow SSH only from the owner's
  IP or via key-only auth, deny everything else.
- Or stop the containers (`docker compose down`) while the project is paused.

## Notes for agents

- This repo is **public**. Never commit IPs, `.env` files, tokens, or DB credentials.
- Don't touch the other zones in the Cloudflare account (e.g. `modestmoneymaps.com`).
- Never pick paid Cloudflare plans or enter payment info; ask the owner.
