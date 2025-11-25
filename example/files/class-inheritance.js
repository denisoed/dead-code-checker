// Base class
class Animal {
  // Used method in base class
  speak() {
    return 'Some sound';
  }
  
  // Unused method in base class - should be detected as dead code
  sleep() {
    return 'Sleeping';
  }
}

// Derived class
class Dog extends Animal {
  // Override method - used
  speak() {
    return 'Woof!';
  }
  
  // New method - used
  fetch() {
    return 'Fetching ball';
  }
  
  // Unused method - should be detected as dead code
  bark() {
    return 'Bark!';
  }
}

// Another derived class
class Cat extends Animal {
  // Override method - used
  speak() {
    return 'Meow!';
  }
  
  // Unused method - should be detected as dead code
  purr() {
    return 'Purring';
  }
}

// Use classes
const dog = new Dog();
dog.speak();
dog.fetch();

const cat = new Cat();
cat.speak();

