const DeadCodeChecker = require('../dist/index.js');

const checker = new DeadCodeChecker('example/files');

checker.run();
