import { IDeadCodeInfo } from '../interfaces';

/**
 * Counts the occurrences of a name in the content
 */
export function countUsages(cleanedContent: string, name: string): number {
  const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
  const matches = cleanedContent.match(usageRegex);
  return matches ? matches.length : 0;
}

/**
 * Determines the exact usage of a symbol in different contexts
 */
export interface UsageContext {
  totalCount: number; // Total number of mentions
  declarationCount: number; // In declarations
  exportCount: number; // In export statements
  importCount: number; // In import statements
  usageCount: number; // Actual usage (calls, reads, etc.)
}

/**
 * Analyzes the usage context of a symbol
 */
export function analyzeSymbolUsage(
  content: string,
  name: string,
  isExported: boolean,
  isImported: boolean
): UsageContext {
  const totalCount = countUsages(content, name);
  let declarationCount = 0;
  let exportCount = 0;
  let importCount = 0;

  // Count declarations
  const declarationsRegex = new RegExp(
    `(function\\s+${name}|class\\s+${name}|const\\s+${name}|let\\s+${name}|var\\s+${name})`,
    'g'
  );
  declarationCount = (content.match(declarationsRegex) || []).length;

  // Count exports
  if (isExported) {
    const exportRegex = new RegExp(`export.*${name}`, 'g');
    exportCount = (content.match(exportRegex) || []).length;
  }

  // Count imports
  if (isImported) {
    const importRegex = new RegExp(`import.*${name}`, 'g');
    importCount = (content.match(importRegex) || []).length;
  }

  // Calculate actual usage
  const usageCount = Math.max(
    0,
    totalCount - declarationCount - exportCount - importCount
  );

  return {
    totalCount,
    declarationCount,
    exportCount,
    importCount,
    usageCount
  };
}

/**
 * Analyzes usages of names in files
 */
export function analyzeUsages(
  collectedNames: string[],
  files: Map<string, string>,
  deadMap: Record<string, IDeadCodeInfo>,
  cleanContentFn: (content: string) => string,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, string[]>
): void {
  if (collectedNames.length === 0) {
    return;
  }

  // Initialize structure with zero counters
  collectedNames.forEach(name => {
    if (deadMap[name]) {
      deadMap[name].declarationCount = deadMap[name].declaredIn.length;
      deadMap[name].exportCount = exportedSymbols.has(name) ? 1 : 0;
      deadMap[name].importCount = importedSymbols.has(name)
        ? importedSymbols.get(name)!.length
        : 0;
      deadMap[name].usageCount = 0;
      deadMap[name].exportedFrom = [];
      deadMap[name].importedIn = [];
    }
  });

  // Fill information about exports and imports
  collectedNames.forEach(name => {
    if (deadMap[name]) {
      // Exports
      if (exportedSymbols.has(name)) {
        deadMap[name].declaredIn.forEach(decl => {
          if (!deadMap[name].exportedFrom.includes(decl.filePath)) {
            deadMap[name].exportedFrom.push(decl.filePath);
          }
        });
      }

      // Imports
      if (importedSymbols.has(name)) {
        importedSymbols.get(name)!.forEach(filePath => {
          deadMap[name].importedIn.push({
            filePath,
            usedAfterImport: false // Default to false, meaning not used
          });
        });
      }
    }
  });

  // Analyze usage after import
  for (const [filePath, fileContent] of files.entries()) {
    const withoutComments = cleanContentFn(fileContent);

    collectedNames.forEach(name => {
      if (!deadMap[name]) return;
      // Analyze usage context
      const isExported = exportedSymbols.has(name);
      const isImported =
        importedSymbols.has(name) &&
        importedSymbols.get(name)!.includes(filePath);

      const usageInfo = analyzeSymbolUsage(
        withoutComments,
        name,
        isExported,
        isImported
      );

      // Update information about usage after import
      const importIndex = deadMap[name].importedIn.findIndex(
        item => item.filePath === filePath
      );

      if (importIndex !== -1) {
        // Found record about import of the symbol in this file
        if (usageInfo.usageCount > 0) {
          deadMap[name].importedIn[importIndex].usedAfterImport = true;
          deadMap[name].usageCount += usageInfo.usageCount;
        }
      } else if (
        deadMap[name].declaredIn.some(decl => decl.filePath === filePath)
      ) {
        // Symbol declared in this file
        if (usageInfo.usageCount > 0) {
          deadMap[name].usageCount += usageInfo.usageCount;
        }
      }
    });
  }
}

/**
 * Determines if a code is considered "dead"
 */
export function isDeadCode(
  name: string,
  occurrences: IDeadCodeInfo,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, string[]>
): boolean {
  // Debug output
  console.log(
    `Analyzing ${name}:`,
    JSON.stringify(
      {
        usageCount: occurrences.usageCount,
        declarationCount: occurrences.declarationCount,
        exportCount: occurrences.exportCount,
        importCount: occurrences.importCount,
        exported: exportedSymbols.has(name),
        imported: importedSymbols.has(name),
        importedIn: occurrences.importedIn
      },
      null,
      2
    )
  );

  // Case 1: Imported but not exported — always dead/incorrect
  if (importedSymbols.has(name) && !exportedSymbols.has(name)) {
    return true;
  }

  // Case 2: Declared but not used anywhere
  if (occurrences.usageCount === 0 && !exportedSymbols.has(name)) {
    return true;
  }

  // Case 3: Declared, exported, but not imported and not used locally
  if (
    occurrences.usageCount === 0 &&
    exportedSymbols.has(name) &&
    (!importedSymbols.has(name) || importedSymbols.get(name)!.length === 0)
  ) {
    return true;
  }

  // Case 4: Exported and imported, but not used after import
  if (
    exportedSymbols.has(name) &&
    importedSymbols.has(name) &&
    occurrences.importedIn.length > 0 &&
    occurrences.importedIn.every(item => !item.usedAfterImport)
  ) {
    return true;
  }

  return false;
}
