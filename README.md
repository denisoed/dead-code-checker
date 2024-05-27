# Dead Code Checker

`Dead Code Checker` is a tool for finding unused functions and variables in your JavaScript, TypeScript, and Vue.js projects. It helps to identify and remove dead code, ensuring a cleaner and more maintainable codebase.

## Features

- `Function Detection:` Identifies declared functions and checks if they are used across your project.
- `Variable Detection:` Detects declared variables and verifies their usage.
- `Vue.js Support:` Specifically tailored to handle Vue.js methods and setup return values.
- `Detailed Report:` Provides a detailed report of unused functions and variables, including the file and line number where they are declared.

## Installation

You can install Dead Code Checker using npm:

```bash
npx dead-code-checker
```

To use Dead Code Checker, simply run the following command in your project directory:

```bash
dead-code-checker -h
```

The tool will recursively scan through your project's source files and generate a report of unused functions and variables.

## Example Output

Unused Functions:

| 📁 File                           | 🔢 Line | 🔍 Function |
| --------------------------------- | :-----: | ----------: |
| /path/to/your/project/src/file.js |   17    |  myFunction |

Unused Variables:

| 📁 File                                  | 🔢 Line | 🔍 Function |
| ---------------------------------------- | :-----: | ----------: |
| /path/to/your/project/src/anotherFile.js |    4    |  myVariable |

If no unused functions or variables are found, you'll see a message like this:

```bash
✅ No unused functions found!
✅ No unused variables found!
```

## Contributing

Contributions are welcome!

If you find a bug or have a feature request, please open an issue on GitHub. Feel free to fork the repository and submit pull requests.

## License

This project is licensed under the MIT License.
