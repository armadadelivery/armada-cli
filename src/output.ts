import { ArmadaResponse } from '@armada/sdk';

export interface OutputOptions {
  json?: boolean;
}

export function emit<T>(res: ArmadaResponse<T>, opts: OutputOptions = {}) {
  if (opts.json) {
    process.stdout.write(JSON.stringify(res.data, null, 2) + '\n');
    return;
  }
  // Pretty-print: stringify JSON but tag rate limit on stderr so stdout stays pipe-clean.
  process.stdout.write(JSON.stringify(res.data, null, 2) + '\n');
  if (res.rateLimit.remaining != null) {
    process.stderr.write(
      `rate-limit: ${res.rateLimit.remaining}/${res.rateLimit.limit} · resets ${res.rateLimit.resetUnix ? new Date(res.rateLimit.resetUnix * 1000).toISOString() : '?'}\n`,
    );
  }
}

export function emitError(err: unknown) {
  const e = err as { message?: string; status?: number; code?: string; response?: unknown };
  process.stderr.write(`✗ ${e.message || 'error'}${e.status ? ` (HTTP ${e.status})` : ''}\n`);
  if (e.response) process.stderr.write(JSON.stringify(e.response, null, 2) + '\n');
  process.exitCode = 1;
}
