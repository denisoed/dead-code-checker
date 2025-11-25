export const functionRegex = /\bfunction\s([a-zA-Z0-9_]+)\s*\(/g;
export const functionExpressionRegex =
  /\b(?:const|let|var)\s([a-zA-Z0-9_]+)\s*=\s*function\s*\(/g;
export const arrowFunctionRegex = /\bconst\s+([a-zA-Z0-9_]+)\s*=\s*\(/g;
export const methodRegex = /([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/g;
export const onlyInReturnRegex = /\breturn\s*{([^}]*)}/g;
export const onlyModuleExportsRegex = /\bmodule\.exports\s*=\s*{([^}]*)}/g;
export const variableRegex =
  /\b(?:const|let|var)\s+([a-zA-Z0-9_]+)(?:\s*=\s*[^;,]*|)\s*(?:;|\n|$)/g;
