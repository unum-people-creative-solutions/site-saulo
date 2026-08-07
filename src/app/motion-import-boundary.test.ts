import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const componentsDir = path.join(process.cwd(), 'src/components');
const orchestratorPath = path.join(componentsDir, 'MotionOrchestrator.tsx');
const forbiddenImportPatterns = [
  /from\s+['"]gsap(?:\/[^'"]*)?['"]/,
  /from\s+['"]@\/lib\/animations\/scenes\/[^'"]+['"]/,
];

function collectTsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const entryPath = path.join(dir, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return collectTsxFiles(entryPath);
    }

    return entryPath.endsWith('.tsx') ? [entryPath] : [];
  });
}

function hasForbiddenImport(source: string): boolean {
  return forbiddenImportPatterns.some((pattern) => pattern.test(source));
}

describe('motion import boundary', () => {
  it('T40: only MotionOrchestrator may import GSAP or scene modules outside src/lib/animations', () => {
    expect(existsSync(orchestratorPath)).toBe(true);

    const orchestratorSource = readFileSync(orchestratorPath, 'utf8');
    expect(hasForbiddenImport(orchestratorSource)).toBe(true);

    const componentFiles = collectTsxFiles(componentsDir).filter(
      (filePath) => filePath !== orchestratorPath,
    );

    for (const filePath of componentFiles) {
      const source = readFileSync(filePath, 'utf8');
      expect(hasForbiddenImport(source)).toBe(false);
    }
  });
});
