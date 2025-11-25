// Module pattern - used
const MyModule = (function() {
  // Private variable - used
  let privateVar = 'used';
  
  // Private variable - unused - should be detected as dead code
  let unusedPrivate = 'unused';
  
  // Private function - used
  function privateFunction() {
    return privateVar;
  }
  
  // Private function - unused - should be detected as dead code
  function unusedPrivateFunction() {
    return unusedPrivate;
  }
  
  // Public API
  return {
    // Used public method
    publicMethod() {
      return privateFunction();
    },
    
    // Unused public method - should be detected as dead code
    unusedPublicMethod() {
      return 'unused';
    },
    
    // Used getter
    getPrivate() {
      return privateVar;
    }
  };
})();

// Use module
MyModule.publicMethod();
MyModule.getPrivate();

// Another module pattern
const AnotherModule = (function() {
  const state = {
    used: 'used',
    unused: 'unused' // should be detected as dead code
  };
  
  return {
    getUsed() {
      return state.used;
    },
    getUnused() {
      return state.unused; // should be detected as dead code
    }
  };
})();

AnotherModule.getUsed();

