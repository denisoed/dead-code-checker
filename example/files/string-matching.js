// Functions called via string matching
const handlers = {
  handleClick() {
    return 'clicked';
  },
  handleSubmit() {
    return 'submitted';
  },
  unusedHandler() {
    return 'unused'; // should be detected as dead code
  }
};

// Used handler via string
const eventType = 'Click';
const handlerName = 'handle' + eventType;
handlers[handlerName]();

// Unused handler - should be detected as dead code
const unusedEventType = 'Unused';
const unusedHandlerName = 'handle' + unusedEventType;
// handlers[unusedHandlerName](); // commented out

// Function names in arrays - used
const functionNames = ['usedFunction', 'anotherUsedFunction'];

function usedFunction() {
  return 'used';
}

function anotherUsedFunction() {
  return 'used';
}

function unusedFunction() {
  return 'unused'; // should be detected as dead code
}

// Call functions from array
functionNames.forEach(name => {
  if (typeof window !== 'undefined' && window[name]) {
    window[name]();
  }
});

// String-based event listeners - used
document.addEventListener('click', handlers.handleClick);

// Unused string-based - should be detected as dead code
// document.addEventListener('unused', handlers.unusedHandler);

