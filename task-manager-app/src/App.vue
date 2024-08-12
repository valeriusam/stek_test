<template>
  <div id="app">
    <TaskManagerComponent />
    <ConsoleLogs />
  </div>
</template>

<script>
import TaskManagerComponent from './components/TaskManagerComponent.vue';
import ConsoleLogs from './components/ConsoleLogs.vue';

export default {
  components: {
    TaskManagerComponent,
    ConsoleLogs
  }
};
</script>
