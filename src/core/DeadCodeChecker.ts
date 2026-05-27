import chalk from 'chalk';
import cfonts from 'cfonts';
import { START_TEXT } from '../config';
import { IDeadCodeInfo, IDeadCodeParams, IDeadCodeReport, IImportedSymbol } from '../interfaces';
import { getAllFiles, readFileContent } from './fileSystem';
import {
  findDeclarations,
  isBuiltInFunctionOrVariable,
  processESModuleImports,
  processCommonJSImports,
  processESModuleExports,
  processCommonJSExports
} from './declarations';
import {
  analyzeUsagesBatch,
  initializeDeadCodeStructure,
  populateExportImportInfo
} from './analysis';
import { createReport, displayReport } from './reporting';
import { ProgressTracker, IProgressConfig } from './progress';

class DeadCodeChecker {
  private filesPath: string = '.';
  private params: IDeadCodeParams | undefined;
  private deadMap: Record<string, IDeadCodeInfo> = {};
  private deadCodeFound: boolean = false;
  private reportList: IDeadCodeReport[] = [];
  private exportedSymbols: Set<string> = new Set();
  private importedSymbols: Map<string, IImportedSymbol[]> = new Map();
  private progressTracker: ProgressTracker;

  constructor(filesPath: string, params?: IDeadCodeParams) {
    this.params = params;
    this.filesPath = filesPath;
    
    // Initialize progress tracker
    const progressConfig: IProgressConfig = {
      enabled: !params?.noProgress && !params?.ci,
      quiet: !!params?.quiet || !!params?.ci,
    };
    this.progressTracker = new ProgressTracker(progressConfig);
  }

  private async scanAndCheckFiles(): Promise<Map<string, string>> {
    // Show progress header
    this.progressTracker.logHeader();

    // Stage 1: Get all files to check
    this.progressTracker.startStage('collecting', 'Collecting files', 100, '📁');
    const allFiles = getAllFiles(this.filesPath, [], this.params);
    this.progressTracker.updateStage('collecting', 100);
    this.progressTracker.completeStage('collecting');

    // Allow event loop to process
    await new Promise(resolve => setImmediate(resolve));

    const fileContents = new Map<string, string>();
    const totalFiles = allFiles.length;

    // Stage 2: Read file contents
    this.progressTracker.startStage('reading', 'Reading files', totalFiles, '📖');
    for (let i = 0; i < allFiles.length; i++) {
      const filePath = allFiles[i];
      const fileContent = readFileContent(filePath);
      if (fileContent) {
        fileContents.set(filePath, fileContent);
      }
      this.progressTracker.updateStage('reading', 1, filePath);
      
      // Allow event loop to process every 10 files
      if (i % 10 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
    this.progressTracker.completeStage('reading');

    // Allow event loop to process
    await new Promise(resolve => setImmediate(resolve));

    // Stage 3: Process all files for declarations and imports/exports
    this.progressTracker.startStage('processing', 'Processing declarations', totalFiles, '🔍');
    for (let i = 0; i < allFiles.length; i++) {
      const filePath = allFiles[i];
      const fileContent = fileContents.get(filePath);
      if (!fileContent) {
        this.progressTracker.updateStage('processing', 1, filePath);
        continue;
      }

      const declaredNames = findDeclarations(
        fileContent,
        filePath,
        this.isBuiltInFunctionOrVariable.bind(this)
      );

      declaredNames.forEach(code => {
        // Use a file-scoped key (filePath::name) to avoid collisions between
        // identically-named symbols declared in different files.
        const symbolKey = `${filePath}::${code.name}`;
        if (typeof this.deadMap[symbolKey] !== 'object') {
          this.deadMap[symbolKey] = {
            declaredIn: [],
            declarationCount: 0,
            exportCount: 0,
            importCount: 0,
            usageCount: 0,
            exportedFrom: [],
            importedIn: []
          };
        }
        this.deadMap[symbolKey].declaredIn.push({
          filePath,
          line: code.line
        });
      });

      processCommonJSExports(fileContent, this.exportedSymbols);
      processESModuleExports(fileContent, this.exportedSymbols);
      processCommonJSImports(fileContent, filePath, this.importedSymbols);
      processESModuleImports(fileContent, filePath, this.importedSymbols);
      
      this.progressTracker.updateStage('processing', 1, filePath);
      
      // Allow event loop to process every 10 files
      if (i % 10 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
    this.progressTracker.completeStage('processing');

    // Allow event loop to process
    await new Promise(resolve => setImmediate(resolve));

    // Stage 4: Analyze usages in all files
    this.progressTracker.startStage('analyzing', 'Analyzing usage', totalFiles, '⚡');
    await this.analyzeUsagesAsync(fileContents);
    this.progressTracker.completeStage('analyzing');

    return fileContents;
  }

  private isBuiltInFunctionOrVariable(name: string): boolean {
    const { ignoreNames } = this.params || {};
    return isBuiltInFunctionOrVariable(name, ignoreNames);
  }

  private async analyzeUsagesAsync(fileContents: Map<string, string>): Promise<void> {
    const collectedKeys = Object.keys(this.deadMap);

    // Initialize counters and populate export/import info once for all files.
    // This must happen before any batch so that reset does not clobber results.
    initializeDeadCodeStructure(
      collectedKeys,
      this.deadMap,
      this.exportedSymbols,
      this.importedSymbols
    );
    populateExportImportInfo(
      collectedKeys,
      this.deadMap,
      this.exportedSymbols,
      this.importedSymbols
    );

    const fileEntries = Array.from(fileContents.entries());

    // Process files in batches to keep the event loop responsive for progress updates
    const batchSize = 10;
    for (let i = 0; i < fileEntries.length; i += batchSize) {
      const batch = fileEntries.slice(i, i + batchSize);
      const batchFileContents = new Map(batch);

      analyzeUsagesBatch(
        collectedKeys,
        batchFileContents,
        this.deadMap,
        this.exportedSymbols,
        this.importedSymbols,
        (filePath: string) => {
          this.progressTracker.updateStage('analyzing', 1, filePath);
        }
      );

      // Allow event loop to process between batches
      if (i + batchSize < fileEntries.length) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
  }

  public getReport(): IDeadCodeReport[] {
    return this.reportList;
  }

  public async run(): Promise<void> {
    try {
      // Only show cfonts header if not in quiet mode and not in CI mode
      if (!this.params?.quiet && !this.params?.ci) {
        cfonts.say('Dead Code Checker', START_TEXT);
      }

      const fileContents = await this.scanAndCheckFiles();

      // Generate report with file contents for better type detection
      this.reportList = createReport(
        this.deadMap,
        this.exportedSymbols,
        this.importedSymbols,
        fileContents
      );

      // Update dead code flag
      this.deadCodeFound = this.reportList.length > 0;

      // Stop progress tracker before showing results
      this.progressTracker.stop();
      this.progressTracker.logSeparator();

      if (this.deadCodeFound) {
        if (!this.params?.quiet) {
          displayReport(this.reportList);
        }
        if (this.params?.ci) process.exit(1);
      } else {
        if (!this.params?.quiet) {
          console.log(chalk.greenBright('✅ No dead code found!'));
        }
      }
    } catch (error) {
      // Ensure progress tracker is stopped on error
      this.progressTracker.stop();
      throw error;
    }
  }
}

export default DeadCodeChecker;
