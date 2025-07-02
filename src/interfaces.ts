export interface IDeadCodeInfo {
  declarationCount: number;
  exportCount: number;
  importCount: number;
  usageCount: number;
  declaredIn: {
    filePath: string;
    line: number;
  }[];
  exportedFrom: string[];
  importedIn: {
    filePath: string;
    usedAfterImport: boolean;
  }[];
}

export interface IImportedSymbol {
  filePath: string;
  importSource: string;
  usedAfterImport?: boolean;
}

export interface IDeadCodeReport {
  name: string;
  line: number;
  filePath: string;
  declarationType: 'function' | 'variable' | 'import' | 'other';
}

export interface IDeadCodeParams {
  ci?: boolean;
  ignoreFolders?: string[];
  ignoreNames?: string[];
  quiet?: boolean;
  noProgress?: boolean;
}

export interface IReportSummary {
  totalCount: number;
  filesAffected: number;
  functionCount: number;
  variableCount: number;
  importCount: number;
  otherCount: number;
  fileGroups: Map<string, IDeadCodeReport[]>;
}
