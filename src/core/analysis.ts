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
 * Analyzes usages of names in files
 */
export function analyzeUsages(
  collectedNames: string[],
  files: Map<string, string>,
  deadMap: Record<string, IDeadCodeInfo>,
  cleanContentFn: (content: string) => string
): void {
  if (collectedNames.length === 0) {
    return;
  }

  for (const [_, fileContent] of files.entries()) {
    const withoutComments = cleanContentFn(fileContent);

    collectedNames.forEach(name => {
      const usageCount = countUsages(withoutComments, name);
      deadMap[name].count += usageCount;
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
  // Case 1: It appears only once (declared but not used)
  if (occurrences.count === 1) {
    return true;
  }

  // Case 2: It is used only in exports/returns (count=2 and in exportedSymbols)
  if (occurrences.count === 2 && exportedSymbols.has(name)) {
    return true;
  }

  // Case 3: It is exported and imported but not used beyond import
  if (
    occurrences.count === 3 &&
    exportedSymbols.has(name) &&
    importedSymbols.has(name)
  ) {
    return true;
  }

  // Case 4: It is imported and used only at that import location
  if (importedSymbols.has(name) && !(occurrences.count > 3)) {
    return true;
  }

  return false;
}
