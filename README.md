# Dead Code Checker

`Dead Code Checker` is a tool for finding unused functions and variables in your JavaScript, TypeScript, and Vue.js projects. It helps to identify and remove dead code, ensuring a cleaner and more maintainable codebase.

## Features

- `Function Detection:` Identifies declared functions and checks if they are used across your project.
- `Variable Detection:` Detects declared variables and verifies their usage.
- `Vue.js Support:` Specifically tailored to handle Vue.js methods and setup return values.
- `Detailed Report:` Provides a detailed report of unused functions and variables, including the file and line number where they are declared.

## Installation

You can install Dead Code Checker using npx:

```bash
npx dead-code-checker
```

To use Dead Code Checker, simply run the following command in your project directory:

```bash
dead-code-checker -p ./src
```

The tool will recursively scan through your project's source files and generate a report of unused functions and variables.

## Example Output

Unused Functions:

| 📁 File                              | 🔢 Line | 🔍 Function |
| ------------------------------------ | :-----: | ----------: |
| /path/to/your/project/src/oneFile.js |   17    |  myFunction |

Unused Variables:

| 📁 File                              | 🔢 Line | 🔍 Function |
| ------------------------------------ | :-----: | ----------: |
| /path/to/your/project/src/twoFile.js |    4    |  myVariable |

If no unused functions or variables are found, you'll see a message like this:

```bash
✅ No unused functions found!
✅ No unused variables found!
```

## Contributing

Contributions are welcome!

If you find a bug or have a feature request, please open an issue on GitHub. Feel free to fork the repository and submit pull requests.

## License

MIT License

Copyright (c) 2024 Denisoed

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
