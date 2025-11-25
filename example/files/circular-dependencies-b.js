// Circular dependency B -> A
import { functionA } from './circular-dependencies-a.js';

// Used function exported to A
export function functionB() {
  return 'B';
}

// Unused function - should be detected as dead code
export function unusedFunctionB() {
  return 'unused B';
}

// Use function from A
functionB();
functionA();

// Local unused function - should be detected as dead code
function localUnusedB() {
  return 'unused local B';
}

