// Variable shadowing - used
const globalVar = 'global';

function outer() {
  const globalVar = 'local'; // shadows global
  console.log(globalVar);
  
  function inner() {
    const globalVar = 'inner'; // shadows outer
    console.log(globalVar);
  }
  
  inner();
}

outer();

// Unused shadowed variable - should be detected as dead code
function unusedOuter() {
  const unusedShadow = 'outer';
  
  function unusedInner() {
    const unusedShadow = 'inner'; // both should be detected as dead code
    return unusedShadow;
  }
  
  return unusedShadow;
}

// Block scope shadowing - used
let x = 1;
if (true) {
  let x = 2; // shadows outer x
  console.log(x);
}
console.log(x);

// Unused block shadowing - should be detected as dead code
let y = 1;
if (true) {
  let y = 2; // unused
}

