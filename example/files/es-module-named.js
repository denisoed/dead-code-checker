// Named exports - used
export function usedFunction() {
  return 'used';
}

// Named export - unused - should be detected as dead code
export function unusedFunction() {
  return 'unused';
}

// Named export const - used
export const usedConstant = 'used';

// Named export const - unused - should be detected as dead code
export const unusedConstant = 'unused';

// Named export class - used
export class UsedClass {
  method() {
    return 'used';
  }
}

// Named export class - unused - should be detected as dead code
export class UnusedClass {
  method() {
    return 'unused';
  }
}

// Multiple named exports - some used, some unused
export const usedVar = 'used';
export const unusedVar = 'unused'; // should be detected as dead code

