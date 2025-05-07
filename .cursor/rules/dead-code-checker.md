# Dead Code Checker - Project Rules

## Code Organization

- Main functionality is implemented in the `DeadCodeChecker` class in `src/index.ts`
- Interfaces are defined in `src/interfaces.ts`
- Configuration constants are in `src/config.ts`
- Reserved words are defined in `src/reserved.ts`
- CLI interface is implemented in `bin/index.js`

## Implementation Patterns

- Regular expressions are used for code analysis rather than AST parsing
- The tool identifies dead code by counting occurrences of declared names
- Names with a count of 1 (only declaration, no usage) are considered dead code
- Special handling exists for names in return statements and module exports

## Project Conventions

- TypeScript is used for type safety
- ES Modules are used for modern JavaScript compatibility
- Multiple distribution formats are generated (CJS, ESM, UMD)
- Jest is used for testing
- Prettier is used for code formatting

## Important Design Decisions

- Focus on lightweight implementation without heavy dependencies
- Simple file filtering based on extensions and ignore patterns
- Configurable options for CLI and API use
- CI/CD integration with exit codes

## User Preferences

- Clean, concise code with meaningful variable names
- Thorough documentation in README and code
- Support for multiple JavaScript frameworks
- Simple, easy-to-use interfaces

## Key Workflows

1. Scanning source files for declared names
2. Analyzing usage of declared names across all files
3. Generating reports of unused names (dead code)
4. Displaying results or returning them programmatically

## Testing Strategy

- Unit tests for core functionality
- Example usage in `example/` directory
- Manual testing with various project structures

## Release Process

- Semantic versioning
- npm publish after successful tests
- Version bump scripts for patch, minor, and major releases
