// Namespace pattern - used
const MyNamespace = {
  // Used property
  usedProperty: 'used',
  
  // Unused property - should be detected as dead code
  unusedProperty: 'unused',
  
  // Used method
  usedMethod() {
    return 'used';
  },
  
  // Unused method - should be detected as dead code
  unusedMethod() {
    return 'unused';
  }
};

// Use namespace
MyNamespace.usedMethod();
console.log(MyNamespace.usedProperty);

// Nested namespace - used
const App = {
  Utils: {
    usedUtil() {
      return 'used';
    },
    unusedUtil() {
      return 'unused'; // should be detected as dead code
    }
  },
  Services: {
    usedService() {
      return 'used';
    },
    unusedService() {
      return 'unused'; // should be detected as dead code
    }
  }
};

// Use nested namespace
App.Utils.usedUtil();
App.Services.usedService();

