<script>
  // Used reactive variables
  let count = 0;
  let name = 'World';
  
  // Unused reactive variable - should be detected as dead code
  let unusedVar = 'unused';
  
  // Used reactive statement
  $: doubled = count * 2;
  
  // Unused reactive statement - should be detected as dead code
  $: unusedReactive = unusedVar + 'test';
  
  // Used function
  function increment() {
    count++;
  }
  
  // Unused function - should be detected as dead code
  function unusedFunction() {
    return 'unused';
  }
  
  // Used reactive statement with dependencies
  $: message = `Hello, ${name}! Count: ${count}`;
  
  // Unused reactive with unused dependencies - should be detected as dead code
  $: unusedMessage = `Unused: ${unusedVar}`;
</script>

<button on:click={increment}>
  Clicked {count} {count === 1 ? 'time' : 'times'}
</button>

<p>{message}</p>
<p>{doubled}</p>

