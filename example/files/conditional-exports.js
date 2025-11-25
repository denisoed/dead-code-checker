// Conditional exports - used
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS
  module.exports = {
    usedExport: 'used',
    unusedExport: 'unused' // should be detected as dead code
  };
}

// Conditional ES module export
if (true) {
  export const conditionalUsed = 'used';
  export const conditionalUnused = 'unused'; // should be detected as dead code
}

// Conditional function - used
const usedConditional = typeof window !== 'undefined' 
  ? function() { return 'browser'; }
  : function() { return 'node'; };

// Unused conditional - should be detected as dead code
const unusedConditional = typeof window !== 'undefined'
  ? function() { return 'unused browser'; }
  : function() { return 'unused node'; };

// Use conditional
usedConditional();

// Environment-based exports
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // Used in dev
  function devOnlyFunction() {
    console.log('dev only');
  }
  devOnlyFunction();
}

// Unused dev function - should be detected as dead code
if (isDevelopment) {
  function unusedDevFunction() {
    console.log('unused dev');
  }
}

