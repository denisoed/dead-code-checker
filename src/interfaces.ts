export interface IDeadCodeInfo {
  count: number;
  declaredIn: {
    filePath: string;
    line: number;
  }[];
}

export interface IDeadCodeParams {
  ignoreFolders: string[];
}
