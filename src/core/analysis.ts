import { REGEX } from '../config';
import { IDeadCodeInfo, IImportedSymbol } from '../interfaces';
import { removeComments } from './fileSystem';

/**
 * Determines if an import source is an external package
 * External packages are npm modules that don't use relative paths
 */
export function isExternalPackage(importSource: string): boolean {
  // External packages don't start with relative paths (. or ..)
  // and don't start with absolute paths (/) 
  // and are not path aliases (starting with @/)
  return !importSource.startsWith('.') && 
         !importSource.startsWith('/') && 
         !importSource.startsWith('@/');
}

/**
 * Counts the occurrences of a name in the content
 */
export function countUsages(cleanedContent: string, name: string): number {
  const regex = new RegExp(`\\b${name}\\b`, 'g');
  return (cleanedContent.match(regex) || []).length;
}

/**
 * Removes string literals and comments from a line of code
 * Preserves template literal interpolations (${...})
 */
function removeStringsAndComments(line: string): string {
  let result = '';
  let i = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let inComment = false;
  let braceDepth = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    // Handle single line comments
    if (!inSingleQuote && !inDoubleQuote && !inTemplate && char === '/' && nextChar === '/') {
      inComment = true;
      i += 2;
      continue;
    }
    
    if (inComment) {
      i++;
      continue;
    }
    
    // Handle string literals
    if (!inDoubleQuote && !inTemplate && char === "'") {
      inSingleQuote = !inSingleQuote;
      i++;
      continue;
    }
    
    if (!inSingleQuote && !inTemplate && char === '"') {
      inDoubleQuote = !inDoubleQuote;
      i++;
      continue;
    }
    
    if (!inSingleQuote && !inDoubleQuote && char === '`') {
      inTemplate = !inTemplate;
      braceDepth = 0;
      i++;
      continue;
    }
    
    // Handle template literal interpolations ${...}
    if (inTemplate) {
      if (char === '$' && nextChar === '{') {
        braceDepth = 1;
        result += ' '; // Add space to maintain word boundaries
        i += 2;
        continue;
      }
      
      if (braceDepth > 0) {
        if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
          if (braceDepth === 0) {
            result += ' '; // Add space to maintain word boundaries
            i++;
            continue;
          }
        }
        // Include characters inside ${...}
        result += char;
      }
      i++;
      continue;
    }
    
    // If we're not inside any string, add the character
    if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
      result += char;
    }
    
    i++;
  }
  
  return result;
}

/**
 * Counts actual usage of a symbol excluding declarations, imports, and exports
 */
export function countActualUsage(content: string, name: string): number {
  const lines = content.split('\n');
  let usageCount = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip lines that declare, import, or export THIS SPECIFIC symbol
    if (
      // Skip import lines that contain this symbol
      (trimmedLine.startsWith('import ') && trimmedLine.includes(name)) ||
      // Skip export lines only if they are exporting THIS symbol
      (trimmedLine.startsWith('export ') && (
        trimmedLine.includes(`export ${name}`) || 
        trimmedLine.includes(`export { ${name}`) ||
        trimmedLine.includes(`export {${name}`) ||
        trimmedLine.includes(`export * as ${name}`) ||
        trimmedLine.includes(`export default ${name}`)
      )) ||
      // Skip declaration lines for this symbol
      trimmedLine.includes(`function ${name}`) ||
      trimmedLine.includes(`class ${name}`) ||
      trimmedLine.includes(`const ${name}`) ||
      trimmedLine.includes(`let ${name}`) ||
      trimmedLine.includes(`var ${name}`)
    ) {
      continue;
    }
    
    // Remove strings and comments before analyzing usage
    const cleanLine = removeStringsAndComments(line);
    
    // Enhanced usage detection with fallback to general pattern
    let usageFound = false;
    
    // 1. Constructor usage: new ClassName()
    const constructorRegex = new RegExp(`\\bnew\\s+${name}\\s*\\(`, 'g');
    if (cleanLine.match(constructorRegex)) {
      usageCount++;
      usageFound = true;
    }
    
    // 2. TypeScript type usage patterns
    const typeUsagePatterns = [
      `:\\s*${name}\\b`,        // : TypeName
      `<${name}>`,              // <TypeName>
      `\\b${name}\\[\\]`,       // TypeName[]
      `Array<${name}>`,         // Array<TypeName>
      `\\b${name}\\s*\\|`,      // TypeName |
      `\\|\\s*${name}\\b`,      // | TypeName
      `\\b${name}\\s*&`,        // TypeName &
      `&\\s*${name}\\b`,        // & TypeName
      `extends\\s+${name}\\b`,  // extends TypeName
      `implements\\s+${name}\\b` // implements TypeName
    ];
    
    for (const pattern of typeUsagePatterns) {
      const regex = new RegExp(pattern, 'g');
      if (cleanLine.match(regex)) {
        usageCount++;
        usageFound = true;
        break; // Found one type usage pattern, that's enough for this line
      }
    }
    
    // 3. If no specific patterns found, use general word boundary search on clean line
    if (!usageFound) {
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      const matches = cleanLine.match(regex) || [];
      usageCount += matches.length;
    }
  }
  
  return usageCount;
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

  // Use more accurate usage counting that excludes declaration/import/export lines
  const usageCount = countActualUsage(content, name);

  return {
    totalCount,
    declarationCount,
    exportCount,
    importCount,
    usageCount
  };
}

/**
 * Initializes structure with zero counters for tracking dead code
 */
function initializeDeadCodeStructure(
  collectedNames: string[],
  deadMap: Record<string, IDeadCodeInfo>,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, IImportedSymbol[]>
): void {
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
}

/**
 * Populates information about exports and imports
 */
function populateExportImportInfo(
  collectedNames: string[],
  deadMap: Record<string, IDeadCodeInfo>,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, IImportedSymbol[]>
): void {
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
        importedSymbols.get(name)!.forEach(importInfo => {
          deadMap[name].importedIn.push({
            filePath: importInfo.filePath,
            usedAfterImport: false // Default to false, meaning not used
          });
        });
      }
    }
  });
}

/**
 * Collects HTML files and their script dependencies
 */
function collectHtmlScriptDependencies(
  files: Map<string, string>
): Map<string, Set<string>> {
  const htmlFilesWithScripts = new Map<string, Set<string>>();

  for (const [filePath, fileContent] of files.entries()) {
    const withoutComments = removeComments(fileContent);
    if (filePath.endsWith('.html')) {
      const scriptMatches = Array.from(
        withoutComments.matchAll(REGEX.HTML_SCRIPT_SRC)
      );
      const scriptSrcs = new Set(scriptMatches.map(match => match[1]));
      htmlFilesWithScripts.set(filePath, scriptSrcs);
    }
  }

  return htmlFilesWithScripts;
}

/**
 * Analyzes usage in HTML files
 */
function analyzeHtmlFileUsage(
  fileContent: string,
  name: string,
  deadMap: Record<string, IDeadCodeInfo>,
  scriptSrcs: Set<string>
): void {
  const withoutComments = removeComments(fileContent);
  const isDeclaredInImportedScript = deadMap[name].declaredIn.some(decl => {
    const declaredFileName = decl.filePath.split('/').pop() || '';
    return scriptSrcs.has(declaredFileName);
  });

  // Only count usage if the variable is defined in an imported script
  if (isDeclaredInImportedScript) {
    const scriptContent = Array.from(
      withoutComments.matchAll(REGEX.HTML_SCRIPT_CONTENT)
    )
      .map(match => match[1])
      .join('\n');

    if (scriptContent.includes(name)) {
      deadMap[name].usageCount++;
    }
  }
}

/**
 * Updates information about usage after import
 */
function updateUsageAfterImport(
  filePath: string,
  name: string,
  deadMap: Record<string, IDeadCodeInfo>,
  usageInfo: UsageContext
): void {
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
}

/**
 * Analyzes usages of names in files
 */
export function analyzeUsages(
  collectedNames: string[],
  files: Map<string, string>,
  deadMap: Record<string, IDeadCodeInfo>,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, IImportedSymbol[]>,
  onFileProcessed?: (filePath: string) => void
): void {
  if (collectedNames.length === 0) {
    return;
  }

  // Initialize structure with zero counters
  initializeDeadCodeStructure(
    collectedNames,
    deadMap,
    exportedSymbols,
    importedSymbols
  );

  // Fill information about exports and imports
  populateExportImportInfo(
    collectedNames,
    deadMap,
    exportedSymbols,
    importedSymbols
  );

  // Track HTML files that have script imports
  const htmlFilesWithScripts = collectHtmlScriptDependencies(files);

  // Analyze usage after import for all names (declared + imported)
  const allNamesToAnalyze = new Set([
    ...collectedNames,
    ...Array.from(importedSymbols.keys())
  ]);

  for (const [filePath, fileContent] of files.entries()) {
    const withoutComments = removeComments(fileContent);

    allNamesToAnalyze.forEach(name => {
      // For HTML files, check both inline scripts and imported scripts
      if (filePath.endsWith('.html') && deadMap[name]) {
        const scriptSrcs = htmlFilesWithScripts.get(filePath) || new Set();
        analyzeHtmlFileUsage(fileContent, name, deadMap, scriptSrcs);
      }

      // Regular file analysis
      const isExported = exportedSymbols.has(name);
      const isImported =
        importedSymbols.has(name) &&
        importedSymbols.get(name)!.some(importInfo => importInfo.filePath === filePath);

      const usageInfo = analyzeSymbolUsage(
        withoutComments,
        name,
        isExported,
        isImported
      );

      // Update information about usage after import
      if (deadMap[name]) {
        updateUsageAfterImport(filePath, name, deadMap, usageInfo);
      }
      
      // Also update importedSymbols if this symbol is imported in this file
      if (importedSymbols.has(name)) {
        updateImportedSymbolUsage(filePath, name, importedSymbols, usageInfo);
      }
    });

    // Call progress callback for each processed file
    if (onFileProcessed) {
      onFileProcessed(filePath);
    }
  }
}

/**
 * Updates usage information for imported symbols that are not in deadMap
 */
function updateImportedSymbolUsage(
  filePath: string,
  name: string,
  importedSymbols: Map<string, IImportedSymbol[]>,
  usageInfo: UsageContext
): void {
  if (!importedSymbols.has(name)) return;

  const importInfos = importedSymbols.get(name)!;
  const importIndex = importInfos.findIndex(info => info.filePath === filePath);

  if (importIndex !== -1 && usageInfo.usageCount > 0) {
    // Mark as used after import
    importInfos[importIndex].usedAfterImport = true;
  }
}

/**
 * Determines if a code is considered "dead"
 */
export function isDeadCode(
  name: string,
  occurrences: IDeadCodeInfo,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, IImportedSymbol[]>
): boolean {
  // Case 1: Imported but not exported — check if it's an external package
  if (importedSymbols.has(name) && !exportedSymbols.has(name)) {
    const importInfos = importedSymbols.get(name)!;
    // If ALL imports are from external packages, don't consider it dead code
    const allFromExternalPackages = importInfos.every(importInfo => 
      isExternalPackage(importInfo.importSource)
    );
    
    if (allFromExternalPackages) {
      // For external packages, only consider dead if not used after import
      return occurrences.importedIn.length > 0 && 
             occurrences.importedIn.every(item => !item.usedAfterImport);
    }
    
    // For local imports, it's dead if not found
    return true;
  }

  // Case 2: Declared but not used anywhere
  if (occurrences.usageCount === 0 && !exportedSymbols.has(name)) {
    return true;
  }

  // Case 3: Declared, exported, but not imported and not used locally
  // Exception: Don't mark as dead code if it's likely a component or module export
  if (
    occurrences.usageCount === 0 &&
    exportedSymbols.has(name) &&
    (!importedSymbols.has(name) || importedSymbols.get(name)!.length === 0)
  ) {
    // Check if this might be a React component or other intended export
    const isLikelyComponent = name.charAt(0) === name.charAt(0).toUpperCase(); // PascalCase
    if (isLikelyComponent) {
      return false; // Don't mark components as dead code if they are exported
    }
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
