// Used rest operator
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

// Unused rest parameter - should be detected as dead code
function unusedRest(...args) {
  return 'unused';
}

// Used spread operator
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
console.log(arr2);

// Used object spread
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };
console.log(obj2);

// Unused spread - should be detected as dead code
const unusedArr = [...arr1];
const unusedObj = { ...obj1 };

// Rest in destructuring - used
const [first, ...rest] = [1, 2, 3, 4];
console.log(first, rest);

// Rest in destructuring - unused - should be detected as dead code
const [unusedFirst, ...unusedRest] = [10, 20, 30];

sum(1, 2, 3);

