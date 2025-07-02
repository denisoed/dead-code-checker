import { REGEX, IGNORED_NAMES } from '../config';
import { findLineNumber, removeComments } from './fileSystem';
import { IImportedSymbol } from '../interfaces';

/**
 * Type for declaration with name and line number
 */
export interface Declaration {
  name: string;
  line: number;
}

/**
 * Checks if a name is a built-in function or variable
 */
export function isBuiltInFunctionOrVariable(
  name: string,
  ignoreNames?: string[]
): boolean {
  return [...IGNORED_NAMES, ...(ignoreNames || [])].includes(name);
}

/**
 * Finds all declarations in a file
 */
export function findDeclarations(
  fileContent: string,
  _filePath: string,
  isIgnoredFn: (name: string) => boolean
): Declaration[] {
  // Clean content from comments to avoid false positives
  const cleanedContent = removeComments(fileContent);

  // Use a Map to store declarations with name as key to prevent duplicates
  const declarationMap = new Map<string, number>();

  // Process ES module exports
  findESModuleExports(cleanedContent, declarationMap, isIgnoredFn);

  // Process line by line for most patterns
  const lines = cleanedContent.split('\n');
  let lineNumber = 0;

  lines.forEach(lineContent => {
    lineNumber++;

    findFunctionDeclarations(
      lineContent,
      lineNumber,
      declarationMap,
      isIgnoredFn
    );
    findFunctionExpressions(
      lineContent,
      lineNumber,
      declarationMap,
      isIgnoredFn
    );
    findArrowFunctions(lineContent, lineNumber, declarationMap, isIgnoredFn);
    findObjectMethods(lineContent, lineNumber, declarationMap, isIgnoredFn);
    findVariableDeclarations(
      lineContent,
      lineNumber,
      declarationMap,
      isIgnoredFn
    );
  });

  // Process class methods that may span multiple lines
  findClassMethods(cleanedContent, declarationMap, isIgnoredFn);

  // Convert the map to the required array format
  const declaredNames: Declaration[] = [];
  declarationMap.forEach((line, name) => {
    declaredNames.push({ name, line });
  });

  return declaredNames;
}

/**
 * Finds function declarations in a line
 */
export function findFunctionDeclarations(
  lineContent: string,
  lineNumber: number,
  declarationMap: Map<string, number>,
  isIgnoredFn: (name: string) => boolean
): void {
  let match;

  // Reset regex index
  REGEX.FUNCTION.lastIndex = 0;

  // Find function declarations
  while ((match = REGEX.FUNCTION.exec(lineContent)) !== null) {
    addDeclaration(match[1], lineNumber, declarationMap, isIgnoredFn);
  }
}

/**
 * Finds function expressions in a line
 */
export function findFunctionExpressions(
  lineContent: string,
  lineNumber: number,
  declarationMap: Map<string, number>,
  isIgnoredFn: (name: string) => boolean
): void {
  let match;

  // Reset regex index
  REGEX.FUNCTION_EXPRESSION.lastIndex = 0;

  // Find function expressions
  while ((match = REGEX.FUNCTION_EXPRESSION.exec(lineContent)) !== null) {
    addDeclaration(match[1], lineNumber, declarationMap, isIgnoredFn);
  }
}

/**
 * Finds arrow functions in a line
 */
export function findArrowFunctions(
  lineContent: string,
  lineNumber: number,
  declarationMap: Map<string, number>,
  isIgnoredFn: (name: string) => boolean
): void {
  let match;

  // Reset regex index
  REGEX.ARROW_FUNCTION.lastIndex = 0;

  // Find arrow functions
  while ((match = REGEX.ARROW_FUNCTION.exec(lineContent)) !== null) {
    addDeclaration(match[1], lineNumber, declarationMap, isIgnoredFn);
  }
}

/**
 * Finds object methods in a line
 */
export function findObjectMethods(
  lineContent: string,
  lineNumber: number,
  declarationMap: Map<string, number>,
  isIgnoredFn: (name: string) => boolean
): void {
  let match;

  // Reset regex index
  REGEX.OBJECT_METHOD.lastIndex = 0;

  // Find object methods
  while ((match = REGEX.OBJECT_METHOD.exec(lineContent)) !== null) {
    addDeclaration(match[1], lineNumber, declarationMap, isIgnoredFn);
  }
}

/**
 * Finds variable declarations in a line
 */
export function findVariableDeclarations(
  lineContent: string,
  lineNumber: number,
  declarationMap: Map<string, number>,
  isIgnoredFn: (name: string) => boolean
): void {
  let match;

  // Reset regex index
  REGEX.VARIABLE.lastIndex = 0;

  // Find variable declarations
  while ((match = REGEX.VARIABLE.exec(lineContent)) !== null) {
    addDeclaration(match[1], lineNumber, declarationMap, isIgnoredFn);
  }
}

/**
 * Finds ES module exports in content
 */
export function findESModuleExports(
  cleanedContent: string,
  declarationMap: Map<string, number>,
  isIgnoredFn: (name: string) => boolean
): void {
  let match;

  // Reset regex index
  REGEX.ES_MODULE_EXPORT.lastIndex = 0;

  // Find ES module exports
  while ((match = REGEX.ES_MODULE_EXPORT.exec(cleanedContent)) !== null) {
    const lineNumber = findLineNumber(cleanedContent, match.index);
    addDeclaration(match[1], lineNumber, declarationMap, isIgnoredFn);
  }

  // Reset regex index
  REGEX.EXPORT_DEFAULT.lastIndex = 0;

  // Find export default
  while ((match = REGEX.EXPORT_DEFAULT.exec(cleanedContent)) !== null) {
    if (match[1]) {
      const lineNumber = findLineNumber(cleanedContent, match.index);
      addDeclaration(match[1], lineNumber, declarationMap, isIgnoredFn);
    }
  }
}

/**
 * Finds class methods in content
 */
export function findClassMethods(
  cleanedContent: string,
  declarationMap: Map<string, number>,
  isIgnoredFn: (name: string) => boolean
): void {
  let match;

  // Reset regex index
  REGEX.CLASS_METHOD.lastIndex = 0;

  // Find class methods
  while ((match = REGEX.CLASS_METHOD.exec(cleanedContent)) !== null) {
    const lineNumber = findLineNumber(cleanedContent, match.index);
    addDeclaration(match[1], lineNumber, declarationMap, isIgnoredFn);
  }
}

/**
 * Adds a declaration to the map if not already present
 */
export function addDeclaration(
  name: string,
  line: number,
  declarationMap: Map<string, number>,
  isIgnoredFn: (name: string) => boolean
): void {
  if (!isIgnoredFn(name) && !declarationMap.has(name)) {
    declarationMap.set(name, line);
  }
}

/**
 * Saves exported symbols to the set
 */
export function saveExportedSymbols(
  content: string,
  exportedSymbols: Set<string>
): void {
  const matches = content.split(',') || [];
  matches.forEach(method => {
    method = method.trim().replace(':', '');
    if (method) {
      exportedSymbols.add(method);
    }
  });
}

/**
 * Processes CommonJS exports
 */
export function processCommonJSExports(
  fileContent: string,
  exportedSymbols: Set<string>
): void {
  let match;

  // Process module.exports = { ... }
  REGEX.MODULE_EXPORTS.lastIndex = 0;
  while ((match = REGEX.MODULE_EXPORTS.exec(fileContent)) !== null) {
    saveExportedSymbols(match[1], exportedSymbols);
  }

  // Process exports.name = ...
  REGEX.EXPORTS_PROPERTY.lastIndex = 0;
  while ((match = REGEX.EXPORTS_PROPERTY.exec(fileContent)) !== null) {
    exportedSymbols.add(match[1]);
  }
}

/**
 * Processes ES module exports
 */
export function processESModuleExports(
  fileContent: string,
  exportedSymbols: Set<string>
): void {
  let match;

  // Process export const/let/var/function/class name
  REGEX.ES_MODULE_EXPORT.lastIndex = 0;
  while ((match = REGEX.ES_MODULE_EXPORT.exec(fileContent)) !== null) {
    exportedSymbols.add(match[1]);
  }

  // Process export { ... }
  REGEX.ES_OBJECT_EXPORT.lastIndex = 0;
  while ((match = REGEX.ES_OBJECT_EXPORT.exec(fileContent)) !== null) {
    saveExportedSymbols(match[1], exportedSymbols);
  }

  // Process export default ...
  REGEX.EXPORT_DEFAULT.lastIndex = 0;
  while ((match = REGEX.EXPORT_DEFAULT.exec(fileContent)) !== null) {
    if (match[1]) {
      exportedSymbols.add(match[1]);
    }
  }
}

/**
 * Processes CommonJS imports
 */
export function processCommonJSImports(
  fileContent: string,
  filePath: string,
  importedSymbols: Map<string, IImportedSymbol[]>
): void {
  let match;

  // Process const { name } = require('...')
  REGEX.REQUIRE_DESTRUCTURING.lastIndex = 0;
  while ((match = REGEX.REQUIRE_DESTRUCTURING.exec(fileContent)) !== null) {
    processImportedNames(match[1], filePath, match[2], importedSymbols);
  }

  // Process const name = require('...').property
  REGEX.REQUIRE_DIRECT.lastIndex = 0;
  while ((match = REGEX.REQUIRE_DIRECT.exec(fileContent)) !== null) {
    if (match[3]) {
      addImportedSymbol(match[3], filePath, match[2], importedSymbols);
    }
  }
}

/**
 * Processes ES module imports
 */
export function processESModuleImports(
  fileContent: string,
  filePath: string,
  importedSymbols: Map<string, IImportedSymbol[]>
): void {
  let match;

  // Process import { name } from '...'
  REGEX.IMPORT_NAMED.lastIndex = 0;
  while ((match = REGEX.IMPORT_NAMED.exec(fileContent)) !== null) {
    processImportedNames(match[1], filePath, match[2], importedSymbols);
  }

  // Process import name from '...'
  REGEX.IMPORT_DEFAULT.lastIndex = 0;
  while ((match = REGEX.IMPORT_DEFAULT.exec(fileContent)) !== null) {
    addImportedSymbol(match[1], filePath, match[2], importedSymbols);
  }
}

/**
 * Processes imported names
 */
export function processImportedNames(
  namesString: string,
  filePath: string,
  importSource: string,
  importedSymbols: Map<string, IImportedSymbol[]>
): void {
  const importedNames = namesString.split(',').map(n => n.trim());
  importedNames.forEach(name => {
    // Handle "name as alias" pattern
    const parts = name.split(/\s+as\s+/);
    const actualName = parts[0].trim();
    if (actualName) {
      addImportedSymbol(actualName, filePath, importSource, importedSymbols);
    }
  });
}

/**
 * Adds an imported symbol to the map
 */
export function addImportedSymbol(
  name: string,
  filePath: string,
  importSource: string,
  importedSymbols: Map<string, IImportedSymbol[]>
): void {
  if (!importedSymbols.has(name)) {
    importedSymbols.set(name, []);
  }
  importedSymbols.get(name)?.push({
    filePath,
    importSource,
    usedAfterImport: false
  });
}

/**
 * Processes return statements
 */
export function processReturnStatements(
  fileContent: string,
  exportedSymbols: Set<string>
): void {
  let match;

  // Process return { ... }
  REGEX.RETURN_OBJECT.lastIndex = 0;
  while ((match = REGEX.RETURN_OBJECT.exec(fileContent)) !== null) {
    saveExportedSymbols(match[1], exportedSymbols);
  }
}
