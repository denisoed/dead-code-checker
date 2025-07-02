import chalk from 'chalk';
import { IDeadCodeInfo, IDeadCodeReport, IImportedSymbol } from '../interfaces';
import { isDeadCode, isExternalPackage } from './analysis';

/**
 * Creates a report from the dead code map
 */
export function createReport(
  deadMap: Record<string, IDeadCodeInfo>,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, IImportedSymbol[]>
): IDeadCodeReport[] {
  const reportList: IDeadCodeReport[] = [];

  // First pass: collect regular dead code
  for (const name of Object.keys(deadMap)) {
    const occurrences = deadMap[name];

    if (isDeadCode(name, occurrences, exportedSymbols, importedSymbols)) {
      occurrences.declaredIn.forEach(decl => {
        reportList.push({
          filePath: decl.filePath,
          line: decl.line,
          name: name
        });
      });
    }
  }

  // Second pass: detect imported symbols that don't exist in declarations
  for (const [importedSymbol, importInfos] of importedSymbols) {
    // Skip if we already processed this symbol
    if (deadMap[importedSymbol]) continue;

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
              name: `${importedSymbol} (imported but not used)`
            });
          }
        }
      }
      continue;
    }

    // For local imports that are not found, report as before
    for (const importInfo of importInfos) {
      reportList.push({
        filePath: importInfo.filePath,
        line: 0, // We don't have exact line information
        name: `${importedSymbol} (imported but not found)`
      });
    }
  }

  return reportList;
}

/**
 * Displays the report to the console
 */
export function displayReport(reportList: IDeadCodeReport[]): void {
  reportList.forEach(report => {
    console.log(
      `${chalk.red(report.filePath)}:${chalk.yellow(String(report.line))} - ${chalk.green(
        report.name
      )}\n`
    );
  });
}
