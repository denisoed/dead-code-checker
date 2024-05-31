#!/usr/bin/env node
const { Command } = require('commander');
const package = require('../package.json');
const DeadCodeChecker = require('../dist/index.js');

const program = new Command();

program
  .option(
    '-v, --version',
    'Display Application Version: Displays the current version of the application.'
  )
  .option('-f, --folder <folder>', 'Folder to be scanned (Default: ./src)')
  .option(
    '-in, --ignoreNames <names...>',
    'Function or variable names to be ignored'
  )
  .option('-if, --ignoreFolders <folders...>', 'Folders to be ignored')
  .parse(process.argv);

const options = program.opts();

if (!Object.keys(options).length) {
  program.outputHelp();
} else if (options.version) {
  console.log(package.version);
} else {
  const checker = new DeadCodeChecker(options.folder, {
    ignoreFolders: options.ignoreFolders || [],
    ignoreNames: options.ignoreNames || []
  });
  checker.run();
}
