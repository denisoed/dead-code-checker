// Circular dependency A -> B
import { functionB } from './circular-dependencies-b.js';

// Used function exported to B
export function functionA() {
  return 'A';
}

// Unused function - should be detected as dead code
export function unusedFunctionA() {
  return 'unused A';
}

// Use function from B
functionA();
functionB();

// Local unused function - should be detected as dead code
function localUnusedA() {
  return 'unused local A';
}

