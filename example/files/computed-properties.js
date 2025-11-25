// Used computed property
const prop = 'name';
const obj = {
  [prop]: 'John',
  age: 30
};
console.log(obj.name);

// Unused computed property - should be detected as dead code
const unusedProp = 'value';
const unusedObj = {
  [unusedProp]: 'unused'
};

// Used computed property in function
function createObject(key, value) {
  return {
    [key]: value
  };
}

// Unused computed property function - should be detected as dead code
function unusedCreate(key, value) {
  return {
    [key]: value
  };
}

const result = createObject('test', 'value');

// Used method name as computed property
const methodName = 'greet';
const person = {
  [methodName]() {
    return 'Hello';
  }
};
person.greet();

// Unused computed method - should be detected as dead code
const unusedMethod = 'say';
const unusedPerson = {
  [unusedMethod]() {
    return 'unused';
  }
};

