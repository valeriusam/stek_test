<template>
  <div>
    <h1>TaskManager</h1>
    <button @click="startTasks">Начать</button>
<!--    <button @click="startAdTasks">StartAd Tasks</button>-->
    <button @click="cancelTask('task2')">Отмена Task2</button>
    <div>
      <h2>Статус task:</h2>
      <ul>
        <li v-for="(status, taskId) in taskStatus" :key="taskId">
          {{ taskId }}: {{ status }}<br>
        </li>
      </ul>
    </div>
  </div>
<!--  <div class="log-container">-->
<!--    <h2>Console Logs</h2>-->
<!--    <ul>-->
<!--      <li v-for="(log, index) in logs" :key="index">{{ log }}</li>-->
<!--    </ul>-->
<!--  </div>-->
</template>

<script>
import TaskManager from '../TaskManager.js';

export default {
  data() {
    return {
      taskManager: new TaskManager(2),
      intervalId: null,
      taskStatus: {},
      logs: [] // массив для хранения логов
    };
  },
  methods: {
    async startTasks() {
      this.taskStatus = {};

      this.taskManager.addTask(async () => {
        console.log('Выполнение задачи 1');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Задача 1 завершена');
      }, 2, []);

      this.taskManager.addTask(async () => {
        console.log('Выполнение задачи 2');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Задача 2 завершена');
      }, 1, ['task1']);

      this.taskManager.addTask(async () => {
        console.log('Выполнение задачи 3');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Задача 3 завершена');
      }, 3, []);

      this.taskManager.addTask(async () => {
        console.log('Выполнение задачи 4');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('Задача 4 завершена');
      }, 1, ['task2', 'task3']);

      this.taskManager.addTask(async () => {
        console.log('Выполнение задачи 5');
        await new Promise((_, reject) => setTimeout(() => reject(new Error('Ошибка в задаче 5')), 1500));
        console.log('Задача 5 завершена');
      }, 1, ['task2', 'task3','task4']);

      // await this.taskManager.executeTasks();
      await this.taskManager.executeTasks().then(() => {
        console.log('Статус задач после выполнения:', this.taskManager.getStatus());
      }).catch(error => {
        console.error('Ошибка при выполнении задач:', error);
      });

//       // Пример добавления и выполнения дополнительных задач
//       this.taskManager.addTask(async () => {
//         console.log('Выполнение задачи 5');
//         await new Promise((_, reject) => setTimeout(() => reject(new Error('Ошибка в задаче 5')), 1500));
//       }, 2, []);
//       this.taskManager.addTask(async () => {
//         console.log('Выполнение задачи 6');
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         console.log('Задача 6 завершена');
//       }, 1, []);
//       this.taskManager.addTask(async () => {
//         console.log('Выполнение задачи 7');
//         await new Promise(resolve => setTimeout(resolve, 2500));
//         console.log('Задача 7 завершена');
//       }, 2, ['task5']);
// // Выполнение дополнительных задач
//       this.taskManager.executeTasks().then(() => {
//         console.log('Все дополнительные задачи выполнены');
// // Получение и вывод статуса всех задач после выполнения дополнительных задач
//         console.log('Статус задач после выполнения дополнительных задач:',
//             this.taskManager.getStatus());
//       }).catch(error => {
//         console.error('Ошибка при выполнении дополнительных задач:', error);
//       });

      this.intervalId = setInterval(() => {
        this.taskStatus = this.taskManager.getStatus();
        if (Object.values(this.taskStatus).every(status =>
            ['completed', 'failed', 'cancelled'].includes(status))) {
          clearInterval(this.intervalId);
        }

      }, 500);
    },
    // async startAdTasks() {
    //   // Do not reset this.taskStatus here
    //   // Add additional tasks without resetting the status of previous tasks
    //   this.taskManager.addTask(async () => {
    //     console.log('Выполнение задачи 5');
    //     await new Promise((_, reject) => setTimeout(() => reject(new Error('Ошибка в задаче 5')), 1500));
    //   }, 2, []);
    //
    //   this.taskManager.addTask(async () => {
    //     console.log('Выполнение задачи 6');
    //     await new Promise(resolve => setTimeout(resolve, 1000));
    //     console.log('Задача 6 завершена');
    //   }, 1, []);
    //
    //   this.taskManager.addTask(async () => {
    //     console.log('Выполнение задачи 7');
    //     await new Promise(resolve => setTimeout(resolve, 2500));
    //     console.log('Задача 7 завершена');
    //   }, 2, ['task5']);
    //
    //   await this.taskManager.executeTasks().then(() => {
    //     console.log('Все дополнительные задачи выполнены');
    //   }).catch(error => {
    //     console.error('Ошибка при выполнении задач:', error);
    //   });
    // },
    cancelTask(taskId) {
      this.taskManager.cancelTask(taskId);
    }
  },
  mounted() {
    this.taskStatus = this.taskManager.getStatus();
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      // сохраняем логи в массиве
      this.logs.push(args.join(' '));

      // вызываем оригинальную функцию консоли
      originalConsoleLog.apply(console, args);
    };
  },
  beforeAmount() {
    clearInterval(this.intervalId);
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