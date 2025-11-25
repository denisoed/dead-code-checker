<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script>
export default {
  name: 'UsedComponent',
  data() {
    return {
      // Used data properties
      title: 'Hello',
      message: 'World',
      // Unused data property - should be detected as dead code
      unusedData: 'unused'
    };
  },
  computed: {
    // Used computed property
    greeting() {
      return `${this.title} ${this.message}`;
    },
    // Unused computed property - should be detected as dead code
    unusedComputed() {
      return 'unused';
    }
  },
  methods: {
    // Used method
    handleClick() {
      this.message = 'Clicked!';
    },
    // Unused method - should be detected as dead code
    unusedMethod() {
      return 'unused';
    }
  },
  // Used lifecycle hook
  mounted() {
    console.log('Component mounted');
  },
  // Unused lifecycle hook - should be detected as dead code
  beforeDestroy() {
    console.log('unused');
  }
};
</script>
