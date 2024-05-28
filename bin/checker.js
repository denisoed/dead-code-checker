const DeadCodeChecker = require('../dist/index.js');

module.exports = options => {
  const checker = new DeadCodeChecker(options.folder);
  checker.run();
};
