# Project Brief: Dead Code Checker

## Overview

Dead Code Checker is a tool for finding unused code (dead code) in JavaScript or TypeScript projects. It helps developers maintain cleaner, more maintainable codebases by identifying functions and variables that are declared but never used.

## Core Objectives

1. Scan JavaScript/TypeScript projects for unused functions and variables
2. Generate detailed reports of dead code with file paths and line numbers
3. Provide both CLI and programmatic API interfaces
4. Support major JavaScript frameworks (React, Vue, Angular, etc.)
5. Enable CI/CD integration for automated dead code detection

## Main Features

- **Variable Detection**: Detect declared variables and verify their usage
- **Function Detection**: Identify declared functions and check if they are used
- **Framework Support**: Work with any JavaScript framework (React, Vue, Angular, etc.)
- **Detailed Reporting**: Provide file paths and line numbers for dead code
- **CLI Interface**: Easy to use command-line interface with configurable options
- **API Integration**: Programmatic API for integration with other tools
- **CI/CD Support**: Special mode for CI/CD pipelines to fail builds when dead code is detected

## Technology Stack

- TypeScript/JavaScript
- Node.js
- File system manipulation
- Regular expressions for code parsing
- CLI tools (Commander.js)
- Build tools (Rollup, Babel)

## Project Scope

The tool focuses on static code analysis through pattern matching and does not perform runtime analysis. It works by scanning source files, identifying declared names, and checking for their usage across the codebase.

## Success Metrics

- Accurately identify unused functions and variables
- Minimize false positives
- Provide clear, actionable reports
- Function effectively across different JavaScript/TypeScript project structures
- Perform efficiently on large codebases
