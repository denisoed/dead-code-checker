// Closure with used variables
function createCounter() {
  let count = 0; // used in closure
  
  return {
    increment() {
      count++; // uses count
      return count;
    },
    getValue() {
      return count; // uses count
    }
  };
}

// Closure with unused variables - should be detected as dead code
function createUnusedCounter() {
  let unusedCount = 0; // unused in closure
  
  return {
    increment() {
      return 1; // doesn't use unusedCount
    }
  };
}

// Nested closures
function outerFunction() {
  const outerVar = 'outer'; // used
  
  function middleFunction() {
    const middleVar = 'middle'; // used
    const unusedMiddle = 'unused'; // should be detected as dead code
    
    function innerFunction() {
      console.log(outerVar, middleVar); // uses both
      const unusedInner = 'unused'; // should be detected as dead code
    }
    
    return innerFunction;
  }
  
  return middleFunction;
}

// Use closures
const counter = createCounter();
counter.increment();
counter.getValue();

const outer = outerFunction();
const middle = outer();
middle();

