// Used generator function
function* numberGenerator() {
  let num = 1;
  while (true) {
    yield num++;
  }
}

// Unused generator function - should be detected as dead code
function* unusedGenerator() {
  yield 'unused';
}

// Used generator arrow function (if supported)
const gen = function* () {
  yield 1;
  yield 2;
};

// Unused generator - should be detected as dead code
const unusedGen = function* () {
  yield 'unused';
};

// Use generator
const iterator = numberGenerator();
iterator.next();

