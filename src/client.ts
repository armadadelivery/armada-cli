import { ArmadaClient } from '@armada/sdk';
import { loadConfig } from './config.js';

export function makeClient(baseOverride?: string): ArmadaClient {
  const cfg = loadConfig();
  if (!cfg.apiKey || !cfg.apiSecret) {
    console.error('No credentials configured. Run `armada config set` or export ARMADA_API_KEY + ARMADA_API_SECRET.');
    process.exit(2);
  }
  return new ArmadaClient({ apiKey: cfg.apiKey, apiSecret: cfg.apiSecret, baseUrl: baseOverride || cfg.baseUrl });
}
