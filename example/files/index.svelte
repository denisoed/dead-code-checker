<script>
  let counter = 0;
let counter2 = 0;

	function handleClick() {
		counter += 1;
	}

  function handleClick2() {
    counter += 1;
  }
</script>

<button on:click={handleClick}>
	Clicked {counter}
	{counter === 1 ? 'time' : 'times'}
</button>
