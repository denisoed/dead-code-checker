# System Patterns

## Architecture Overview

Dead Code Checker follows a simple, modular architecture that consists of:

1. **Core Scanning Engine**: The main `DeadCodeChecker` class that orchestrates the analysis process
2. **File System Traversal**: Recursive directory scanning with configurable filters
3. **Code Analysis**: Regular expression-based pattern matching to detect declarations and usages
4. **Reporting System**: Collection and display of dead code information
5. **CLI & API Interfaces**: Multiple ways to interact with the tool

## Key Components

### DeadCodeChecker Class

The main class that implements the core functionality:

- Initializes with a target directory and optional configuration
- Manages the scanning and analysis process
- Maintains the state of analyzed code and results
- Provides both direct execution and an API for programmatic use

### Pattern Detection System

Uses regular expressions to:

- Detect function declarations (function statements, expressions, arrow functions)
- Identify variable declarations
- Recognize method definitions
- Find usages of declared functions and variables
- Handle special cases like module exports and return statements

### Configuration System

Provides flexibility through:

- Default configurations for common use cases
- Command-line options for CLI usage
- Constructor parameters for API usage
- Handling of ignore patterns for files, directories, and specific names

### Reporting System

Generates and displays reports:

- Collects information about dead code (name, file path, line number)
- Formats reports for CLI output with colored text
- Returns structured data for API consumers
- Handles CI mode with appropriate exit codes

## Design Patterns

### Singleton Pattern

The main `DeadCodeChecker` class acts as a singleton for each analysis session, maintaining state throughout the process.

### Command Pattern

The CLI interface uses the Command pattern via Commander.js to define and handle various command options.

### Facade Pattern

The public API provides a simple facade over the complex internal scanning and analysis logic.

### Builder Pattern

The configuration system allows step-by-step building of analysis parameters.

## Data Flow

1. **Input Phase**:
   - Receive target directory and configuration options
   - Set up analysis parameters
2. **Scanning Phase**:
   - Recursively traverse the directory structure
   - Filter files based on extensions and ignore patterns
   - Read file contents for analysis
3. **Analysis Phase**:
   - Detect declarations of functions and variables
   - Track occurrences of each declared name
   - Identify potential dead code based on usage counts
4. **Reporting Phase**:
   - Generate detailed reports of unused code
   - Display results or return them programmatically
   - Exit with appropriate status codes in CI mode
