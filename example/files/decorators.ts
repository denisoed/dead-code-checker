// Decorator function - used
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey}`);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

// Unused decorator - should be detected as dead code
function unusedDecorator(target: any, propertyKey: string) {
  // unused
}

// Class with used decorator
class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
  
  // Method with unused decorator - should be detected as dead code
  @unusedDecorator
  subtract(a: number, b: number): number {
    return a - b;
  }
  
  // Unused method - should be detected as dead code
  multiply(a: number, b: number): number {
    return a * b;
  }
}

// Property decorator - used
function readonly(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    writable: false
  });
}

// Unused property decorator - should be detected as dead code
function unusedPropertyDecorator(target: any, propertyKey: string) {
  // unused
}

class Person {
  @readonly
  name: string = 'John';
  
  @unusedPropertyDecorator
  unusedProp: string = 'unused'; // should be detected as dead code
}

// Use class
const calc = new Calculator();
calc.add(1, 2);

const person = new Person();
console.log(person.name);

