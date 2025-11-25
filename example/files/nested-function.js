// Outer function - used
function outerFunction() {
  // Inner function - used within outer
  function innerFunction() {
    return 'inner';
  }
  
  // Another inner function - unused even in outer - should be detected as dead code
  function unusedInner() {
    return 'unused';
  }
  
  return innerFunction();
}

// Unused outer function - should be detected as dead code
function unusedOuter() {
  function inner() {
    return 'unused';
  }
  return inner();
}

// Use outer function
outerFunction();

// Arrow function with nested function
const outerArrow = () => {
  const inner = () => 'used';
  const unusedInner = () => 'unused'; // should be detected as dead code
  
  return inner();
};

outerArrow();

