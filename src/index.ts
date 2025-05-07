import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import cfonts from 'cfonts';
import {
  IGNORED_NAMES,
  DEFAULT_EXTENSIONS,
  START_TEXT,
  IGNORE_FOLDERS,
  REGEX
} from './config';
import { IDeadCodeInfo, IDeadCodeParams, IDeadCodeReport } from './interfaces';

class DeadCodeChecker {
  private filesPath: string = '.';
  private params: IDeadCodeParams | undefined;
  private deadMap: Record<string, IDeadCodeInfo> = {};
  private deadCodeFound: boolean = false;
  private reportList: IDeadCodeReport[] = [];
  private exportedSymbols: Set<string> = new Set();
  private importedSymbols: Map<string, string[]> = new Map(); // Map symbol name to files where imported

  constructor(filesPath: string, params?: IDeadCodeParams) {
    this.params = params;
    this.filesPath = filesPath;
  }

  // File system operations
  private getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    try {
      const files = fs.readdirSync(dirPath);
      files.forEach((file: string) => {
        const fullPath: string = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (!this.shouldIgnoreFolder(file)) {
            arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
          }
        } else if (this.isValidFileExtension(file)) {
          arrayOfFiles.push(fullPath);
        }
      });
      return arrayOfFiles;
    } catch (error) {
      return [];
    }
  }

  private shouldIgnoreFolder(folderName: string): boolean {
    return [...IGNORE_FOLDERS, ...(this.params?.ignoreFolders || [])].some(
      (pattern: string | RegExp) => {
        if (typeof pattern === 'string') {
          return folderName === pattern;
        } else if (pattern instanceof RegExp) {
          return pattern.test(folderName);
        }
        return false;
      }
    );
  }

  private isValidFileExtension(fileName: string): boolean {
    return DEFAULT_EXTENSIONS.some(ext => fileName.endsWith(ext));
  }

  private readFileContent(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return '';
    }
  }

  // Utility functions
  private removeComments(fileContent: string): string {
    return fileContent.replace(REGEX.COMMENTS, '');
  }

  private isBuiltInFunctionOrVariable(name: string): boolean {
    return [...IGNORED_NAMES, ...(this.params?.ignoreNames || [])].includes(
      name
    );
  }

  private findLineNumber(content: string, matchIndex: number): number {
    return (content.substring(0, matchIndex).match(/\n/g) || []).length + 1;
  }

  // Export/Import processing
  private saveExportedSymbols(content: string): void {
    const matches = content.split(',') || [];
    matches.forEach(method => {
      method = method.trim().replace(':', '');
      if (method) {
        this.exportedSymbols.add(method);
      }
    });
  }

  private processCommonJSExports(fileContent: string): void {
    let match;

    // Process module.exports = { ... }
    REGEX.MODULE_EXPORTS.lastIndex = 0;
    while ((match = REGEX.MODULE_EXPORTS.exec(fileContent)) !== null) {
      this.saveExportedSymbols(match[1]);
    }

    // Process exports.name = ...
    REGEX.EXPORTS_PROPERTY.lastIndex = 0;
    while ((match = REGEX.EXPORTS_PROPERTY.exec(fileContent)) !== null) {
      this.exportedSymbols.add(match[1]);
    }
  }

  private processESModuleExports(fileContent: string): void {
    let match;

    // Process export const/let/var/function/class name
    REGEX.ES_MODULE_EXPORT.lastIndex = 0;
    while ((match = REGEX.ES_MODULE_EXPORT.exec(fileContent)) !== null) {
      this.exportedSymbols.add(match[1]);
    }

    // Process export { ... }
    REGEX.ES_OBJECT_EXPORT.lastIndex = 0;
    while ((match = REGEX.ES_OBJECT_EXPORT.exec(fileContent)) !== null) {
      this.saveExportedSymbols(match[1]);
    }

    // Process export default ...
    REGEX.EXPORT_DEFAULT.lastIndex = 0;
    while ((match = REGEX.EXPORT_DEFAULT.exec(fileContent)) !== null) {
      if (match[1]) {
        this.exportedSymbols.add(match[1]);
      }
    }
  }

  private processCommonJSImports(fileContent: string, filePath: string): void {
    let match;

    // Process const { name } = require('...')
    REGEX.REQUIRE_DESTRUCTURING.lastIndex = 0;
    while ((match = REGEX.REQUIRE_DESTRUCTURING.exec(fileContent)) !== null) {
      this.processImportedNames(match[1], filePath);
    }

    // Process const name = require('...').property
    REGEX.REQUIRE_DIRECT.lastIndex = 0;
    while ((match = REGEX.REQUIRE_DIRECT.exec(fileContent)) !== null) {
      if (match[3]) {
        this.addImportedSymbol(match[3], filePath);
      }
    }
  }

  private processESModuleImports(fileContent: string, filePath: string): void {
    let match;

    // Process import { name } from '...'
    REGEX.IMPORT_NAMED.lastIndex = 0;
    while ((match = REGEX.IMPORT_NAMED.exec(fileContent)) !== null) {
      this.processImportedNames(match[1], filePath);
    }

    // Process import name from '...'
    REGEX.IMPORT_DEFAULT.lastIndex = 0;
    while ((match = REGEX.IMPORT_DEFAULT.exec(fileContent)) !== null) {
      this.addImportedSymbol(match[1], filePath);
    }
  }

  private processImportedNames(namesString: string, filePath: string): void {
    const importedNames = namesString.split(',').map(n => n.trim());
    importedNames.forEach(name => {
      // Handle "name as alias" pattern
      const parts = name.split(/\s+as\s+/);
      const actualName = parts[0].trim();
      if (actualName) {
        this.addImportedSymbol(actualName, filePath);
      }
    });
  }

  private addImportedSymbol(name: string, filePath: string): void {
    if (!this.importedSymbols.has(name)) {
      this.importedSymbols.set(name, []);
    }
    this.importedSymbols.get(name)?.push(filePath);
  }

  private processReturnStatements(fileContent: string): void {
    let match;

    // Process return { ... }
    REGEX.RETURN_OBJECT.lastIndex = 0;
    while ((match = REGEX.RETURN_OBJECT.exec(fileContent)) !== null) {
      this.saveExportedSymbols(match[1]);
    }
  }

  private processImportsAndExports(
    fileContent: string,
    filePath: string
  ): void {
    this.processCommonJSExports(fileContent);
    this.processESModuleExports(fileContent);
    this.processCommonJSImports(fileContent, filePath);
    this.processESModuleImports(fileContent, filePath);
    this.processReturnStatements(fileContent);
  }

  // Declaration processing
  private findFunctionDeclarations(
    lineContent: string,
    lineNumber: number,
    declarationMap: Map<string, number>
  ): void {
    let match;

    // Reset regex index
    REGEX.FUNCTION.lastIndex = 0;

    // Find function declarations
    while ((match = REGEX.FUNCTION.exec(lineContent)) !== null) {
      this.addDeclaration(match[1], lineNumber, declarationMap);
    }
  }

  private findFunctionExpressions(
    lineContent: string,
    lineNumber: number,
    declarationMap: Map<string, number>
  ): void {
    let match;

    // Reset regex index
    REGEX.FUNCTION_EXPRESSION.lastIndex = 0;

    // Find function expressions
    while ((match = REGEX.FUNCTION_EXPRESSION.exec(lineContent)) !== null) {
      this.addDeclaration(match[1], lineNumber, declarationMap);
    }
  }

  private findArrowFunctions(
    lineContent: string,
    lineNumber: number,
    declarationMap: Map<string, number>
  ): void {
    let match;

    // Reset regex index
    REGEX.ARROW_FUNCTION.lastIndex = 0;

    // Find arrow functions
    while ((match = REGEX.ARROW_FUNCTION.exec(lineContent)) !== null) {
      this.addDeclaration(match[1], lineNumber, declarationMap);
    }
  }

  private findObjectMethods(
    lineContent: string,
    lineNumber: number,
    declarationMap: Map<string, number>
  ): void {
    let match;

    // Reset regex index
    REGEX.OBJECT_METHOD.lastIndex = 0;

    // Find object methods
    while ((match = REGEX.OBJECT_METHOD.exec(lineContent)) !== null) {
      this.addDeclaration(match[1], lineNumber, declarationMap);
    }
  }

  private findVariableDeclarations(
    lineContent: string,
    lineNumber: number,
    declarationMap: Map<string, number>
  ): void {
    let match;

    // Reset regex index
    REGEX.VARIABLE.lastIndex = 0;

    // Find variable declarations
    while ((match = REGEX.VARIABLE.exec(lineContent)) !== null) {
      this.addDeclaration(match[1], lineNumber, declarationMap);
    }
  }

  private findESModuleExports(
    cleanedContent: string,
    declarationMap: Map<string, number>
  ): void {
    let match;

    // Reset regex index
    REGEX.ES_MODULE_EXPORT.lastIndex = 0;

    // Find ES module exports
    while ((match = REGEX.ES_MODULE_EXPORT.exec(cleanedContent)) !== null) {
      const lineNumber = this.findLineNumber(cleanedContent, match.index);
      this.addDeclaration(match[1], lineNumber, declarationMap);
    }

    // Reset regex index
    REGEX.EXPORT_DEFAULT.lastIndex = 0;

    // Find export default
    while ((match = REGEX.EXPORT_DEFAULT.exec(cleanedContent)) !== null) {
      if (match[1]) {
        const lineNumber = this.findLineNumber(cleanedContent, match.index);
        this.addDeclaration(match[1], lineNumber, declarationMap);
      }
    }
  }

  private findClassMethods(
    cleanedContent: string,
    declarationMap: Map<string, number>
  ): void {
    let match;

    // Reset regex index
    REGEX.CLASS_METHOD.lastIndex = 0;

    // Find class methods
    while ((match = REGEX.CLASS_METHOD.exec(cleanedContent)) !== null) {
      const lineNumber = this.findLineNumber(cleanedContent, match.index);
      this.addDeclaration(match[1], lineNumber, declarationMap);
    }
  }

  private addDeclaration(
    name: string,
    line: number,
    declarationMap: Map<string, number>
  ): void {
    if (!this.isBuiltInFunctionOrVariable(name) && !declarationMap.has(name)) {
      declarationMap.set(name, line);
    }
  }

  private getDeclaredNames(
    fileContent: string
  ): { name: string; line: number }[] {
    // Clean content from comments to avoid false positives
    const cleanedContent = this.removeComments(fileContent);

    // Use a Map to store declarations with name as key to prevent duplicates
    const declarationMap = new Map<string, number>();

    // Process ES module exports
    this.findESModuleExports(cleanedContent, declarationMap);

    // Process line by line for most patterns
    const lines = cleanedContent.split('\n');
    let lineNumber = 0;

    lines.forEach(lineContent => {
      lineNumber++;

      this.findFunctionDeclarations(lineContent, lineNumber, declarationMap);
      this.findFunctionExpressions(lineContent, lineNumber, declarationMap);
      this.findArrowFunctions(lineContent, lineNumber, declarationMap);
      this.findObjectMethods(lineContent, lineNumber, declarationMap);
      this.findVariableDeclarations(lineContent, lineNumber, declarationMap);
    });

    // Process class methods that may span multiple lines
    this.findClassMethods(cleanedContent, declarationMap);

    // Convert the map to the required array format
    const declaredNames: { name: string; line: number }[] = [];
    declarationMap.forEach((line, name) => {
      declaredNames.push({ name, line });
    });

    return declaredNames;
  }

  // Usage analysis
  private countUsages(cleanedContent: string, name: string): number {
    const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
    const matches = cleanedContent.match(usageRegex);
    return matches ? matches.length : 0;
  }

  private collectDeclarations(files: string[]): void {
    for (const filePath of files) {
      const fileContent = this.readFileContent(filePath);
      if (!fileContent) continue;

      const declaredNames = this.getDeclaredNames(fileContent);
      declaredNames.forEach(code => {
        if (typeof this.deadMap[code.name] !== 'object') {
          this.deadMap[code.name] = { count: 0, declaredIn: [] };
        }
        this.deadMap[code.name].declaredIn.push({
          filePath,
          line: code.line
        });
      });

      // Process imports and exports
      this.processImportsAndExports(fileContent, filePath);
    }
  }

  private analyzeUsages(files: Map<string, string>): void {
    const collectedNames = Object.keys(this.deadMap);
    if (collectedNames.length === 0) {
      return;
    }

    for (const [_, fileContent] of files.entries()) {
      const withoutComments = this.removeComments(fileContent);

      collectedNames.forEach(name => {
        const usageCount = this.countUsages(withoutComments, name);
        this.deadMap[name].count += usageCount;
      });
    }
  }

  private scanAndCheckFiles(): void {
    // Get all files to check
    const allFiles = this.getAllFiles(this.filesPath);
    const fileContents = new Map<string, string>();

    // Read file contents
    for (const filePath of allFiles) {
      const fileContent = this.readFileContent(filePath);
      if (fileContent) {
        fileContents.set(filePath, fileContent);
      }
    }

    // First phase: collect all declarations from all files
    this.collectDeclarations(allFiles);

    // Second phase: check usages in all files
    this.analyzeUsages(fileContents);
  }

  // Report generation
  private isDeadCode(name: string, occurrences: IDeadCodeInfo): boolean {
    // Case 1: It appears only once (declared but not used)
    if (occurrences.count === 1) {
      return true;
    }

    // Case 2: It is used only in exports/returns (count=2 and in exportedSymbols)
    if (occurrences.count === 2 && this.exportedSymbols.has(name)) {
      return true;
    }

    // Case 3: It is exported and imported but not used beyond import
    if (
      occurrences.count === 3 &&
      this.exportedSymbols.has(name) &&
      this.importedSymbols.has(name)
    ) {
      return true;
    }

    // Case 4: It is imported and used only at that import location
    if (this.importedSymbols.has(name) && !(occurrences.count > 3)) {
      return true;
    }

    return false;
  }

  private createReportFromDeadMap(): void {
    for (const name of Object.keys(this.deadMap)) {
      const occurrences = this.deadMap[name];

      if (this.isDeadCode(name, occurrences)) {
        this.deadCodeFound = true;
        occurrences.declaredIn.forEach(decl => {
          this.reportList.push({
            filePath: decl.filePath,
            line: decl.line,
            name: name
          });
        });
      }
    }
  }

  private createReportForMissingSymbols(): void {
    for (const [importedSymbol, files] of this.importedSymbols) {
      // Skip if we already processed this symbol
      if (this.deadMap[importedSymbol]) continue;

      // If it's imported but not in our declarations, it's likely a dead import
      this.deadCodeFound = true;

      // Add an entry for each file where this symbol was imported
      for (const filePath of files) {
        this.reportList.push({
          filePath,
          line: 0, // We don't have exact line information
          name: `${importedSymbol} (imported but not found)`
        });
      }
    }
  }

  private createReport(): void {
    // First pass: collect regular dead code
    this.createReportFromDeadMap();

    // Second pass: detect imported symbols that don't exist in declarations
    this.createReportForMissingSymbols();
  }

  private displayReport(): void {
    this.reportList.forEach(report => {
      console.log(
        `${chalk.red(report.filePath)}:${chalk.yellow(String(report.line))} - ${chalk.green(
          report.name
        )}\n`
      );
    });
  }

  // Public methods
  public getReport(): IDeadCodeReport[] {
    return this.reportList;
  }

  public async run(): Promise<void> {
    cfonts.say('Dead Code Checker', START_TEXT);

    this.scanAndCheckFiles();
    this.createReport();

    if (this.deadCodeFound) {
      this.displayReport();
      if (this.params?.ci) process.exit(1);
    } else {
      console.log(chalk.greenBright('✅ No dead code found!'));
    }
  }
}

export default DeadCodeChecker;
