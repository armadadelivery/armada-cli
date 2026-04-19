#!/usr/bin/env node
// Armada CLI entry. `armada --help` shows everything.

import { Command } from 'commander';
import fs from 'node:fs';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { loadConfig, saveConfig, getConfigPath } from './config.js';
import { makeClient } from './client.js';
import { emit, emitError } from './output.js';

const program = new Command();
program
  .name('armada')
  .description('CLI for the Armada Automated Ordering API v2')
  .option('--json', 'Emit raw JSON (machine-readable)')
  .option('--api-base <url>', 'Override API base URL (production by default)')
  .version('0.1.0-beta.1');

// ---------- config ----------
const config = program.command('config').description('Manage stored credentials');

config.command('show').description('Print the current config location + state').action(() => {
  const cfg = loadConfig();
  console.log(`config: ${getConfigPath()}`);
  console.log(`apiKey: ${cfg.apiKey ? '✓ set' : '✗ not set'}`);
  console.log(`apiSecret: ${cfg.apiSecret ? '✓ set' : '✗ not set'}`);
  console.log(`baseUrl: ${cfg.baseUrl || '(default: https://api.armadadelivery.com)'}`);
});

config.command('set').description('Interactively set apiKey + apiSecret').action(async () => {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const apiKey = (await rl.question('API key: ')).trim();
  const apiSecret = (await rl.question('API secret: ')).trim();
  rl.close();
  if (!apiKey || !apiSecret) { console.error('Both values are required.'); process.exit(2); }
  saveConfig({ ...loadConfig(), apiKey, apiSecret });
  console.log(`Saved to ${getConfigPath()}`);
});

config.command('clear').description('Delete stored config').action(() => {
  try { fs.unlinkSync(getConfigPath()); console.log('Cleared.'); } catch { console.log('Nothing to clear.'); }
});

// ---------- deliveries ----------
const deliveries = program.command('deliveries').description('Create and track deliveries');

deliveries
  .command('create')
  .description('POST /v2/deliveries')
  .requiredOption('--from-file <path>', 'Path to a JSON file matching the DeliveryInput schema')
  .action(async (opts) => {
    try {
      const body = JSON.parse(fs.readFileSync(opts.fromFile, 'utf8'));
      const client = makeClient(program.opts().apiBase);
      emit(await client.deliveries.create(body), program.opts());
    } catch (e) { emitError(e); }
  });

deliveries.command('get <id>').description('GET /v2/deliveries/:id').action(async (id) => {
  try { emit(await makeClient(program.opts().apiBase).deliveries.get(id), program.opts()); } catch (e) { emitError(e); }
});

deliveries.command('cancel <id>').description('POST /v2/deliveries/:id/cancel').option('-r, --reason <text>').action(async (id, opts) => {
  try { emit(await makeClient(program.opts().apiBase).deliveries.cancel(id, opts.reason), program.opts()); } catch (e) { emitError(e); }
});

deliveries.command('retry <id>').description('POST /v2/deliveries/:id/retry').action(async (id) => {
  try { emit(await makeClient(program.opts().apiBase).deliveries.retry(id), program.opts()); } catch (e) { emitError(e); }
});

deliveries.command('estimate').description('POST /v2/deliveries/estimate').requiredOption('--from-file <path>').action(async (opts) => {
  try {
    const body = JSON.parse(fs.readFileSync(opts.fromFile, 'utf8'));
    emit(await makeClient(program.opts().apiBase).deliveries.estimate(body), program.opts());
  } catch (e) { emitError(e); }
});

// ---------- branches ----------
const branches = program.command('branches').description('Manage pickup branches');

branches.command('list').description('GET /v2/branches').action(async () => {
  try { emit(await makeClient(program.opts().apiBase).branches.list(), program.opts()); } catch (e) { emitError(e); }
});
branches.command('create').description('POST /v2/branches').requiredOption('--from-file <path>').action(async (opts) => {
  try {
    const body = JSON.parse(fs.readFileSync(opts.fromFile, 'utf8'));
    emit(await makeClient(program.opts().apiBase).branches.create(body), program.opts());
  } catch (e) { emitError(e); }
});
branches.command('get <id>').description('GET /v2/branches/:id').action(async (id) => {
  try { emit(await makeClient(program.opts().apiBase).branches.get(id), program.opts()); } catch (e) { emitError(e); }
});
branches.command('update <id>').description('PUT /v2/branches/:id').requiredOption('--from-file <path>').action(async (id, opts) => {
  try {
    const body = JSON.parse(fs.readFileSync(opts.fromFile, 'utf8'));
    emit(await makeClient(program.opts().apiBase).branches.update(id, body), program.opts());
  } catch (e) { emitError(e); }
});
branches.command('delete <id>').description('DELETE /v2/branches/:id').action(async (id) => {
  try { emit(await makeClient(program.opts().apiBase).branches.delete(id), program.opts()); } catch (e) { emitError(e); }
});

// ---------- wallet ----------
program.command('wallet').description('GET /v2/wallet').action(async () => {
  try { emit(await makeClient(program.opts().apiBase).wallet.get(), program.opts()); } catch (e) { emitError(e); }
});

// ---------- invoices ----------
const invoices = program.command('invoices').description('List and inspect invoices');

invoices
  .command('list')
  .description('GET /v2/invoices')
  .option('--status <status>', 'unpaid | paid | topup | all', 'all')
  .option('--page <n>', 'page number', (v) => parseInt(v, 10), 1)
  .option('--per-page <n>', 'page size', (v) => parseInt(v, 10), 20)
  .option('--since <date>', 'periodBegin (YYYY-MM-DD)')
  .option('--until <date>', 'periodEnd (YYYY-MM-DD)')
  .action(async (opts) => {
    try {
      emit(await makeClient(program.opts().apiBase).invoices.list({
        page: opts.page, perPage: opts.perPage, status: opts.status,
        periodBegin: opts.since, periodEnd: opts.until,
      }), program.opts());
    } catch (e) { emitError(e); }
  });

invoices.command('get <id>').description('GET /v2/invoices/:id').action(async (id) => {
  try { emit(await makeClient(program.opts().apiBase).invoices.get(id), program.opts()); } catch (e) { emitError(e); }
});

program.parseAsync();
