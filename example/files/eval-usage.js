// Eval with used code
function usedFunction() {
  return 'used';
}

// Eval calling used function - might be detected
eval('usedFunction()');

// Eval with unused code - should be detected as dead code
function unusedFunction() {
  return 'unused';
}

// Eval with string - hard to detect
const code = 'unusedFunction()';
eval(code);

// Function constructor - used
const usedFn = new Function('return "used"');
usedFn();

// Function constructor - unused - should be detected as dead code
const unusedFn = new Function('return "unused"');

// setTimeout with string - used
setTimeout('usedFunction()', 100);

// setTimeout with string - unused - should be detected as dead code
setTimeout('unusedFunction()', 100);

