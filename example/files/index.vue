<template>
  <div>
    <h1>List</h1>
    <ul>
      <li v-for="item in list" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>

<script setup>
const list = ['item1', 'item2', 'item3'];

const getItems = () => list;

const getFirstItem = () => {
  return list[0];
};
</script>
