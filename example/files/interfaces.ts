// Used interface
interface User {
  name: string;
  age: number;
}

// Unused interface - should be detected as dead code
interface UnusedInterface {
  prop: string;
}

// Used interface in function
function createUser(user: User): User {
  return user;
}

// Unused interface in function - should be detected as dead code
function unusedFunction(param: UnusedInterface): void {
  // unused
}

// Interface extending another - used
interface Admin extends User {
  role: string;
}

// Unused extended interface - should be detected as dead code
interface UnusedExtended extends User {
  extra: string;
}

// Use interface
const user: User = { name: 'John', age: 30 };
createUser(user);

const admin: Admin = { name: 'Admin', age: 25, role: 'admin' };

