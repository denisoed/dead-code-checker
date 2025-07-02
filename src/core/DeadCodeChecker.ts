import chalk from 'chalk';
import cfonts from 'cfonts';
import { START_TEXT } from '../config';
import { IDeadCodeInfo, IDeadCodeParams, IDeadCodeReport, IImportedSymbol } from '../interfaces';
import { getAllFiles, readFileContent } from './fileSystem';
import {
  findDeclarations,
  isBuiltInFunctionOrVariable,
  processReturnStatements,
  processESModuleImports,
  processCommonJSImports,
  processESModuleExports,
  processCommonJSExports
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
  private importedSymbols: Map<string, IImportedSymbol[]> = new Map();

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

    // Process all files for declarations and imports/exports
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
          this.deadMap[code.name] = {
            declaredIn: [],
            declarationCount: 0,
            exportCount: 0,
            importCount: 0,
            usageCount: 0,
            exportedFrom: [],
            importedIn: []
          };
        }
        this.deadMap[code.name].declaredIn.push({
          filePath,
          line: code.line
        });
      });

      processCommonJSExports(fileContent, this.exportedSymbols);
      processESModuleExports(fileContent, this.exportedSymbols);
      processCommonJSImports(fileContent, filePath, this.importedSymbols);
      processESModuleImports(fileContent, filePath, this.importedSymbols);
      processReturnStatements(fileContent, this.exportedSymbols);
    }

    // Analyze usages in all files
    analyzeUsages(
      Object.keys(this.deadMap),
      fileContents,
      this.deadMap,
      this.exportedSymbols,
      this.importedSymbols
    );
  }

  private isBuiltInFunctionOrVariable(name: string): boolean {
    const { ignoreNames } = this.params || {};
    return isBuiltInFunctionOrVariable(name, ignoreNames);
  }

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
