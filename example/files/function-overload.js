// Multiple functions with same name (different signatures)
// First declaration - used
function processValue(value) {
  return value.toString();
}

// Second declaration with same name - used
function processValue(value, format) {
  return format ? value.toString().toUpperCase() : value.toString();
}

// Unused function with different name - should be detected as dead code
function unusedProcess() {
  return 'unused';
}

// Use the functions
const result1 = processValue(123);
const result2 = processValue(123, true);

// Another unused function - should be detected as dead code
function anotherUnused() {
  return 'unused';
}

