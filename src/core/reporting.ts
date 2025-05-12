import chalk from 'chalk';
import { IDeadCodeInfo, IDeadCodeReport } from '../interfaces';
import { isDeadCode } from './analysis';

/**
 * Creates a report from the dead code map
 */
export function createReport(
  deadMap: Record<string, IDeadCodeInfo>,
  exportedSymbols: Set<string>,
  importedSymbols: Map<string, string[]>
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
  for (const [importedSymbol, files] of importedSymbols) {
    // Skip if we already processed this symbol
    if (deadMap[importedSymbol]) continue;

    // If it's imported but not in our declarations, it's likely a dead import
    // Add an entry for each file where this symbol was imported
    for (const filePath of files) {
      reportList.push({
        filePath,
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
