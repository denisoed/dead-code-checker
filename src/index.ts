import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import cfonts from 'cfonts';
import {
  IGNORED_NAMES,
  DEFAULT_EXTENSIONS,
  START_TEXT,
  IGNORE_FOLDERS
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

  private getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    try {
      const files = fs.readdirSync(dirPath);
      files.forEach((file: string) => {
        const fullPath: string = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          const shouldIgnore = [
            ...IGNORE_FOLDERS,
            ...(this.params?.ignoreFolders || [])
          ].some((pattern: string | RegExp) => {
            if (typeof pattern === 'string') {
              return file === pattern;
            } else if (pattern instanceof RegExp) {
              return pattern.test(file);
            }
            return false;
          });
          if (!shouldIgnore) {
            arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
          }
        } else if (DEFAULT_EXTENSIONS.some(ext => file.endsWith(ext))) {
          arrayOfFiles.push(fullPath);
        }
      });
      return arrayOfFiles;
    } catch (error) {
      return [];
    }
  }

  private isBuiltInFunctionOrVariable(name: string) {
    return [...IGNORED_NAMES, ...(this.params?.ignoreNames || [])].includes(
      name
    );
  }

  private saveExportedSymbols(content: string) {
    const matches = content.split(',') || [];
    matches.forEach(method => {
      method = method.trim().replace(':', '');
      this.exportedSymbols.add(method);
    });
  }

  private processImportsAndExports(fileContent: string, filePath: string) {
    // CommonJS exports
    const moduleExportsRegex = /\bmodule\.exports\s*=\s*{([^}]*)}/g;
    const exportsPropertyRegex = /\bexports\.([a-zA-Z0-9_$]+)\s*=/g;

    // ES Module exports
    const esNamedExportRegex =
      /\bexport\s+(?:const|let|var|function|class)\s+([a-zA-Z0-9_$]+)/g;
    const esObjectExportRegex = /\bexport\s*{([^}]*)}/g;
    const exportDefaultRegex =
      /\bexport\s+default\s+(?:function|class)?\s*([a-zA-Z0-9_$]+)/g;

    // CommonJS imports
    const requireDestructuringRegex =
      /\bconst\s*{([^}]*)}\s*=\s*require\s*\(['"](.*?)['"]\)/g;
    const requireDirectRegex =
      /\bconst\s+([a-zA-Z0-9_$]+)\s*=\s*require\s*\(['"](.*?)['"]\)(?:\.([a-zA-Z0-9_$]+))?/g;

    // ES Module imports
    const importNamedRegex = /\bimport\s*{([^}]*)}\s*from\s*['"](.*?)['"];?/g;
    const importDefaultRegex =
      /\bimport\s+([a-zA-Z0-9_$]+)\s+from\s*['"](.*?)['"];?/g;

    // Return statements with objects
    const returnObjectRegex = /\breturn\s*{([^}]*)}/g;

    // Process CommonJS exports
    let match;
    while ((match = moduleExportsRegex.exec(fileContent)) !== null) {
      this.saveExportedSymbols(match[1]);
    }

    while ((match = exportsPropertyRegex.exec(fileContent)) !== null) {
      this.exportedSymbols.add(match[1]);
    }

    // Process ES Module exports
    while ((match = esNamedExportRegex.exec(fileContent)) !== null) {
      this.exportedSymbols.add(match[1]);
    }

    while ((match = esObjectExportRegex.exec(fileContent)) !== null) {
      this.saveExportedSymbols(match[1]);
    }

    while ((match = exportDefaultRegex.exec(fileContent)) !== null) {
      if (match[1]) {
        this.exportedSymbols.add(match[1]);
      }
    }

    // Process CommonJS imports
    while ((match = requireDestructuringRegex.exec(fileContent)) !== null) {
      const importedNames = match[1].split(',').map(n => n.trim());
      importedNames.forEach(name => {
        // Handle "name as alias" pattern
        const parts = name.split(/\s+as\s+/);
        const actualName = parts[0].trim();
        if (actualName) {
          if (!this.importedSymbols.has(actualName)) {
            this.importedSymbols.set(actualName, []);
          }
          this.importedSymbols.get(actualName)?.push(filePath);
        }
      });
    }

    while ((match = requireDirectRegex.exec(fileContent)) !== null) {
      if (match[3]) {
        // Handle const moduleName = require('module').propertyName
        if (!this.importedSymbols.has(match[3])) {
          this.importedSymbols.set(match[3], []);
        }
        this.importedSymbols.get(match[3])?.push(filePath);
      }
    }

    // Process ES Module imports
    while ((match = importNamedRegex.exec(fileContent)) !== null) {
      const importedNames = match[1].split(',').map(n => n.trim());
      importedNames.forEach(name => {
        // Handle "name as alias" pattern
        const parts = name.split(/\s+as\s+/);
        const actualName = parts[0].trim();
        if (actualName) {
          if (!this.importedSymbols.has(actualName)) {
            this.importedSymbols.set(actualName, []);
          }
          this.importedSymbols.get(actualName)?.push(filePath);
        }
      });
    }

    while ((match = importDefaultRegex.exec(fileContent)) !== null) {
      if (!this.importedSymbols.has(match[1])) {
        this.importedSymbols.set(match[1], []);
      }
      this.importedSymbols.get(match[1])?.push(filePath);
    }

    // Process return statements with objects
    while ((match = returnObjectRegex.exec(fileContent)) !== null) {
      this.saveExportedSymbols(match[1]);
    }
  }

  private getDeclaredNames(fileContent: string) {
    // Clean content from comments to avoid false positives
    const cleanedContent = this.removeComments(fileContent);

    // Regular functions: function name()
    const functionRegex = /\bfunction\s+([a-zA-Z0-9_$]+)\s*\(/g;

    // Function expressions: const/let/var name = function()
    const functionExpressionRegex =
      /\b(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*function\s*\(/g;

    // Arrow functions: const/let/var name = () =>
    const arrowFunctionRegex =
      /\b(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>/g;

    // Class methods: methodName() {} or methodName = () =>
    const classMethodRegex =
      /(?:^\s*|\s+)(?:async\s+)?([a-zA-Z0-9_$]+)\s*(?:\([^)]*\)\s*{|\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>)/gm;

    // Object methods: { methodName() {} or methodName: function() {} or methodName: () => {} }
    const objectMethodRegex =
      /(?:^\s*|\s+)(?:async\s+)?([a-zA-Z0-9_$]+)\s*(?:\([^)]*\)\s*{|:\s*function\s*\(|:\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>)/g;

    // Variable declarations: const/let/var name = or const/let/var name;
    const variableRegex =
      /\b(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*(?:=|;|\r?\n|$)/g;

    // ES Module exports
    const esModuleExportsRegex =
      /\bexport\s+(?:const|let|var|function|class)\s+([a-zA-Z0-9_$]+)/g;
    const exportDefaultRegex =
      /\bexport\s+default\s+(?:function|class)?\s*([a-zA-Z0-9_$]+)/g;

    // Use a Map to store declarations with name as key to prevent duplicates
    // The map will store the line number for each name
    const declarationMap = new Map<string, number>();

    // Process export statements
    let match;
    while ((match = esModuleExportsRegex.exec(cleanedContent)) !== null) {
      if (!this.isBuiltInFunctionOrVariable(match[1])) {
        // Find the line number
        const lineNumber =
          (cleanedContent.substring(0, match.index).match(/\n/g) || []).length +
          1;
        declarationMap.set(match[1], lineNumber);
      }
    }

    while ((match = exportDefaultRegex.exec(cleanedContent)) !== null) {
      if (match[1] && !this.isBuiltInFunctionOrVariable(match[1])) {
        const lineNumber =
          (cleanedContent.substring(0, match.index).match(/\n/g) || []).length +
          1;
        declarationMap.set(match[1], lineNumber);
      }
    }

    // Process all other declarations by lines for better line number tracking
    const lines = cleanedContent.split('\n');
    let lineNumber = 0;

    lines.forEach(lineContent => {
      lineNumber++;

      // Reset regex indices for each line
      functionRegex.lastIndex = 0;
      functionExpressionRegex.lastIndex = 0;
      arrowFunctionRegex.lastIndex = 0;
      variableRegex.lastIndex = 0;
      objectMethodRegex.lastIndex = 0;

      // Check for function declarations
      while ((match = functionRegex.exec(lineContent)) !== null) {
        if (
          !this.isBuiltInFunctionOrVariable(match[1]) &&
          !declarationMap.has(match[1])
        ) {
          declarationMap.set(match[1], lineNumber);
        }
      }

      // Check for function expressions
      while ((match = functionExpressionRegex.exec(lineContent)) !== null) {
        if (
          !this.isBuiltInFunctionOrVariable(match[1]) &&
          !declarationMap.has(match[1])
        ) {
          declarationMap.set(match[1], lineNumber);
        }
      }

      // Check for arrow functions
      while ((match = arrowFunctionRegex.exec(lineContent)) !== null) {
        if (
          !this.isBuiltInFunctionOrVariable(match[1]) &&
          !declarationMap.has(match[1])
        ) {
          declarationMap.set(match[1], lineNumber);
        }
      }

      // Check for object methods
      while ((match = objectMethodRegex.exec(lineContent)) !== null) {
        if (
          !this.isBuiltInFunctionOrVariable(match[1]) &&
          !declarationMap.has(match[1])
        ) {
          declarationMap.set(match[1], lineNumber);
        }
      }

      // Check for variable declarations
      while ((match = variableRegex.exec(lineContent)) !== null) {
        if (
          !this.isBuiltInFunctionOrVariable(match[1]) &&
          !declarationMap.has(match[1])
        ) {
          declarationMap.set(match[1], lineNumber);
        }
      }
    });

    // Class methods may span multiple lines, so we process them against the whole content
    classMethodRegex.lastIndex = 0;
    while ((match = classMethodRegex.exec(cleanedContent)) !== null) {
      if (
        !this.isBuiltInFunctionOrVariable(match[1]) &&
        !declarationMap.has(match[1])
      ) {
        const lineNumber =
          (cleanedContent.substring(0, match.index).match(/\n/g) || []).length +
          1;
        declarationMap.set(match[1], lineNumber);
      }
    }

    // Convert the map to the required array format
    const declaredNames: { name: string; line: number }[] = [];
    declarationMap.forEach((line, name) => {
      declaredNames.push({ name, line });
    });

    return declaredNames;
  }

  private removeComments(fileContent: string) {
    return fileContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  }

  private displayReport() {
    this.reportList.forEach(report => {
      console.log(
        `${chalk.red(report.filePath)}:${chalk.yellow(String(report.line))} - ${chalk.green(
          report.name
        )}\n`
      );
    });
  }

  private scanAndCheckFiles() {
    // First phase: collect all declarations from all files
    const allFiles = this.getAllFiles(this.filesPath);
    const fileContents = new Map<string, string>();

    // First pass to collect all declarations
    for (const filePath of allFiles) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      fileContents.set(filePath, fileContent);

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

    // Second phase: check usages in all files
    // We need this separate phase because we need to collect all declarations
    // before we can check for usages
    const collectedNames = Object.keys(this.deadMap);
    if (collectedNames.length === 0) {
      return;
    }

    for (const [_, fileContent] of fileContents.entries()) {
      const withoutComments = this.removeComments(fileContent);

      collectedNames.forEach(name => {
        const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
        const matches = withoutComments.match(usageRegex);
        if (matches) {
          this.deadMap[name].count += matches.length;
        }
      });
    }
  }

  private createReport() {
    // First pass: collect regular dead code
    for (const name of Object.keys(this.deadMap)) {
      const occurrences = this.deadMap[name];

      // Consider a symbol dead if:
      // 1. It appears only once (declared but not used)
      // 2. It is used only in exports/returns (count=2 and in exportedSymbols)
      // 3. It is exported and imported but not used beyond import (count=3 and in both exportedSymbols and importedSymbols)
      // 4. It is imported and used only at that import location (occurrences > 0 and in importedSymbols but not used beyond that)
      const isOnlyExported =
        occurrences.count === 2 && this.exportedSymbols.has(name);
      const isExportedAndImported =
        occurrences.count === 3 &&
        this.exportedSymbols.has(name) &&
        this.importedSymbols.has(name);
      const isImportedButNotUsed =
        this.importedSymbols.has(name) && !(occurrences.count > 3); // If used beyond import, count would be > 3

      if (
        occurrences.count === 1 ||
        isOnlyExported ||
        isExportedAndImported ||
        isImportedButNotUsed
      ) {
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

    // Second pass: detect imported symbols that don't exist in declarations
    // (this happens when someone imports something that doesn't exist or isn't exported)
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

  public getReport() {
    return this.reportList;
  }

  public async run() {
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
