# Dead Code Checker - Project Rules

## Code Organization

- Main functionality is implemented in the `DeadCodeChecker` class in `src/index.ts`
- **Core Analysis**: Critical logic in `src/core/analysis.ts` - contains `analyzeSymbolUsage` and `countActualUsage`
- **Import Processing**: Enhanced logic in `src/core/declarations.ts` for external vs local imports
- **Reporting**: Enhanced reporting in `src/core/reporting.ts` for external package handling
- Interfaces are defined in `src/interfaces.ts`
- Configuration constants are in `src/config.ts`
- Reserved words are defined in `src/reserved.ts`
- CLI interface is implemented in `bin/index.js`

## Critical Implementation Patterns

### Symbol Usage Analysis (MOST CRITICAL)
- **CRITICAL FUNCTION**: `analyzeSymbolUsage` in `src/core/analysis.ts` determines accuracy
- **CRITICAL PATTERN**: Use `countActualUsage` for line-level analysis, NOT simple regex counting
- **MAJOR BUG PATTERN**: Never use `totalCount - declarations - imports - exports` approach
- **CORRECT APPROACH**: Skip entire lines containing imports/exports/declarations
- **Testing**: Always test with symbols appearing multiple times in import statements (e.g., `import lodash from "lodash"`)

### External Package Detection
- **Key Function**: `isExternalPackage()` distinguishes npm packages from local modules
- **Pattern**: External packages don't start with '.', '/', or '@/'
- **Integration**: Must combine with accurate usage counting to detect unused external imports
- **Test File**: `example/test-unused-external.tsx` is the primary validation case

### Build & Test Workflow
- **REQUIRED**: `npm run build` after any changes to `src/` directory
- **Primary Test**: `node bin/index.js -f example` for comprehensive testing
- **Specific Test**: `node bin/index.js -f example/test-unused-external.tsx` for external package validation

## Implementation Patterns

- Regular expressions are used for code analysis rather than AST parsing
- **Enhanced**: The tool identifies dead code through sophisticated line-level usage analysis
- **Enhanced**: External packages are analyzed differently from local modules
- Names with zero actual usage (excluding declarations/imports/exports) are considered dead code
- Special handling exists for names in return statements and module exports

## File Support

- JavaScript: .js, .jsx, .mjs, .cjs
- TypeScript: .ts, .tsx, .mts, .cts
- Component files: .vue, .svelte, .astro, .html
- Prioritizes files that may contain actual code (not config or style files)

## Project Conventions

- TypeScript is used for type safety
- ES Modules are used for modern JavaScript compatibility
- Multiple distribution formats are generated (CJS, ESM, UMD)
- Jest is used for testing
- Prettier is used for code formatting

## Important Design Decisions

- Focus on lightweight implementation without heavy dependencies
- **Enhanced**: Line-level analysis for maximum accuracy while maintaining performance
- Simple file filtering based on extensions and ignore patterns
- Configurable options for CLI and API use
- CI/CD integration with exit codes
- Comprehensive file type support for all JavaScript/TypeScript module formats
- **Critical**: Distinguish between external packages and local modules for accurate analysis

## User Preferences

- Clean, concise code with meaningful variable names
- Thorough documentation in README and code
- Support for multiple JavaScript frameworks
- Simple, easy-to-use interfaces
- **Priority**: High accuracy with minimal false positives and false negatives

## Key Workflows

1. Scanning source files for declared names
2. **Enhanced**: Processing imports to distinguish external vs local modules
3. **Enhanced**: Line-level analysis of symbol usage excluding declaration contexts
4. **Enhanced**: Specialized handling for external package usage detection
5. Generating reports of unused names (dead code)
6. Displaying results or returning them programmatically

## Critical Debugging Patterns

### When External Packages Show Wrong Results
1. Check `countActualUsage` function is being used
2. Verify line-level exclusion logic for imports/exports/declarations
3. Test with debug scripts using `.cjs` files (avoid ES module issues)
4. Validate `isExternalPackage` classification

### Testing Strategy
- **Primary Test Files**: 
  - `example/test-unused-external.tsx` - External package detection
  - `example/` directory - Comprehensive validation
- Unit tests for core functionality
- **Debug Pattern**: Create focused `.cjs` test scripts for isolated debugging
- Manual testing with various project structures
- **Always Test**: Symbols with multiple occurrences in single lines

## Common Pitfalls to Avoid

1. **Symbol Counting**: Never use simple regex counting without line context
2. **Import Analysis**: Always distinguish external packages from local modules  
3. **Build Process**: Always rebuild after source changes before testing
4. **Testing**: Test both used and unused external packages
5. **Debugging**: Use CommonJS (`.cjs`) files for debugging to avoid ES module complications

## Release Process

- Semantic versioning
- npm publish after successful tests
- Version bump scripts for patch, minor, and major releases
- **Enhanced**: Comprehensive testing with external package scenarios before release
