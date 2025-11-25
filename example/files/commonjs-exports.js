// CommonJS exports - used
function usedFunction() {
  return 'used';
}

// Unused function - should be detected as dead code
function unusedFunction() {
  return 'unused';
}

// Module.exports object - used
module.exports = {
  usedFunction,
  usedConstant: 'used'
};

// Exports.property - used
exports.usedProperty = 'used';

// Exports.property - unused - should be detected as dead code
exports.unusedProperty = 'unused';

// Exports function - used
exports.usedMethod = function() {
  return 'used';
};

// Exports function - unused - should be detected as dead code
exports.unusedMethod = function() {
  return 'unused';
};

