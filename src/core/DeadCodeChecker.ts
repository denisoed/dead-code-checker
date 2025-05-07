import chalk from 'chalk';
import cfonts from 'cfonts';
import { START_TEXT } from '../config';
import { IDeadCodeInfo, IDeadCodeParams, IDeadCodeReport } from '../interfaces';
import { getAllFiles, readFileContent, removeComments } from './fileSystem';
import {
  findDeclarations,
  processImportsAndExports,
  isBuiltInFunctionOrVariable
} from './declarations';
import { analyzeUsages } from './analysis';
import { createReport, displayReport } from './reporting';

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

  private scanAndCheckFiles(): void {
    // Get all files to check
    const allFiles = getAllFiles(this.filesPath, [], this.params);
    const fileContents = new Map<string, string>();

    // Read file contents
    for (const filePath of allFiles) {
      const fileContent = readFileContent(filePath);
      if (fileContent) {
        fileContents.set(filePath, fileContent);
      }
    }

    // First phase: collect all declarations from all files
    for (const filePath of allFiles) {
      const fileContent = fileContents.get(filePath);
      if (!fileContent) continue;

      const declaredNames = findDeclarations(
        fileContent,
        filePath,
        this.isBuiltInFunctionOrVariable.bind(this)
      );

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
      processImportsAndExports(
        fileContent,
        filePath,
        this.exportedSymbols,
        this.importedSymbols
      );
    }

    // Second phase: check usages in all files
    analyzeUsages(
      Object.keys(this.deadMap),
      fileContents,
      this.deadMap,
      removeComments
    );
  }

  private isBuiltInFunctionOrVariable(name: string): boolean {
    const { ignoreNames } = this.params || {};
    return isBuiltInFunctionOrVariable(name, ignoreNames);
  }

  // Public methods
  public getReport(): IDeadCodeReport[] {
    return this.reportList;
  }

  public async run(): Promise<void> {
    cfonts.say('Dead Code Checker', START_TEXT);

    this.scanAndCheckFiles();

    // Generate report
    this.reportList = createReport(
      this.deadMap,
      this.exportedSymbols,
      this.importedSymbols
    );

    // Update dead code flag
    this.deadCodeFound = this.reportList.length > 0;

    if (this.deadCodeFound) {
      displayReport(this.reportList);
      if (this.params?.ci) process.exit(1);
    } else {
      console.log(chalk.greenBright('✅ No dead code found!'));
    }
  }
}

export default DeadCodeChecker;
