# @armada/cli

`armada` — command-line client for the Armada Automated Ordering API v2.

```bash
npm i -g @armada/cli
armada config set          # prompts for apiKey + apiSecret
armada wallet              # GET /v2/wallet
armada invoices list
armada deliveries create --from-file order.json
armada deliveries retry 66a...
```

## Credentials

Stored at `~/.armada/config.json` (mode 600) after `armada config set`. Env vars `ARMADA_API_KEY`, `ARMADA_API_SECRET`, `ARMADA_API_BASE` take precedence.

## Sandbox

Default base URL is `https://sandbox.api.armadadelivery.com`. Override with `--api-base https://api.armadadelivery.com` or set `ARMADA_API_BASE`.

## JSON output

All commands default to pretty JSON on stdout with a rate-limit line on stderr. Add `--json` to drop the stderr line (useful in pipes).
