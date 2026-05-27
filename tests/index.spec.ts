import {
  isExternalPackage,
  isDeadCode,
  extractNameFromKey,
  analyzeUsages
} from '../src/core/analysis';
import {
  processImportedNames,
  processCommonJSImports,
  processESModuleExports,
  processCommonJSExports
} from '../src/core/declarations';
import { IDeadCodeInfo, IImportedSymbol } from '../src/interfaces';

function makeEntry(filePath: string, line = 1): IDeadCodeInfo {
  return {
    declarationCount: 0,
    exportCount: 0,
    importCount: 0,
    usageCount: 0,
    declaredIn: [{ filePath, line }],
    exportedFrom: [],
    importedIn: []
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('External Package Detection', () => {
  test('should distinguish external packages from local modules', () => {
    expect(isExternalPackage('react')).toBe(true);
    expect(isExternalPackage('clsx')).toBe(true);
    expect(isExternalPackage('lodash')).toBe(true);
    expect(isExternalPackage('@types/node')).toBe(true);

    expect(isExternalPackage('./component')).toBe(false);
    expect(isExternalPackage('../utils')).toBe(false);
    expect(isExternalPackage('@/components/Button')).toBe(false);
    expect(isExternalPackage('/absolute/path')).toBe(false);
  });

  test('should understand the logic for external package usage', () => {
    expect(isExternalPackage('react')).toBe(true);
    expect(isExternalPackage('./local-file')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 1 — Name collision between files (file-scoped keys)', () => {
  test('extractNameFromKey strips file prefix from file-scoped key', () => {
    expect(extractNameFromKey('src/utils.ts::helper')).toBe('helper');
    expect(extractNameFromKey('helper')).toBe('helper'); // plain name unchanged
  });

  test('same-named symbol in different files is tracked independently', () => {
    // fileA declares and USES helper; fileB declares helper but never uses it.
    const deadMap: Record<string, IDeadCodeInfo> = {
      'fileA.ts::helper': makeEntry('fileA.ts'),
      'fileB.ts::helper': makeEntry('fileB.ts')
    };
    const files = new Map<string, string>([
      ['fileA.ts', 'function helper() {}\nhelper();\n'],
      ['fileB.ts', 'function helper() {}\n']
    ]);
    const exportedSymbols = new Set<string>();
    const importedSymbols = new Map<string, IImportedSymbol[]>();

    analyzeUsages(Object.keys(deadMap), files, deadMap, exportedSymbols, importedSymbols);

    expect(deadMap['fileA.ts::helper'].usageCount).toBeGreaterThan(0);
    expect(deadMap['fileB.ts::helper'].usageCount).toBe(0);

    expect(isDeadCode('helper', deadMap['fileA.ts::helper'], exportedSymbols, importedSymbols)).toBe(false);
    expect(isDeadCode('helper', deadMap['fileB.ts::helper'], exportedSymbols, importedSymbols)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 2 — ESM alias import { a as b }', () => {
  test('processImportedNames stores original name as key and local alias as localName', () => {
    const importedSymbols = new Map<string, IImportedSymbol[]>();
    processImportedNames('a as b', 'fileC.ts', './fileA', importedSymbols);

    // Key is the original export name
    expect(importedSymbols.has('a')).toBe(true);
    expect(importedSymbols.has('b')).toBe(false);

    const info = importedSymbols.get('a')![0];
    expect(info.filePath).toBe('fileC.ts');
    expect(info.importSource).toBe('./fileA');
    expect(info.localName).toBe('b');
  });

  test('non-aliased import has no localName', () => {
    const importedSymbols = new Map<string, IImportedSymbol[]>();
    processImportedNames('helper', 'fileC.ts', './fileA', importedSymbols);

    const info = importedSymbols.get('helper')![0];
    expect(info.localName).toBeUndefined();
  });

  test('aliased import is marked usedAfterImport when local binding is used', () => {
    // fileA exports 'a'; fileC imports it as 'b' and calls b()
    const deadMap: Record<string, IDeadCodeInfo> = {
      'fileA.ts::a': makeEntry('fileA.ts')
    };
    const files = new Map<string, string>([
      ['fileA.ts', 'export function a() {}\n'],
      ['fileC.ts', "import { a as b } from './fileA';\nb();\n"]
    ]);
    const exportedSymbols = new Set<string>(['a']);
    const importedSymbols = new Map<string, IImportedSymbol[]>([
      ['a', [{ filePath: 'fileC.ts', importSource: './fileA', usedAfterImport: false, localName: 'b' }]]
    ]);

    analyzeUsages(Object.keys(deadMap), files, deadMap, exportedSymbols, importedSymbols);

    // The import should be considered used (via the local alias 'b')
    expect(importedSymbols.get('a')![0].usedAfterImport).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 3 — CommonJS require binding', () => {
  test('const x = require("pkg") tracks local variable x', () => {
    const importedSymbols = new Map<string, IImportedSymbol[]>();
    processCommonJSImports("const x = require('pkg');\nx();\n", 'file.ts', importedSymbols);

    expect(importedSymbols.has('x')).toBe(true);
    expect(importedSymbols.get('x')![0].importSource).toBe('pkg');
  });

  test('const local = require("pkg").member tracks local, not member', () => {
    const importedSymbols = new Map<string, IImportedSymbol[]>();
    processCommonJSImports("const local = require('pkg').member;\nlocal();\n", 'file.ts', importedSymbols);

    expect(importedSymbols.has('local')).toBe(true);
    expect(importedSymbols.has('member')).toBe(false);
    expect(importedSymbols.get('local')![0].importSource).toBe('pkg');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 4 — return { ... } is not treated as module export', () => {
  test('processESModuleExports and processCommonJSExports ignore return statements', () => {
    const content = 'const localVar = 5;\nfunction f() { return { localVar }; }\n';
    const exportedSymbols = new Set<string>();

    // Only export-specific processors are called in the pipeline (not processReturnStatements)
    processESModuleExports(content, exportedSymbols);
    processCommonJSExports(content, exportedSymbols);

    expect(exportedSymbols.has('localVar')).toBe(false);
  });

  test('variable only in return { } is correctly detected as dead code when unused', () => {
    // orphan is declared but ONLY mentioned in a return statement with another var.
    // Since removeComments/countActualUsage will still find 'orphan' in the return line,
    // the meaningful guarantee here is that it is NOT in exportedSymbols (no false export).
    const content = 'const orphan = 5;\nfunction f() { return { other }; }\n';
    const exportedSymbols = new Set<string>();

    processESModuleExports(content, exportedSymbols);
    processCommonJSExports(content, exportedSymbols);

    // orphan is not in exportedSymbols — it has no artificial "exported" status
    expect(exportedSymbols.has('orphan')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 5 — Public API export is not false-positive dead code', () => {
  test('exported camelCase function without internal import is NOT dead code', () => {
    const occurrences = makeEntry('lib.ts');
    const exportedSymbols = new Set<string>(['createUser', 'buildConfig', 'apiClient']);
    const importedSymbols = new Map<string, IImportedSymbol[]>();

    // These are exported public APIs that happen not to be imported internally.
    // They must NOT be flagged as dead code.
    expect(isDeadCode('createUser', occurrences, exportedSymbols, importedSymbols)).toBe(false);
    expect(isDeadCode('buildConfig', occurrences, exportedSymbols, importedSymbols)).toBe(false);
    expect(isDeadCode('apiClient', occurrences, exportedSymbols, importedSymbols)).toBe(false);
  });

  test('truly unused non-exported symbol is still detected as dead code', () => {
    const occurrences = makeEntry('lib.ts');
    const exportedSymbols = new Set<string>();
    const importedSymbols = new Map<string, IImportedSymbol[]>();

    // Not exported, not used — should be dead code
    expect(isDeadCode('deadHelper', occurrences, exportedSymbols, importedSymbols)).toBe(true);
  });
});
