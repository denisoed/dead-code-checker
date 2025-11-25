// Function with default parameters - used
function greet(name = 'Guest', greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

// Unused function with default params - should be detected as dead code
function unusedGreet(name = 'User', age = 0) {
  return `Unused: ${name}, ${age}`;
}

// Arrow function with default params - used
const calculate = (a = 0, b = 0) => {
  return a + b;
};

// Unused arrow with default params - should be detected as dead code
const unusedCalculate = (x = 1, y = 1) => {
  return x * y;
};

// Use functions
greet('John');
calculate(5, 10);

