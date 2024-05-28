export interface IDeadCodeInfo {
  count: number;
  declaredIn: {
    filePath: string;
    line: number;
  }[];
}
