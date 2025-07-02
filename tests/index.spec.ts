import { isExternalPackage } from '../src/core/analysis';

describe('External Package Detection', () => {
  test('should distinguish external packages from local modules', () => {
    // External packages (should not be considered dead code)
    expect(isExternalPackage('react')).toBe(true);
    expect(isExternalPackage('clsx')).toBe(true);
    expect(isExternalPackage('lodash')).toBe(true);
    expect(isExternalPackage('@types/node')).toBe(true);
    
    // Local modules (should be analyzed for dead code)
    expect(isExternalPackage('./component')).toBe(false);
    expect(isExternalPackage('../utils')).toBe(false);
    expect(isExternalPackage('@/components/Button')).toBe(false);
    expect(isExternalPackage('/absolute/path')).toBe(false);
  });

  test('should understand the logic for external package usage', () => {
    // This test documents the expected behavior:
    // 1. External packages that are imported and USED - NOT dead code
    // 2. External packages that are imported but NOT USED - SHOULD be dead code
    // 3. Local imports that are not found - dead code (import error)
    
    expect(isExternalPackage('react')).toBe(true); // External package
    expect(isExternalPackage('./local-file')).toBe(false); // Local import
    
    // The dead code checker should:
    // - Allow external packages that are used (like clsx in example/index.tsx)
    // - Flag external packages that are unused (like lodash if not used)
    // - Flag local imports that don't exist
  });
});
