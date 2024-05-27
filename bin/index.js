#!/usr/bin/env node
const { Command } = require('commander');
const version = require('./version');
const checker = require('./checker');

const program = new Command();

program
  .option(
    '-v, --version',
    'Display Application Version: Displays the current version of the application.'
  )
  .parse(process.argv);

const options = program.opts();

if (!Object.keys(options).length) {
  program.outputHelp();
} else if (options.version) {
  version();
} else {
  checker(options);
}
