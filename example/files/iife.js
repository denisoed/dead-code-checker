// IIFE - Immediately Invoked Function Expression
// Used IIFE
(function() {
  const localVar = 'used';
  console.log(localVar);
})();

// Unused IIFE - should be detected as dead code
(function unusedIIFE() {
  console.log('unused');
})();

// Named IIFE that might be used
(function namedIIFE() {
  const value = 'used';
  return value;
})();

// Arrow function IIFE
(() => {
  const arrowVar = 'used';
  console.log(arrowVar);
})();

// Unused arrow IIFE - should be detected as dead code
(() => {
  console.log('unused');
})();

