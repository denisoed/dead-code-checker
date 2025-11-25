// Mixed exports - named and default
export const namedConst = 'used';

export function namedFunction() {
  return 'used';
}

// Unused named export - should be detected as dead code
export const unusedNamed = 'unused';

// Default export
const defaultValue = 'used';
export default defaultValue;

// Export object with multiple properties
export const config = {
  usedProp: 'used',
  unusedProp: 'unused' // should be detected as dead code if not used
};

// Re-export from another module (if exists)
// export { something } from './other-module';

