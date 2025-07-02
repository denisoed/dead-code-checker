import chalk from 'chalk';
import { IDeadCodeInfo, IDeadCodeReport, IImportedSymbol, IReportSummary } from '../interfaces';
import { isDeadCode, isExternalPackage } from './analysis';

/**
 * Determines the declaration type based on the name and context
 */
function determineDeclarationType(
  name: string, 
  fileContent: string, 
  line: number
): 'function' | 'variable' | 'import' | 'other' {
  // Check if it's an import (especially for external packages)
  if (name.includes('(imported but not used)') || name.includes('(imported but not found)')) {
    return 'import';
  }

  // Read the specific line to determine type
  const lines = fileContent.split('\n');
  const targetLine = lines[line - 1] || '';

  // Check for function patterns
  if (
    targetLine.includes('function ') ||
    targetLine.includes('=>') ||
    /\w+\s*\([^)]*\)\s*{/.test(targetLine)
  ) {
    return 'function';
  }

  // Check for variable patterns
  if (
    targetLine.includes('const ') ||
    targetLine.includes('let ') ||
    targetLine.includes('var ')
  ) {
    return 'variable';
  }

  return 'other';
}

/**
 * Creates a report from the dead code map with enhanced type information
 */
export function createReport(
  deadMap: Record<string, IDeadCodeInfo>,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, IImportedSymbol[]>,
  fileContents?: Map<string, string>
): IDeadCodeReport[] {
  const reportList: IDeadCodeReport[] = [];

  // First pass: collect regular dead code
  for (const name of Object.keys(deadMap)) {
    const occurrences = deadMap[name];

    if (isDeadCode(name, occurrences, exportedSymbols, importedSymbols)) {
      occurrences.declaredIn.forEach(decl => {
        const fileContent = fileContents?.get(decl.filePath) || '';
        const declarationType = determineDeclarationType(name, fileContent, decl.line);
        
        reportList.push({
          filePath: decl.filePath,
          line: decl.line,
          name: name,
          declarationType
        });
      });
    }
  }

  // Second pass: detect unused imports (both external and local)
  for (const [importedSymbol, importInfos] of importedSymbols) {
    // Check if all imports are from external packages
    const allFromExternalPackages = importInfos.every(importInfo => 
      isExternalPackage(importInfo.importSource)
    );

    // For external packages, check if they are used after import
    if (allFromExternalPackages) {
      // Check if any import is not used after import
      const hasUnusedImports = importInfos.some(info => !info.usedAfterImport);
      
      if (hasUnusedImports) {
        for (const importInfo of importInfos) {
          if (!importInfo.usedAfterImport) {
            reportList.push({
              filePath: importInfo.filePath,
              line: 0,
              name: `${importedSymbol} (imported but not used)`,
              declarationType: 'import'
            });
          }
        }
      }
      continue;
    }

    // For local imports, check if they are used after import
    // Note: A symbol can be both unused in declaration file AND unused in import file
    for (const importInfo of importInfos) {
      if (!importInfo.usedAfterImport) {
        // Check if this symbol exists in declarations (local import)
        const existsInDeclarations = deadMap[importedSymbol] !== undefined;
        
        if (existsInDeclarations) {
          // Local import of existing symbol but not used after import
          reportList.push({
            filePath: importInfo.filePath,
            line: 0,
            name: `${importedSymbol} (imported but not used)`,
            declarationType: 'import'
          });
        } else {
          // Local import of non-existing symbol
          reportList.push({
            filePath: importInfo.filePath,
            line: 0,
            name: `${importedSymbol} (imported but not found)`,
            declarationType: 'import'
          });
        }
      }
    }
  }

  return reportList;
}

/**
 * Creates a summary of the dead code report
 */
export function createReportSummary(reportList: IDeadCodeReport[]): IReportSummary {
  const fileGroups = new Map<string, IDeadCodeReport[]>();
  let functionCount = 0;
  let variableCount = 0;
  let importCount = 0;
  let otherCount = 0;

  // Group by file and count by type
  reportList.forEach(report => {
    if (!fileGroups.has(report.filePath)) {
      fileGroups.set(report.filePath, []);
    }
    fileGroups.get(report.filePath)!.push(report);

    // Count by declaration type
    switch (report.declarationType) {
      case 'function':
        functionCount++;
        break;
      case 'variable':
        variableCount++;
        break;
      case 'import':
        importCount++;
        break;
      default:
        otherCount++;
        break;
    }
  });

  return {
    totalCount: reportList.length,
    filesAffected: fileGroups.size,
    functionCount,
    variableCount,
    importCount,
    otherCount,
    fileGroups
  };
}

/**
 * Gets appropriate emoji for declaration type
 */
function getTypeEmoji(type: string): string {
  switch (type) {
    case 'function':
      return '⚡';
    case 'variable':
      return '📦';
    case 'import':
      return '📥';
    default:
      return '🔹';
  }
}

/**
 * Gets type label for display
 */
function getTypeLabel(type: string): string {
  switch (type) {
    case 'function':
      return 'function';
    case 'variable':
      return 'const/let/var';
    case 'import':
      return 'import';
    default:
      return 'other';
  }
}

/**
 * Displays the enhanced report to the console
 */
export function displayReport(reportList: IDeadCodeReport[]): void {
  if (reportList.length === 0) {
    console.log(chalk.greenBright('✅ No dead code found!'));
    return;
  }

  const summary = createReportSummary(reportList);

  // Header
  console.log(chalk.bold.cyan('\n✨ Dead Code Analysis Summary'));
  console.log(chalk.bold.yellow(`📊 Found ${summary.totalCount} unused declarations in ${summary.filesAffected} files\n`));

  // Statistics section
  console.log(chalk.bold.magenta('📈 Statistics:'));
  console.log(chalk.white(`  • Functions: ${chalk.yellow(summary.functionCount)} unused`));
  console.log(chalk.white(`  • Variables: ${chalk.yellow(summary.variableCount)} unused`));
  console.log(chalk.white(`  • External imports: ${chalk.yellow(summary.importCount)} unused`));
  if (summary.otherCount > 0) {
    console.log(chalk.white(`  • Other: ${chalk.yellow(summary.otherCount)} unused`));
  }
  console.log(chalk.white(`  • Files affected: ${chalk.yellow(summary.filesAffected)}`));
  console.log(chalk.white(`  • Estimated lines saved: ${chalk.green('~' + (summary.totalCount * 8))}\n`));

  // Detailed results section
  console.log(chalk.bold.cyan('🔍 Detailed Results:'));

  // Group results by file for better organization
  const sortedFiles = Array.from(summary.fileGroups.keys()).sort();
  
  sortedFiles.forEach(filePath => {
    const fileReports = summary.fileGroups.get(filePath)!;
    
    // File header
    console.log(chalk.bold.blue(`\n📁 ${filePath} (${fileReports.length} items):`));
    
    // Sort reports within file by line number, then by type
    fileReports
      .sort((a, b) => {
        if (a.line !== b.line) return a.line - b.line;
        return a.declarationType.localeCompare(b.declarationType);
      })
      .forEach(report => {
        const typeEmoji = getTypeEmoji(report.declarationType);
        const typeLabel = getTypeLabel(report.declarationType);
        const lineInfo = report.line > 0 ? `:${chalk.yellow(report.line)}` : '';
        
        console.log(chalk.white(
          `  ${typeEmoji} ${chalk.gray(typeLabel)} ${chalk.green(report.name)}${lineInfo}`
        ));
      });
  });

  console.log(chalk.gray('\n💡 Tip: Remove these unused declarations to improve code quality and reduce bundle size.\n'));
}
