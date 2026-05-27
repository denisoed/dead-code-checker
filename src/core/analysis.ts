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
    
    // Skip lines that are declarations, imports, or exports
    if (
      trimmedLine.startsWith('import ') ||
      trimmedLine.startsWith('export ') ||
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

/** Separator used to form file-scoped deadMap keys: `filePath::symbolName` */
const KEY_SEPARATOR = '::';

/**
 * Extracts the symbol name from a file-scoped key (`filePath::name` → `name`).
 * Returns the key as-is when it has no separator (plain name from importedSymbols).
 */
export function extractNameFromKey(key: string): string {
  const idx = key.indexOf(KEY_SEPARATOR);
  return idx >= 0 ? key.slice(idx + KEY_SEPARATOR.length) : key;
}


/**
 * Initializes structure with zero counters for tracking dead code.
 * Must be called exactly once per analysis run, before analyzeUsagesBatch.
 */
export function initializeDeadCodeStructure(
  collectedKeys: string[],
  deadMap: Record<string, IDeadCodeInfo>,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, IImportedSymbol[]>
): void {
  collectedKeys.forEach(key => {
    const name = extractNameFromKey(key);
    if (deadMap[key]) {
      deadMap[key].declarationCount = deadMap[key].declaredIn.length;
      deadMap[key].exportCount = exportedSymbols.has(name) ? 1 : 0;
      deadMap[key].importCount = importedSymbols.has(name)
        ? importedSymbols.get(name)!.length
        : 0;
      deadMap[key].usageCount = 0;
      deadMap[key].exportedFrom = [];
      deadMap[key].importedIn = [];
    }
  });
}

/**
 * Populates exportedFrom and importedIn for each file-scoped deadMap entry.
 * Import attribution uses basename matching: imports whose source resolves to the
 * same basename as the declaring file are attributed to that declaration.
 * When there is only one declaration for a name, all imports are attributed to it.
 */
export function populateExportImportInfo(
  collectedKeys: string[],
  deadMap: Record<string, IDeadCodeInfo>,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, IImportedSymbol[]>
): void {
  // Build name → [keys] map to detect how many files declare each name
  const nameToKeys = new Map<string, string[]>();
  collectedKeys.forEach(key => {
    const name = extractNameFromKey(key);
    if (!nameToKeys.has(name)) nameToKeys.set(name, []);
    nameToKeys.get(name)!.push(key);
  });

  collectedKeys.forEach(key => {
    const name = extractNameFromKey(key);
    if (!deadMap[key]) return;

    const declaringFile = deadMap[key].declaredIn[0]?.filePath;

    // Exports
    if (exportedSymbols.has(name) && declaringFile) {
      if (!deadMap[key].exportedFrom.includes(declaringFile)) {
        deadMap[key].exportedFrom.push(declaringFile);
      }
    }

    // Imports — attribute based on import source basename matching
    if (importedSymbols.has(name)) {
      const allKeysForName = nameToKeys.get(name) ?? [];
      const isUniqueDeclaration = allKeysForName.length === 1;

      importedSymbols.get(name)!.forEach(importInfo => {
        let shouldAttribute = false;

        if (isUniqueDeclaration) {
          // Only one declaration for this name — attribute all imports to it
          shouldAttribute = true;
        } else if (declaringFile) {
          // Multiple declarations — use basename of import source vs declaring file
          const declaringBasename =
            declaringFile.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
          const importBasename =
            importInfo.importSource.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
          shouldAttribute =
            declaringBasename !== '' && declaringBasename === importBasename;
        }

        if (shouldAttribute) {
          deadMap[key].importedIn.push({
            filePath: importInfo.filePath,
            usedAfterImport: false
          });
        }
      });
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
  scriptSrcs: Set<string>,
  key: string
): void {
  const withoutComments = removeComments(fileContent);
  const isDeclaredInImportedScript = deadMap[key].declaredIn.some(decl => {
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
      deadMap[key].usageCount++;
    }
  }
}

/**
 * Updates information about usage after import.
 * key is a file-scoped deadMap key (filePath::symbolName).
 */
function updateUsageAfterImport(
  filePath: string,
  key: string,
  deadMap: Record<string, IDeadCodeInfo>,
  usageInfo: UsageContext
): void {
  const entry = deadMap[key];
  if (!entry) return;

  const importIndex = entry.importedIn.findIndex(item => item.filePath === filePath);

  if (importIndex !== -1) {
    // This file imports the symbol — mark as used if usage found
    if (usageInfo.usageCount > 0) {
      entry.importedIn[importIndex].usedAfterImport = true;
      entry.usageCount += usageInfo.usageCount;
    }
  } else if (entry.declaredIn[0]?.filePath === filePath) {
    // Local usage in the declaring file
    if (usageInfo.usageCount > 0) {
      entry.usageCount += usageInfo.usageCount;
    }
  }
}

/**
 * Analyzes actual symbol usage across a batch of files.
 * Requires initializeDeadCodeStructure and populateExportImportInfo to have been
 * called once before the first batch.
 */
export function analyzeUsagesBatch(
  collectedKeys: string[],
  files: Map<string, string>,
  deadMap: Record<string, IDeadCodeInfo>,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, IImportedSymbol[]>,
  onFileProcessed?: (filePath: string) => void
): void {
  const htmlFilesWithScripts = collectHtmlScriptDependencies(files);

  // Combine file-scoped deadMap keys with plain names from importedSymbols
  const allNamesToAnalyze = new Set([
    ...collectedKeys,
    ...Array.from(importedSymbols.keys())
  ]);

  for (const [filePath, fileContent] of files.entries()) {
    const withoutComments = removeComments(fileContent);

    allNamesToAnalyze.forEach(keyOrName => {
      const isFileScoped = keyOrName.includes(KEY_SEPARATOR);
      const name = isFileScoped ? extractNameFromKey(keyOrName) : keyOrName;

      // For HTML files, check both inline scripts and imported scripts
      if (filePath.endsWith('.html') && isFileScoped && deadMap[keyOrName]) {
        const scriptSrcs = htmlFilesWithScripts.get(filePath) || new Set();
        analyzeHtmlFileUsage(fileContent, name, deadMap, scriptSrcs, keyOrName);
      }

      // Regular file analysis
      const isExported = exportedSymbols.has(name);
      const isImported =
        importedSymbols.has(name) &&
        importedSymbols.get(name)!.some(importInfo => importInfo.filePath === filePath);

      // If the symbol was imported with an alias (import { a as b }), search by local binding name
      let searchName = name;
      if (isImported) {
        const importInfo = importedSymbols.get(name)!.find(i => i.filePath === filePath);
        if (importInfo?.localName) {
          searchName = importInfo.localName;
        }
      }

      const usageInfo = analyzeSymbolUsage(
        withoutComments,
        searchName,
        isExported,
        isImported
      );

      // Update deadMap usage for file-scoped declared symbols
      if (isFileScoped && deadMap[keyOrName]) {
        updateUsageAfterImport(filePath, keyOrName, deadMap, usageInfo);
      }

      // Update importedSymbols usage tracking (always by plain name)
      if (importedSymbols.has(name)) {
        updateImportedSymbolUsage(filePath, name, importedSymbols, usageInfo);
      }
    });

    if (onFileProcessed) {
      onFileProcessed(filePath);
    }
  }
}

/**
 * Analyzes usages of names in files.
 * Calls initializeDeadCodeStructure, populateExportImportInfo, and analyzeUsagesBatch
 * in sequence. For batch processing (to keep event loop responsive), call these three
 * functions separately via DeadCodeChecker.analyzeUsagesAsync.
 */
export function analyzeUsages(
  collectedKeys: string[],
  files: Map<string, string>,
  deadMap: Record<string, IDeadCodeInfo>,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, IImportedSymbol[]>,
  onFileProcessed?: (filePath: string) => void
): void {
  if (collectedKeys.length === 0) {
    return;
  }

  initializeDeadCodeStructure(collectedKeys, deadMap, exportedSymbols, importedSymbols);
  populateExportImportInfo(collectedKeys, deadMap, exportedSymbols, importedSymbols);
  analyzeUsagesBatch(collectedKeys, files, deadMap, exportedSymbols, importedSymbols, onFileProcessed);
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

  // Case 3: Declared, exported, but not imported internally.
  // An exported symbol without internal consumers is NOT considered dead code —
  // it may be a public API consumed by external packages or users of the library.
  if (
    exportedSymbols.has(name) &&
    (!importedSymbols.has(name) || importedSymbols.get(name)!.length === 0)
  ) {
    return false;
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
