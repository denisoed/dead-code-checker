// Dynamic import - used
async function loadModule() {
  const module = await import('./es-module-named.js');
  return module.usedFunction();
}

// Unused dynamic import - should be detected as dead code
async function unusedLoadModule() {
  const module = await import('./es-module-default.js');
  return module.default;
}

// Dynamic import with then - used
import('./es-module-named.js').then(module => {
  module.usedFunction();
});

// Unused dynamic import with then - should be detected as dead code
import('./es-module-default.js').then(module => {
  // module not used
});

loadModule();

