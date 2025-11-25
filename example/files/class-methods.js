// Class with used and unused methods
class Calculator {
  // Used method
  add(a, b) {
    return a + b;
  }
  
  // Unused method - should be detected as dead code
  subtract(a, b) {
    return a - b;
  }
  
  // Used method
  multiply(a, b) {
    return a * b;
  }
  
  // Unused method - should be detected as dead code
  divide(a, b) {
    return a / b;
  }
}

// Use class methods
const calc = new Calculator();
calc.add(1, 2);
calc.multiply(3, 4);

// Another class
class Logger {
  // Used method
  log(message) {
    console.log(message);
  }
  
  // Unused method - should be detected as dead code
  error(message) {
    console.error(message);
  }
}

const logger = new Logger();
logger.log('test');

