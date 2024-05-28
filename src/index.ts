import fs from 'fs';
import path from 'path';
import Table from 'cli-table3';
import chalk from 'chalk';
import { IGNORED_FUNCTIONS } from './config';

class DeadCodeChecker {
  private filesPath = '.';

  constructor(filesPath: string) {
    this.filesPath = filesPath;
  }

  private getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file: string) => {
      const fullPath: string = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
      } else if (
        file.endsWith('.js') ||
        file.endsWith('.ts') ||
        file.endsWith('.vue')
      ) {
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

  public async run() {
    const allFiles = this.getAllFiles(this.filesPath);
    const functionOccurrences: Record<
      string,
      { count: number; declaredIn: any[] }
    > = {};
    const variableOccurrences: Record<
      string,
      { count: number; declaredIn: any[] }
    > = {};
    const setupReturnFunctions = new Set();

    for (const filePath of allFiles) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const {
        declaredFunctions,
        declaredVariables,
        setupReturnFunctions: localSetupReturnFunctions
      } = this.getDeclaredFunctionsAndVariables(fileContent);
      localSetupReturnFunctions.forEach(func => setupReturnFunctions.add(func));

      declaredFunctions.forEach(func => {
        if (!functionOccurrences[func.name]) {
          functionOccurrences[func.name] = { count: 0, declaredIn: [] };
        }
        functionOccurrences[func.name].declaredIn.push({
          filePath,
          line: func.line
        });
      });

      declaredVariables.forEach(variable => {
        if (!variableOccurrences[variable.name]) {
          variableOccurrences[variable.name] = { count: 0, declaredIn: [] };
        }
        variableOccurrences[variable.name].declaredIn.push({
          filePath,
          line: variable.line
        });
      });
    }

    allFiles.forEach(filePath => {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      Object.keys(functionOccurrences).forEach(func => {
        const usageRegex = new RegExp(`\\b${func}\\b`, 'g');
        const matches = fileContent.match(usageRegex);
        if (matches) {
          functionOccurrences[func].count += matches.length;
        }
      });

      Object.keys(variableOccurrences).forEach(variable => {
        const usageRegex = new RegExp(`\\b${variable}\\b`, 'g');
        const matches = fileContent.match(usageRegex);
        if (matches) {
          variableOccurrences[variable].count += matches.length;
        }
      });
    });

    const functionTable = new Table({
      head: [
        chalk.blueBright('📁 File'),
        chalk.blueBright('🔢 Line'),
        chalk.blueBright('🔍 Function')
      ],
      colWidths: [100, 10, 30]
    });

    const variableTable = new Table({
      head: [
        chalk.greenBright('📁 File'),
        chalk.greenBright('🔢 Line'),
        chalk.greenBright('🔍 Variable')
      ],
      colWidths: [100, 10, 30]
    });

    let unusedFunctionsFound = false;
    let unusedVariablesFound = false;

    Object.keys(functionOccurrences).forEach(func => {
      const occurrences = functionOccurrences[func];
      const isOnlyInReturn =
        occurrences.count === 2 && setupReturnFunctions.has(func);
      if (occurrences.count === 1 || isOnlyInReturn) {
        unusedFunctionsFound = true;
        occurrences.declaredIn.forEach(decl => {
          functionTable.push([decl.filePath, decl.line, func]);
        });
      }
    });

    Object.keys(variableOccurrences).forEach(variable => {
      const occurrences = variableOccurrences[variable];
      if (occurrences.count === 1) {
        unusedVariablesFound = true;
        occurrences.declaredIn.forEach(decl => {
          variableTable.push([decl.filePath, decl.line, variable]);
        });
      }
    });

    if (unusedFunctionsFound) {
      console.log('Unused Functions:');
      console.log(functionTable.toString());
    } else {
      console.log(chalk.greenBright('✅ No unused functions found!'));
    }

    if (unusedVariablesFound) {
      console.log('Unused Variables:');
      console.log(variableTable.toString());
    } else {
      console.log(chalk.greenBright('✅ No unused variables found!'));
    }
  }
}

export default DeadCodeChecker;
