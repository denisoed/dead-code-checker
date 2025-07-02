#!/usr/bin/env node
import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

// Import the DeadCodeChecker
import DeadCodeChecker from '../dist/index.mjs';

const program = new Command();

program
  .option(
    '-v, --version',
    'Display Application Version: Displays the current version of the application.'
  )
  .option('--ci', 'Abort the process when dead code is detected.')
  .option('-f, --folder <folder>', 'Folder to be scanned (Default: ./src)')
  .option(
    '-in, --ignoreNames <names...>',
    'Function or variable names to be ignored'
  )
  .option('-if, --ignoreFolders <folders...>', 'Folders to be ignored')
  .option('-q, --quiet', 'Suppress all output except errors')
  .option('--no-progress', 'Disable progress bar display')
  .parse(process.argv);

const options = program.opts();

if (!Object.keys(options).length) {
  program.outputHelp();
} else if (options.version) {
  console.log(packageJson.version);
} else {
  const checker = new DeadCodeChecker(options.folder || './src', {
    ci: options.ci,
    ignoreFolders: options.ignoreFolders || [],
    ignoreNames: options.ignoreNames || [],
    quiet: options.quiet,
    noProgress: options.noProgress
  });
  checker.run();
}
