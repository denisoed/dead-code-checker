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
    return IGNORED_NAMES.includes(name);
  }

  private getDeclaredFunctionsAndVariables(fileContent: string) {
    const functionRegex = /\bfunction\s+([a-zA-Z0-9_]+)\s*\(/g;
    const arrowFunctionRegex = /\bconst\s+([a-zA-Z0-9_]+)\s*=\s*\(/g;
    const methodRegex = /([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/g;
    const setupReturnRegex = /\breturn\s*{([^}]*)}/g;
    const variableRegex = /\b(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=?/g;

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

  private displayReport() {
    this.reportList.forEach(report => {
      console.log(
        `${chalk.red(report.filePath)}:${chalk.yellow(String(report.line))} - ${chalk.green(
          report.name
        )}\n`
      );
    });
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
        if (typeof this.deadMap[code.name] !== 'object') {
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
          this.reportList.push({
            filePath: decl.filePath,
            line: decl.line,
            name: func
          });
        });
      }
    });

    cfonts.say('Dead Code Checker', START_TEXT);

    if (this.deadCodeFound) {
      this.displayReport();
    } else {
      console.log(chalk.greenBright('✅ No dead code found!'));
    }
  }
}

export default DeadCodeChecker;
