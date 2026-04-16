import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CONFIG_DIR = path.join(os.homedir(), '.armada');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

export interface CliConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
}

export function loadConfig(): CliConfig {
  const fromEnv: CliConfig = {
    apiKey: process.env.ARMADA_API_KEY,
    apiSecret: process.env.ARMADA_API_SECRET,
    baseUrl: process.env.ARMADA_API_BASE,
  };
  let fromFile: CliConfig = {};
  try {
    fromFile = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) as CliConfig;
  } catch {}
  return { ...fromFile, ...Object.fromEntries(Object.entries(fromEnv).filter(([, v]) => v)) };
}

export function saveConfig(cfg: CliConfig) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), { mode: 0o600 });
}

export function getConfigPath() { return CONFIG_PATH; }
