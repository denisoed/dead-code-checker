// Class with static methods
class MathUtils {
  // Used static method
  static add(a, b) {
    return a + b;
  }
  
  // Unused static method - should be detected as dead code
  static subtract(a, b) {
    return a - b;
  }
  
  // Used static method
  static multiply(a, b) {
    return a * b;
  }
  
  // Unused static method - should be detected as dead code
  static divide(a, b) {
    return a / b;
  }
}

// Use static methods
MathUtils.add(1, 2);
MathUtils.multiply(3, 4);

// Another class
class StringUtils {
  // Used static method
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  // Unused static method - should be detected as dead code
  static reverse(str) {
    return str.split('').reverse().join('');
  }
}

StringUtils.capitalize('hello');

