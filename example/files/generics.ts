// Used generic function
function identity<T>(arg: T): T {
  return arg;
}

// Unused generic function - should be detected as dead code
function unusedGeneric<T>(arg: T): T {
  return arg;
}

// Used generic class
class Container<T> {
  private value: T;
  
  constructor(value: T) {
    this.value = value;
  }
  
  getValue(): T {
    return this.value;
  }
  
  // Unused method - should be detected as dead code
  setValue(value: T): void {
    this.value = value;
  }
}

// Unused generic class - should be detected as dead code
class UnusedContainer<T> {
  private value: T;
  
  constructor(value: T) {
    this.value = value;
  }
}

// Multiple type parameters - used
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// Unused multiple generics - should be detected as dead code
function unusedPair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// Constrained generic - used
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): void {
  console.log(arg.length);
}

// Unused constrained generic - should be detected as dead code
function unusedLogLength<T extends Lengthwise>(arg: T): void {
  console.log('unused');
}

// Use generics
const result = identity<string>('test');
const container = new Container<number>(42);
container.getValue();
const p = pair<string, number>('hello', 42);
logLength('test');

