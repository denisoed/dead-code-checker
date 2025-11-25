// Note: This example assumes React is installed
// In a real project, you would have: import React from 'react';
// For testing purposes, this import may show an error if React is not installed
import React from 'react';

// Used React component
const UsedComponent: React.FC = () => {
  return <div>Used Component</div>;
};

// Unused React component - should be detected as dead code
const UnusedComponent: React.FC = () => {
  return <div>Unused Component</div>;
};

// Used component with props
interface Props {
  title: string;
}

const ComponentWithProps: React.FC<Props> = ({ title }) => {
  return <h1>{title}</h1>;
};

// Unused component with props - should be detected as dead code
const UnusedComponentWithProps: React.FC<Props> = ({ title }) => {
  return <h2>{title}</h2>;
};

// Used class component
class UsedClassComponent extends React.Component {
  render() {
    return <div>Used Class Component</div>;
  }
}

// Unused class component - should be detected as dead code
class UnusedClassComponent extends React.Component {
  render() {
    return <div>Unused Class Component</div>;
  }
}

// Export used component
export default UsedComponent;

// Export unused component - should be detected as dead code
export { UnusedComponent };
