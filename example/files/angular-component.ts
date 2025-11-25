import { Component } from '@angular/core';

// Used Angular component
@Component({
  selector: 'app-used',
  template: '<div>{{ title }}</div>'
})
export class UsedComponent {
  // Used property
  title = 'Used Component';
  
  // Unused property - should be detected as dead code
  unusedProperty = 'unused';
  
  // Used method
  onClick() {
    console.log('Clicked');
  }
  
  // Unused method - should be detected as dead code
  unusedMethod() {
    return 'unused';
  }
}

// Unused Angular component - should be detected as dead code
@Component({
  selector: 'app-unused',
  template: '<div>Unused</div>'
})
export class UnusedComponent {
  title = 'Unused Component';
}

