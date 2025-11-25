import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Component using hooks - used
const ComponentWithHooks: React.FC = () => {
  // Used hooks
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  // Used useEffect
  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);
  
  // Used useCallback
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  // Used useMemo
  const doubledCount = useMemo(() => count * 2, [count]);
  
  return (
    <div>
      <p>{count} - {doubledCount}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
};

// Component with unused hooks - should be detected as dead code
const UnusedComponent: React.FC = () => {
  // Unused state - should be detected as dead code
  const [unusedState, setUnusedState] = useState(0);
  
  // Unused effect - should be detected as dead code
  useEffect(() => {
    console.log('unused');
  }, []);
  
  // Unused callback - should be detected as dead code
  const unusedCallback = useCallback(() => {
    return 'unused';
  }, []);
  
  // Unused memo - should be detected as dead code
  const unusedMemo = useMemo(() => {
    return 'unused';
  }, []);
  
  return <div>Component</div>;
};

// Custom hook - used
function useCounter(initialValue: number) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  
  return { count, increment, decrement };
}

// Unused custom hook - should be detected as dead code
function useUnusedHook() {
  const [value, setValue] = useState('');
  return { value, setValue };
}

export default ComponentWithHooks;

