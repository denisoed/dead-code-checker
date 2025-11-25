// Dynamic function calls - used
const functionName = 'usedFunction';

function usedFunction() {
  return 'used';
}

function unusedFunction() {
  return 'unused';
}

// Dynamic call - used
const obj = {
  usedFunction() {
    return 'used';
  },
  unusedFunction() {
    return 'unused';
  }
};

// Dynamic method call - used
obj[functionName]();

// Call by string - might be used
window[functionName](); // if in browser context

// eval usage - used (if supported)
eval('usedFunction()');

// Unused dynamic call - should be detected as dead code
const unusedName = 'unusedFunction';
// obj[unusedName](); // commented out, so unused

// Function stored in variable - used
const fn = usedFunction;
fn();

// Function stored in variable - unused - should be detected as dead code
const unusedFn = unusedFunction;

