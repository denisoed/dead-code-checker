// File System
export {
  getAllFiles,
  shouldIgnoreFolder,
  isValidFileExtension,
  readFileContent,
  removeComments,
  findLineNumber
} from './fileSystem';

// Declarations
export {
  Declaration,
  isBuiltInFunctionOrVariable,
  findDeclarations,
  findFunctionDeclarations,
  findFunctionExpressions,
  findArrowFunctions,
  findObjectMethods,
  findVariableDeclarations,
  findESModuleExports,
  findClassMethods,
  addDeclaration,
  saveExportedSymbols,
  processCommonJSExports,
  processESModuleExports,
  processCommonJSImports,
  processESModuleImports,
  processImportedNames,
  addImportedSymbol,
  processReturnStatements
} from './declarations';

// Analysis
export {
  countUsages,
  analyzeUsages,
  isDeadCode,
  analyzeSymbolUsage,
  UsageContext
} from './analysis';

// Reporting
export { createReport, displayReport } from './reporting';

// Main class
export { default as DeadCodeChecker } from './DeadCodeChecker';
