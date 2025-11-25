// Used async function
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

// Unused async function - should be detected as dead code
async function unusedAsyncFunction() {
  return Promise.resolve('unused');
}

// Used async arrow function
const processData = async () => {
  const data = await fetchData();
  return data;
};

// Unused async arrow function - should be detected as dead code
const unusedAsyncArrow = async () => {
  return 'unused';
};

// Call used function
processData();
