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
  private usedOnlyReturn: Set<string> = new Set();

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

  private saveUsedOnlyReturn(content: string) {
    const matches = content.split(',') || [];
    matches.forEach(method => {
      method = method.trim().replace(':', '');
      this.usedOnlyReturn.add(method);
    });
  }

  private getDeclaredNames(fileContent: string) {
    const functionRegex = /\bfunction\s([a-zA-Z0-9_]+)\s*\(/g;
    const functionExpressionRegex =
      /\b(?:const|let|var)\s([a-zA-Z0-9_]+)\s*=\s*function\s*\(/g;
    const arrowFunctionRegex = /\bconst\s+([a-zA-Z0-9_]+)\s*=\s*\(/g;
    const methodRegex = /([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/g;
    const onlyInReturnRegex = /\breturn\s*{([^}]*)}/g;
    const onlyModuleExportsRegex = /\bmodule\.exports\s*=\s*{([^}]*)}/g;
    const variableRegex =
      /\b(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*(?:=|;|\r?\n|$)/g;

    const declaredNames: { name: string; line: number }[] = [];

    let match;
    let lineNumber = 0;

    fileContent.split('\n').forEach(lineContent => {
      lineNumber++;
      if ((match = functionRegex.exec(lineContent)) !== null) {
        if (!this.isBuiltInFunctionOrVariable(match[1])) {
          declaredNames.push({ name: match[1], line: lineNumber });
        }
      } else if ((match = functionExpressionRegex.exec(lineContent)) !== null) {
        if (!this.isBuiltInFunctionOrVariable(match[1])) {
          declaredNames.push({ name: match[1], line: lineNumber });
        }
      } else if ((match = arrowFunctionRegex.exec(lineContent)) !== null) {
        if (!this.isBuiltInFunctionOrVariable(match[1])) {
          declaredNames.push({ name: match[1], line: lineNumber });
        }
      } else if ((match = methodRegex.exec(lineContent)) !== null) {
        if (!this.isBuiltInFunctionOrVariable(match[1])) {
          declaredNames.push({ name: match[1], line: lineNumber });
        }
      } else if ((match = variableRegex.exec(lineContent)) !== null) {
        if (!this.isBuiltInFunctionOrVariable(match[1])) {
          declaredNames.push({ name: match[1], line: lineNumber });
        }
      }
    });

    while ((match = onlyInReturnRegex.exec(fileContent)) !== null) {
      this.saveUsedOnlyReturn(match[1]);
    }

    while ((match = onlyModuleExportsRegex.exec(fileContent)) !== null) {
      this.saveUsedOnlyReturn(match[1]);
    }

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
    for (const name of Object.keys(this.deadMap)) {
      const occurrences = this.deadMap[name];
      const isOnlyInReturn =
        occurrences.count === 2 && this.usedOnlyReturn.has(name);
      if (occurrences.count === 1 || isOnlyInReturn) {
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
