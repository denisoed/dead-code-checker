import chalk from 'chalk';
import cfonts from 'cfonts';
import { START_TEXT } from '../config';
import { IDeadCodeInfo, IDeadCodeParams, IDeadCodeReport } from '../interfaces';
import { getAllFiles, readFileContent, removeComments } from './fileSystem';
import {
  findDeclarations,
  processImportsAndExports,
  isBuiltInFunctionOrVariable,
  processHtmlDependencies,
  isHtmlFile
} from './declarations';
import { analyzeUsages } from './analysis';
import { createReport, displayReport } from './reporting';
import path from 'path';

class DeadCodeChecker {
  private filesPath: string = '.';
  private params: IDeadCodeParams | undefined;
  private deadMap: Record<string, IDeadCodeInfo> = {};
  private deadCodeFound: boolean = false;
  private reportList: IDeadCodeReport[] = [];
  private exportedSymbols: Set<string> = new Set();
  private importedSymbols: Map<string, string[]> = new Map();
  private htmlDependencies: Map<string, string[]> = new Map(); // Map HTML files to their script dependencies

  constructor(filesPath: string, params?: IDeadCodeParams) {
    this.params = params;
    this.filesPath = filesPath;
  }

  private processHtmlDependencies(filePath: string): void {
    const { dependencies, inlineDeclarations } = processHtmlDependencies(
      filePath,
      readFileContent,
      findDeclarations,
      this.isBuiltInFunctionOrVariable.bind(this)
    );
    this.htmlDependencies.set(filePath, dependencies);
    inlineDeclarations.forEach(code => {
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
    dependencies.forEach(dep => {
      if (!dep.startsWith('http')) {
        const normalizedPath = path.resolve(this.filesPath, dep);
        const fileContent = readFileContent(normalizedPath);
        if (fileContent) {
          processImportsAndExports(
            fileContent,
            normalizedPath,
            this.exportedSymbols,
            this.importedSymbols
          );
        }
      }
    });
  }

  private scanAndCheckFiles(): void {
    // Get all files to check
    const allFiles = getAllFiles(this.filesPath, [], this.params);
    const fileContents = new Map<string, string>();

    // Read file contents and process HTML files first
    for (const filePath of allFiles) {
      const fileContent = readFileContent(filePath);
      if (fileContent) {
        fileContents.set(filePath, fileContent);
        if (isHtmlFile(filePath)) {
          this.processHtmlDependencies(filePath);
        }
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

      processImportsAndExports(
        fileContent,
        filePath,
        this.exportedSymbols,
        this.importedSymbols
      );
    }

    // Analyze usages in all files
    analyzeUsages(
      Object.keys(this.deadMap),
      fileContents,
      this.deadMap,
      removeComments,
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
