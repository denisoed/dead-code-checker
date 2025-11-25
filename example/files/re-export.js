// Re-export named exports - used
export { usedFunction, usedConstant } from './es-module-named.js';

// Re-export with alias - used
export { usedFunction as reExportedFunction } from './es-module-named.js';

// Re-export unused - should be detected as dead code
export { unusedFunction as reExportedUnused } from './es-module-named.js';

// Re-export default - used
export { default as reExportedDefault } from './es-module-default.js';

// Re-export all - used
export * from './es-module-named.js';

// Re-export default as named - used
export { default } from './es-module-default.js';

