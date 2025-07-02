# Active Context

## Current Focus

Recently completed a critical bug fix in symbol usage analysis that was causing false negatives for unused external packages. Specifically resolved the issue where `lodash` and similar external packages were incorrectly marked as "used" when they were actually imported but never utilized in the code.

## Current State

- Core scanning engine is implemented and working with enhanced accuracy
- CLI interface is functional with all necessary options
- API interface is available for programmatic use
- Support for multiple JavaScript frameworks is in place
- CI/CD integration is supported
- **ENHANCED**: External package analysis now correctly distinguishes between used and unused imports
- **FIXED**: Symbol usage counting algorithm completely overhauled for accuracy
- **NEW**: Added `countActualUsage()` function for precise usage detection
- Recently expanded file type support to include additional JavaScript/TypeScript module formats (.mjs, .cjs, .mts, .cts)

## Recent Changes

- **CRITICAL FIX**: Resolved false negative bug in external package detection
  - Previously, symbols like `lodash` in `import lodash from "lodash"` were incorrectly counted as "used" due to multiple occurrences in the import line
  - Replaced flawed `analyzeSymbolUsage` logic with new `countActualUsage` function
  - New approach processes files line-by-line, completely skipping import/export/declaration lines
  - Now correctly identifies unused external packages as dead code
- **MAJOR**: Improved import analysis logic to distinguish external packages from local modules
  - External packages (like `react`, `clsx`, `lodash`) are now properly analyzed for actual usage
  - Local imports (relative paths, path aliases) continue to be properly analyzed
  - Added `isExternalPackage()` function to identify npm packages vs local modules
- Updated data structures to store import source information
- Enhanced `isDeadCode()` logic to handle external packages correctly
- Added comprehensive tests for external package detection
- Fixed TypeScript compilation and Jest configuration for testing

## Active Decisions

1. **Detection Strategy**: Enhanced regex-based pattern matching with line-by-line analysis
   - Pros: Lightweight, fast, no heavy dependencies, now much more accurate
   - Recent improvement: Complete line exclusion vs partial regex subtraction
   - Cons: Still may have edge cases where complex syntax isn't properly detected
2. **Usage Counting Algorithm**: Completely rewritten for accuracy
   - Old approach: Count all occurrences, subtract imports/exports/declarations (flawed)
   - New approach: Skip entire lines containing imports/exports/declarations (accurate)
   - Eliminates false positives from multi-occurrence symbols in single lines
3. **Import Analysis Enhancement**: Now distinguishes between external packages and local modules
   - External packages: Identified by import paths that don't start with '.', '/', or '@/'
   - Local modules: Analyzed for dead code as before
   - Combined with new usage counting for comprehensive accuracy
4. **File Filtering**: Using extension-based filtering with ignore patterns
   - Pros: Simple to understand and configure
   - Cons: May require additions as new file types become popular
5. **Report Format**: Simple CLI output with file paths, line numbers, and names
   - Pros: Easy to read and understand
   - Cons: May benefit from more structured output formats (JSON, HTML, etc.)

## Current Challenges

1. **Complex Syntax**: Advanced JavaScript patterns might not be properly detected
2. **Performance**: Large codebases may take significant time to analyze
3. **Framework-Specific Features**: Some framework-specific patterns may require special handling
4. **Edge Cases**: Need ongoing monitoring for new edge cases in symbol usage detection

## Immediate Next Steps

1. Monitor the new usage counting algorithm for any edge cases
2. Gather user feedback on the significantly improved detection accuracy
3. Consider potential optimizations for large codebases
4. Add support for additional file types if needed
5. Consider adding structured output formats (JSON, HTML)

## Open Questions

1. Should the tool use AST parsing for even more accurate detection?
2. Are there additional edge cases in the new line-by-line counting approach?
3. Would a visual report format be beneficial for users?
4. Could the performance be improved for large codebases?
5. Should we add configuration options for custom external package patterns?
6. Are there other symbol usage patterns that need similar line-level analysis?
