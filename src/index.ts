import fs from 'fs';
import path from 'path';
import Table from 'cli-table3';
import chalk from 'chalk';
import { IGNORED_FUNCTIONS, DEFAULT_EXTENSIONS } from './config';
import { IDeadCodeInfo } from './interfaces';

class DeadCodeChecker {
  private filesPath = '.';
  private deadMap: Record<string, IDeadCodeInfo> = {};
  private deadCodeFound: boolean = false;
  private cliTable = new Table({
    head: [
      chalk.blueBright('📁 File'),
      chalk.blueBright('🔢 Line'),
      chalk.blueBright('🔍 Name')
    ],
    colWidths: [100, 10, 30]
  });

  constructor(filesPath: string) {
    this.filesPath = filesPath;
  }

  private getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file: string) => {
      const fullPath: string = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
      } else if (DEFAULT_EXTENSIONS.some(ext => file.endsWith(ext))) {
        arrayOfFiles.push(fullPath);
      }
    });
    return arrayOfFiles;
  }

  private isBuiltInFunctionOrVariable(name: string) {
    return IGNORED_FUNCTIONS.includes(name);
  }

  private getDeclaredFunctionsAndVariables(fileContent: string) {
    const functionRegex = /function\s+([a-zA-Z0-9_]+)/g;
    const arrowFunctionRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*\(/g;
    const methodRegex = /([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/g;
    const vueMethodsRegex = /methods\s*:\s*{([^}]*)}/g;
    const setupReturnRegex = /return\s*{([^}]*)}/g;
    const variableRegex = /(?:const|let|var)\s+([a-zA-Z0-9_]+)/g;

    const declaredFunctions: { name: string; line: number }[] = [];
    const declaredVariables: { name: string; line: number }[] = [];
    const setupReturnFunctions = new Set();

    let match;
    let lineNumber = 0;

    fileContent.split('\n').forEach(line => {
      lineNumber++;
      if ((match = functionRegex.exec(line)) !== null) {
        if (!this.isBuiltInFunctionOrVariable(match[1])) {
          declaredFunctions.push({ name: match[1], line: lineNumber });
        }
      } else if ((match = arrowFunctionRegex.exec(line)) !== null) {
        if (!this.isBuiltInFunctionOrVariable(match[1])) {
          declaredFunctions.push({ name: match[1], line: lineNumber });
        }
      } else if ((match = methodRegex.exec(line)) !== null) {
        if (!this.isBuiltInFunctionOrVariable(match[1])) {
          declaredFunctions.push({ name: match[1], line: lineNumber });
        }
      } else if ((match = variableRegex.exec(line)) !== null) {
        if (!this.isBuiltInFunctionOrVariable(match[1])) {
          declaredVariables.push({ name: match[1], line: lineNumber });
        }
      }
    });

    while ((match = vueMethodsRegex.exec(fileContent)) !== null) {
      const methodsContent = match[1];
      const methodsMatches =
        methodsContent.match(/([a-zA-Z0-9_]+)\s*\(/g) || [];
      methodsMatches.forEach((method, index) => {
        method = method.trim().replace('(', '');
        if (!this.isBuiltInFunctionOrVariable(method)) {
          declaredFunctions.push({ name: method, line: lineNumber + index });
        }
      });
    }

    while ((match = setupReturnRegex.exec(fileContent)) !== null) {
      const returnContent = match[1];
      const returnMatches = returnContent.split(',') || [];
      returnMatches.forEach(method => {
        method = method.trim().replace(':', '');
        setupReturnFunctions.add(method);
      });
    }

    return { declaredFunctions, declaredVariables, setupReturnFunctions };
  }

  private removeComments(fileContent: string) {
    return fileContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  }

  public async run() {
    const allFiles = this.getAllFiles(this.filesPath);
    const setupReturnFunctions = new Set();

    for (const filePath of allFiles) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const {
        declaredFunctions,
        declaredVariables,
        setupReturnFunctions: localSetupReturnFunctions
      } = this.getDeclaredFunctionsAndVariables(fileContent);
      localSetupReturnFunctions.forEach(func => setupReturnFunctions.add(func));

      [...declaredVariables, ...declaredFunctions].forEach(code => {
        if (!this.deadMap[code.name]) {
          this.deadMap[code.name] = { count: 0, declaredIn: [] };
        }
        this.deadMap[code.name].declaredIn.push({
          filePath,
          line: code.line
        });
      });
    }

    allFiles.forEach(filePath => {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const cleanedContent = this.removeComments(fileContent);
      Object.keys(this.deadMap).forEach(func => {
        const usageRegex = new RegExp(`\\b${func}\\b`, 'g');
        const matches = cleanedContent.match(usageRegex);
        if (matches) {
          this.deadMap[func].count += matches.length;
        }
      });
    });

    Object.keys(this.deadMap).forEach(func => {
      const occurrences = this.deadMap[func];
      const isOnlyInReturn =
        occurrences.count === 2 && setupReturnFunctions.has(func);
      if (occurrences.count === 1 || isOnlyInReturn) {
        this.deadCodeFound = true;
        occurrences.declaredIn.forEach(decl => {
          this.cliTable.push([decl.filePath, decl.line, func]);
        });
      }
    });

    if (this.deadCodeFound) {
      console.log(this.cliTable.toString());
    } else {
      console.log(chalk.greenBright('✅ No dead code found!'));
    }
  }
}

export default DeadCodeChecker;
