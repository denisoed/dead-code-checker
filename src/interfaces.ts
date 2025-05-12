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

export interface IDeadCodeReport {
  name: string;
  line: number;
  filePath: string;
}

export interface IDeadCodeParams {
  ci?: boolean;
  ignoreFolders?: string[];
  ignoreNames?: string[];
}
