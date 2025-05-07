import fs from 'fs';
import path from 'path';
import { IGNORE_FOLDERS, DEFAULT_EXTENSIONS, REGEX } from '../config';
import { IDeadCodeParams } from '../interfaces';

/**
 * Gets all files in a directory recursively
 */
export function getAllFiles(
  dirPath: string,
  arrayOfFiles: string[] = [],
  params?: IDeadCodeParams
): string[] {
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach((file: string) => {
      const fullPath: string = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!shouldIgnoreFolder(file, params)) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, params);
        }
      } else if (isValidFileExtension(file)) {
        arrayOfFiles.push(fullPath);
      }
    });
    return arrayOfFiles;
  } catch (error) {
    return [];
  }
}

/**
 * Checks if a folder should be ignored
 */
export function shouldIgnoreFolder(
  folderName: string,
  params?: IDeadCodeParams
): boolean {
  return [...IGNORE_FOLDERS, ...(params?.ignoreFolders || [])].some(
    (pattern: string | RegExp) => {
      if (typeof pattern === 'string') {
        return folderName === pattern;
      } else if (pattern instanceof RegExp) {
        return pattern.test(folderName);
      }
      return false;
    }
  );
}

/**
 * Checks if a file has a valid extension
 */
export function isValidFileExtension(fileName: string): boolean {
  return DEFAULT_EXTENSIONS.some(ext => fileName.endsWith(ext));
}

/**
 * Reads file content
 */
export function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return '';
  }
}

/**
 * Removes comments from file content
 */
export function removeComments(fileContent: string): string {
  return fileContent.replace(REGEX.COMMENTS, '');
}

/**
 * Finds the line number for a given index in the content
 */
export function findLineNumber(content: string, matchIndex: number): number {
  return (content.substring(0, matchIndex).match(/\n/g) || []).length + 1;
}
