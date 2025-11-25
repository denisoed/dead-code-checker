// Import with alias - used
import { usedFunction as usedFn } from './es-module-named.js';

// Import with alias - unused - should be detected as dead code
import { unusedFunction as unusedFn } from './es-module-named.js';

// Default import with alias - used
import defaultExport from './es-module-default.js';

// Default import with alias - unused - should be detected as dead code
import unusedDefault from './es-module-default.js';

// Multiple imports with aliases
import { usedConstant as usedConst, unusedConstant as unusedConst } from './es-module-named.js';

// Use imported items
usedFn();
usedConst;
defaultExport();

