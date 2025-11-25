// Used variables in template literals
const name = 'John';
const age = 30;
const message = `Hello, ${name}! You are ${age} years old.`;
console.log(message);

// Unused variables - should be detected as dead code
const unusedName = 'Jane';
const unusedAge = 25;
const unusedMessage = `Unused: ${unusedName} is ${unusedAge}`;

// Used in function with template literal
function greet(personName) {
  return `Hello, ${personName}!`;
}

// Unused function with template literal - should be detected as dead code
function unusedGreet(name) {
  return `Unused greeting for ${name}`;
}

greet('World');

// Tagged template literal - used
function tag(strings, ...values) {
  return strings[0] + values[0];
}

const result = tag`Hello ${name}`;

// Unused tagged template - should be detected as dead code
function unusedTag(strings, ...values) {
  return 'unused';
}

const unusedResult = unusedTag`Test ${unusedName}`;

