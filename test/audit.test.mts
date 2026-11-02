import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { isExcepted } from '../scripts/audit.mts';

test('audit exception applies only to the vsce development advisory', () => {
  const node = 'node_modules/@vscode/vsce/node_modules/minimatch';
  const report = {
    auditReportVersion: 2,
    vulnerabilities: {
      '@vscode/vsce': { severity: 'moderate', via: ['minimatch'], nodes: ['node_modules/@vscode/vsce'] },
      minimatch: {
        severity: 'moderate',
        via: [{ name: 'minimatch', severity: 'moderate', url: 'https://github.com/advisories/GHSA-g3hv-75wg-m249' }],
        nodes: [node],
      },
    },
  };
  const lock = { packages: { [node]: { dev: true }, 'node_modules/@vscode/vsce': { dev: true } } };
  assert.equal(isExcepted(report, lock), true);
  assert.equal(isExcepted({ ...report, vulnerabilities: { ...report.vulnerabilities, other: {} } }, lock), false);
  assert.equal(
    isExcepted({
      ...report,
      vulnerabilities: {
        ...report.vulnerabilities,
        minimatch: { ...report.vulnerabilities.minimatch, via: [{ name: 'other' }] },
      },
    }, lock),
    false,
  );
  assert.equal(isExcepted(report, { packages: { ...lock.packages, [node]: { dev: false } } }), false);
  const dir = mkdtempSync(join(tmpdir(), 'audit-test-'));
  try {
    writeFileSync(join(dir, 'package-lock.json'), JSON.stringify(lock));
    const run = (value: unknown) => {
      writeFileSync(join(dir, 'npm'), `#!/bin/sh\nprintf '%s' '${JSON.stringify(value)}'\nexit 1\n`, { mode: 0o755 });
      return spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/audit.mts', import.meta.url))], {
        cwd: dir,
        env: { ...process.env, PATH: `${dir}:${process.env.PATH}` },
      }).status;
    };
    assert.equal(run(report), 0);
    assert.equal(run({ ...report, vulnerabilities: { ...report.vulnerabilities, other: {} } }), 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
