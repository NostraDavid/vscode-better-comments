import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Temporary: vsce has no fix for https://github.com/advisories/GHSA-g3hv-75wg-m249.
export function isExcepted(report: any, lock: any): boolean {
  const vulnerabilities = report?.vulnerabilities;
  const minimatch = vulnerabilities?.minimatch;
  const vsce = vulnerabilities?.['@vscode/vsce'];
  const node = 'node_modules/@vscode/vsce/node_modules/minimatch';
  return report?.auditReportVersion === 2
    && Object.keys(vulnerabilities ?? {}).sort().join(',') === '@vscode/vsce,minimatch'
    && minimatch?.severity === 'moderate'
    && minimatch?.via?.length === 1
    && minimatch.via[0]?.url === 'https://github.com/advisories/GHSA-g3hv-75wg-m249'
    && minimatch.via[0]?.name === 'minimatch'
    && minimatch.via[0]?.severity === 'moderate'
    && minimatch.nodes?.length === 1 && minimatch.nodes[0] === node
    && vsce?.severity === 'moderate'
    && vsce.via?.length === 1 && vsce.via[0] === 'minimatch'
    && vsce.nodes?.length === 1 && vsce.nodes[0] === 'node_modules/@vscode/vsce'
    && lock?.packages?.[node]?.dev === true
    && lock?.packages?.['node_modules/@vscode/vsce']?.dev === true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const audit = spawnSync('npm', ['audit', '--audit-level=moderate', '--json'], { encoding: 'utf8' });
  if (audit.status === 0) {
    console.log(audit.stdout);
  } else {
    try {
      const report = JSON.parse(audit.stdout);
      const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
      if (audit.status === 1 && isExcepted(report, lock)) {
        console.log('Temporarily excepted GHSA-g3hv-75wg-m249 in the vsce development dependency.');
      } else {
        console.error(audit.stdout, audit.stderr);
        process.exitCode = 1;
      }
    } catch {
      console.error(audit.stdout, audit.stderr, audit.error);
      process.exitCode = 1;
    }
  }
}
