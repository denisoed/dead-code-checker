// Used destructuring
const { name, age } = { name: 'John', age: 30 };
console.log(name, age);

// Unused destructured variables - should be detected as dead code
const { unused1, unused2 } = { unused1: 'a', unused2: 'b' };

// Used array destructuring
const [first, second] = [1, 2, 3];
console.log(first, second);

// Unused array destructuring - should be detected as dead code
const [unusedA, unusedB] = [10, 20];

// Nested destructuring - used
const { user: { username, email } } = { user: { username: 'john', email: 'john@example.com' } };
console.log(username, email);

// Nested destructuring - unused - should be detected as dead code
const { data: { value1, value2 } } = { data: { value1: 1, value2: 2 } };

// Function parameter destructuring - used
function processUser({ name, id }) {
  return `${name} (${id})`;
}

// Function parameter destructuring - unused - should be detected as dead code
function unusedProcess({ unusedParam1, unusedParam2 }) {
  return 'unused';
}

processUser({ name: 'John', id: 1 });

