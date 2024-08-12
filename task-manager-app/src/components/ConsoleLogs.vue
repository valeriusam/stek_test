<template>
  <div class="log-container" style="
    display: flex;
    justify-content: center;
">
    <h2>Логи</h2>
    <ul style="
    margin-right: auto;
    margin-left: auto;
">
      <li v-for="(log, index) in logs" :key="index">{{ log }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      logs: [] // массив для хранения логов
    };
  },
  mounted() {
    const originalConsoleLog = console.log;

    console.log = (...args) => {
      const formattedArgs = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return '[Circular]';
          }
        } else {
          return arg.toString();
        }
      });

      this.logs.push(formattedArgs.join(' '));
      originalConsoleLog.apply(console, args);
    };
  }
};
</script>

<style>
.log-container {
  background-color: #f8f9fa;
  padding: 10px;
  border: 1px solid #ddd;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  padding: 5px 0;
  border-bottom: 1px solid #ccc;
}
</style>
