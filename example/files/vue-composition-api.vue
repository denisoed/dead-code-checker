<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ computedMessage }}</p>
    <button @click="handleClick">Click</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Used reactive ref
const title = ref('Hello');
const count = ref(0);

// Unused reactive ref - should be detected as dead code
const unusedRef = ref('unused');

// Used computed
const computedMessage = computed(() => {
  return `${title.value} - ${count.value}`;
});

// Unused computed - should be detected as dead code
const unusedComputed = computed(() => {
  return 'unused';
});

// Used function
function handleClick() {
  count.value++;
}

// Unused function - should be detected as dead code
function unusedFunction() {
  return 'unused';
}

// Used lifecycle hook
onMounted(() => {
  console.log('Mounted');
});

// Note: Unused lifecycle hooks might not be detected if they're imported but not called
</script>
