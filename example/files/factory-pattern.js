// Factory pattern - used
function createUser(name, age) {
  // Used private function
  function validateAge(age) {
    return age > 0 && age < 150;
  }
  
  // Unused private function - should be detected as dead code
  function unusedValidator() {
    return true;
  }
  
  if (!validateAge(age)) {
    throw new Error('Invalid age');
  }
  
  // Return object with used methods
  return {
    name,
    age,
    // Used method
    getName() {
      return name;
    },
    // Unused method - should be detected as dead code
    getAge() {
      return age;
    },
    // Used method
    greet() {
      return `Hello, ${name}!`;
    }
  };
}

// Use factory
const user = createUser('John', 30);
user.getName();
user.greet();

// Another factory - used
function createCounter(initial = 0) {
  let count = initial;
  
  return {
    // Used methods
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    // Unused method - should be detected as dead code
    reset() {
      count = initial;
    },
    // Used getter
    get value() {
      return count;
    }
  };
}

// Use counter factory
const counter = createCounter(5);
counter.increment();
counter.decrement();
const value = counter.value;

