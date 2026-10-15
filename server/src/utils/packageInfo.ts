import fs from 'fs';
import path from 'path';

export function getPackageVersion(): string {
  const pkgPath = path.join(__dirname, '..', '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };
  return pkg.version ?? 'unknown';
}
