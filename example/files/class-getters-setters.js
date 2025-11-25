// Class with getters and setters
class Person {
  constructor(firstName, lastName) {
    this._firstName = firstName;
    this._lastName = lastName;
  }
  
  // Used getter
  get fullName() {
    return `${this._firstName} ${this._lastName}`;
  }
  
  // Unused getter - should be detected as dead code
  get firstName() {
    return this._firstName;
  }
  
  // Used setter
  set fullName(name) {
    const parts = name.split(' ');
    this._firstName = parts[0];
    this._lastName = parts[1];
  }
  
  // Unused setter - should be detected as dead code
  set lastName(name) {
    this._lastName = name;
  }
}

// Use getters and setters
const person = new Person('John', 'Doe');
const name = person.fullName;
person.fullName = 'Jane Smith';

// Another class
class Temperature {
  constructor(celsius) {
    this._celsius = celsius;
  }
  
  // Used getter
  get fahrenheit() {
    return this._celsius * 9/5 + 32;
  }
  
  // Unused getter - should be detected as dead code
  get kelvin() {
    return this._celsius + 273.15;
  }
}

const temp = new Temperature(25);
const f = temp.fahrenheit;

