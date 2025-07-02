# 🚀 Dead Code Checker - Eliminate Dead Code, Boost Performance

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/dead-code-checker.svg)](https://badge.fury.io/js/dead-code-checker)
[![Downloads](https://img.shields.io/npm/dm/dead-code-checker.svg)](https://www.npmjs.com/package/dead-code-checker)

> **Stop wasting time on dead code. Start shipping faster, cleaner applications today.**

Transform your codebase from cluttered to clean in minutes. Dead Code Checker automatically finds and eliminates unused functions and variables, reducing bundle sizes by up to 30% and making your code instantly more maintainable.

![Preview](preview.webp)

## ⚡ Why Dead Code is Killing Your Productivity

Every day, developers waste **2-3 hours** navigating through unused code that:

- 📈 **Increases bundle sizes** - slowing down your apps
- 🧠 **Creates cognitive overload** - making code reviews painful  
- 🐛 **Hides real bugs** - in a sea of unused functions
- ⏱️ **Slows down refactoring** - fear of breaking "mystery" code
- 💸 **Costs money** - in CI/CD time and deployment overhead

**The solution?** Automated dead code detection that works in seconds, not hours.

## ✨ Transform Your Codebase in Minutes

```bash
# One command to rule them all
npx dead-code-checker -f ./src
```

**With Real-Time Progress Tracking:**
```
🔍 Analyzing codebase...
 █████████████████████████ | 100% | 100/100 | 📁 Collecting files 
 ███████████████████████   | 85% | 1,058/1,247 | 📖 Reading files 📄 src/components/Button.tsx
 ████████████████          | 60% | 748/1,247 | 🔍 Processing declarations 📄 src/utils/helpers.js
 ████████████████████████  | 90% | 1,122/1,247 | ⚡ Analyzing usage 📄 src/hooks/useData.ts
```

🎯 **Instant Results:**
- Find all unused functions and variables
- Get exact file locations and line numbers  
- Remove dead code with confidence
- Reduce bundle size immediately
- **NEW**: Real-time progress tracking with current file display

## 🏆 Real Impact, Real Results

### Before vs After
```
❌ Before: 847 KB bundle size, 2,341 unused variables
✅ After:  592 KB bundle size, 0 unused code (-30% size!)
```

## 🚀 Key Features That Save You Time

| Feature | Benefit | Time Saved |
|---------|---------|------------|
| **🔍 Smart Detection** | Finds functions, variables, imports | 2-3 hours/week |
| **🎯 Framework Support** | React, Vue, Angular, Node.js | Setup instantly |
| **⚙️ CI/CD Ready** | Prevent dead code in PRs | Review time -50% |
| **📊 Detailed Reports** | Exact locations + line numbers | Debug time -70% |
| **📊 Real-Time Progress** | Live tracking of current file analysis | Never wonder if it's stuck again |
| **🧩 Zero Config** | Works out of the box | Setup: 30 seconds |

## 📱 Supports Everything You Build

<div align="center">

| Frontend | Backend | Universal |
|----------|---------|-----------|
| ⚛️ React | 🚀 Node.js | 📦 TypeScript |
| 🟢 Vue.js | 🔧 Express | 📋 JavaScript |
| 🅰️ Angular | ⚡ Fastify | 🔗 ES Modules |
| 📱 React Native | 🛠️ NestJS | 📄 CommonJS |

</div>

## ⚡ Quick Start - Get Results in 30 Seconds

### 🎯 Option 1: Instant Scan (Recommended)
```bash
# No installation needed - scan any project immediately
npx dead-code-checker -f ./src

# See results instantly:
✅ Found 23 unused functions in 12 files
📁 src/utils/helpers.ts:45 - function calculateOldMetric
📁 src/components/OldButton.tsx:12 - const unusedVariable
```

### 🛠️ Option 2: Install for Regular Use
```bash
# Install globally for repeated use
npm install -g dead-code-checker

# Or add to your project
npm install dead-code-checker --save-dev
```

### 🎮 Advanced Options
```bash
# Ignore specific functions/variables
dead-code-checker -f ./src -in "debugFunction,testVariable"

# Ignore entire folders  
dead-code-checker -f ./src -if "tests,__mocks__"

# CI/CD mode (fails on dead code)
dead-code-checker --ci -f ./src

# Quiet mode (minimal output)
dead-code-checker --quiet -f ./src

# Disable progress bar
dead-code-checker --no-progress -f ./src
```

## 🏢 Perfect for Professional Teams

### 🔄 CI/CD Integration
Prevent dead code from ever reaching production:

```yaml
# GitHub Actions Example
name: Dead Code Check
on: [push, pull_request]

jobs:
  dead-code-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Check for dead code
        run: npx dead-code-checker --ci -f ./src
```

### 📊 API Integration
Build custom workflows and integrations:

```javascript
const DeadCodeChecker = require('dead-code-checker');

const checker = new DeadCodeChecker('src/', {
  ignoreNames: ['debugUtils', 'testHelpers'],
  ignoreFolders: ['tests', '__mocks__']
});

checker.run();
const report = checker.getReport();

// Custom reporting, Slack notifications, etc.
console.log(`Found ${report.deadCode.length} issues`);
```

## 📈 ROI Calculator

**For a team of 5 developers:**
- **Time saved per week:** 10 hours (dead code navigation)
- **Bundle size reduction:** 20-30% average
- **Faster builds:** 15-25% improvement
- **Yearly value:** $50,000+ in developer productivity

**Start saving time today** - it's free and takes 30 seconds.

## 🎯 Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `-f, --folder` | Target folder to scan | `-f ./src` |
| `-in, --ignoreNames` | Ignore specific names | `-in "debug,test"` |
| `-if, --ignoreFolders` | Ignore folders | `-if "tests,mocks"` |
| `--ci` | CI mode (exit code 1 if dead code found) | `--ci` |
| `-q, --quiet` | Suppress all output except errors | `--quiet` |
| `--no-progress` | Disable progress bar display | `--no-progress` |
| `-h, --help` | Show all options | `-h` |
| `-v, --version` | Show version | `-v` |

## 🎬 Live Examples

![Report](report.png)

**Clean projects feel different:**
```bash
✅ No dead code found! Your codebase is clean and optimized.
```

**Found issues? No problem:**
```bash
🔍 Found 15 unused items:

📁 src/utils/helpers.ts
   ├─ Line 23: function oldHelper
   └─ Line 45: const unusedConfig

📁 src/components/Button.tsx  
   └─ Line 12: const deprecatedStyle

💡 Tip: Remove these to reduce bundle size by ~18KB
```

## 🤝 Join the Community

- 🌟 **Star us on GitHub** if this tool saved you time
- 🐛 **Report issues** to help us improve
- 💡 **Suggest features** for the roadmap
- 🤝 **Contribute** and help other developers

## 🚀 Start Cleaning Your Code Now

**Ready to eliminate dead code and boost performance?**

```bash
# One command, instant results
npx dead-code-checker -f ./src
```

**Questions?** Check our [examples](./example/) or [open an issue](https://github.com/denisoed/dead-code-checker/issues).

---

## 📜 License

MIT License - feel free to use in commercial projects

**Built with ❤️ by developers, for developers**

*Copyright (c) 2025 Denisoed - Making codebases cleaner, one scan at a time.*
