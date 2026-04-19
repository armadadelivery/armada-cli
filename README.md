# @armada/cli

`armada` — command-line client for the Armada Automated Ordering API v2.

## Install

From npm (once published):

```bash
npm i -g @armada/cli
```

Directly from GitHub — no registry needed:

```bash
# latest main
npm i -g github:armadadelivery/armada-cli

# pinned
npm i -g github:armadadelivery/armada-cli#v0.1.0-beta.0
```

Or run it ad-hoc with `npx` without installing:

```bash
npx github:armadadelivery/armada-cli wallet
```

Both git and npx paths work because the CLI has a `prepare` script that
compiles TypeScript on install. The `@armada/sdk` dependency is pulled
from GitHub transitively, so you don't need npm access to anything.

## Usage

```bash
armada config set          # prompts for apiKey + apiSecret
armada wallet              # GET /v2/wallet
armada invoices list
armada deliveries create --from-file order.json
armada deliveries retry 66a...
```

## Credentials

Stored at `~/.armada/config.json` (mode 600) after `armada config set`. Env vars `ARMADA_API_KEY`, `ARMADA_API_SECRET`, `ARMADA_API_BASE` take precedence.

## Production, Test mode, and the optional sandbox

Default base URL is **production** — `https://api.armadadelivery.com`. Create a v2 API key with **Test mode ON** in the [business app](https://business.armadadelivery.com) to simulate deliveries end-to-end (bot driver, ~30 s lifecycle, no real dispatch, no wallet charge). Toggle Test mode off on the same key when you're ready to go live.

Override to the isolated sandbox environment with `--api-base https://sandbox.api.armadadelivery.com` or set `ARMADA_API_BASE`. For most integrations you do not need to.

## JSON output

All commands default to pretty JSON on stdout with a rate-limit line on stderr. Add `--json` to drop the stderr line (useful in pipes).
