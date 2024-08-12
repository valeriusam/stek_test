export default class TaskManager {
    constructor(maxConcurrentTasks = 2) {
        this.maxConcurrentTasks = maxConcurrentTasks;
        this.tasks = [];
        this.taskStatus = {};
        this.activeTasks = 0;
        this.taskQueue = [];
    }

    addTask(task, priority, dependencies) {
        const taskId = `task${this.tasks.length + 1}`;
        this.tasks.push({ task, priority, dependencies, id: taskId });
        this.taskStatus[taskId] = 'pending';
    }

    async executeTask(taskInfo) {
        const { task, id } = taskInfo;
        try {
            this.taskStatus[id] = 'running';
            await task();
            this.taskStatus[id] = 'completed';
        } catch (error) {
            this.taskStatus[id] = 'failed';
            console.error(`Ошибка в задаче ${id}:`, error);
        } finally {
            this.activeTasks--;
            this.executeTasks();
        }
        constructor(id, time)
        {
            this.id = id;
            this.time = time;
        }
        run()
        {
            console.log(this + ' launched.');
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log(this + ' completed.');
                    resolve();
                }, this.time);
            });
        }
        toString()
        {
            return `Task ${this.id}[${this.time}ms]`;
        }
    }

    // async executeTasks() {
    //     if (this.activeTasks >= this.maxConcurrentTasks) return;
    //
    //     this.tasks.sort((a, b) => b.priority - a.priority);
    //
    //     while (this.activeTasks < this.maxConcurrentTasks && this.tasks.length) {
    //         const taskInfo = this.tasks.find(taskInfo =>
    //             taskInfo.dependencies.every(dep => this.taskStatus[dep] === 'completed')
    //         );
    //
    //         if (!taskInfo) break;
    //
    //         this.tasks = this.tasks.filter(task => task.id !== taskInfo.id);
    //         this.activeTasks++;
    //         this.executeTask(taskInfo);
    //     }
    // }

    // async executeTasks() {
    //     if (this.activeTasks >= this.maxConcurrentTasks) return;
    //
    //     this.tasks.sort((a, b) => b.priority - a.priority);
    //
    //     const tasksExecutionPromises = [];
    //
    //     while (this.activeTasks < this.maxConcurrentTasks && this.tasks.length) {
    //         const taskInfo = this.tasks.find(taskInfo =>
    //             taskInfo.dependencies.every(dep => this.taskStatus[dep] === 'completed')
    //         );
    //
    //         if (!taskInfo) break;
    //
    //         this.tasks = this.tasks.filter(task => task.id !== taskInfo.id);
    //         this.activeTasks++;
    //
    //         // Запускаем задачу и сохраняем промис в массив
    //         const taskPromise = this.executeTask(taskInfo).then(() => {
    //             this.activeTasks--;
    //             // Запускаем следующую задачу, если есть доступные слоты
    //             return this.executeTasks();
    //         });
    //
    //         tasksExecutionPromises.push(taskPromise);
    //     }
    //
    //     // Ожидаем завершения всех задач
    //     await Promise.all(tasksExecutionPromises);
    // }

    async executeTasks() {
        if (this.activeTasks >= this.maxConcurrentTasks) return;

        // Сортировка задач по приоритету
        this.tasks.sort((a, b) => b.priority - a.priority);

        const promises = []; // Массив для хранения всех промисов задач

        while (this.activeTasks < this.maxConcurrentTasks && this.tasks.length) {
            const taskInfo = this.tasks.find(taskInfo =>
                taskInfo.dependencies.every(dep => this.taskStatus[dep] === 'completed')
            );

            if (!taskInfo) break;

            // Убираем задачу из списка, так как она будет выполнена
            this.tasks = this.tasks.filter(task => task.id !== taskInfo.id);
            this.activeTasks++;

            // Выполнение задачи и обработка её завершения
            const taskPromise = this.executeTask(taskInfo)
                .then(() => {
                    this.taskStatus[taskInfo.id] = 'completed';
                })
                .catch(error => {
                    console.error(`Ошибка при выполнении задачи ${taskInfo.id}:`, error);
                    this.taskStatus[taskInfo.id] = 'failed';
                })
                .finally(() => {
                    this.activeTasks--;
                    // После завершения задачи пытаемся запустить следующую
                    this.executeTasks();
                });

            // Добавляем промис задачи в массив для отслеживания выполнения всех задач
            promises.push(taskPromise);
        }

        // Ожидание выполнения всех запущенных задач
        await Promise.all(promises);

        // Если все задачи завершены (в том числе те, которые были добавлены позже)
        if (this.tasks.length === 0 && this.activeTasks === 0) {
            console.log('Все задачи выполнены');
        }
    }

// Метод для выполнения одной задачи
//     async executeTask(taskInfo) {
//         try {
//             await taskInfo.task();
//         } catch (error) {
//             throw error; // Перебрасываем ошибку для обработки в executeTasks
//         }
//     }


    cancelTask(taskId) {
        const cancelRecursively = (id) => {
            if (this.taskStatus[id] === 'pending' || this.taskStatus[id] === 'running') {
                this.taskStatus[id] = 'cancelled';
                const dependentTasks = this.tasks.filter(task => task.dependencies.includes(id));
                dependentTasks.forEach(depTask => cancelRecursively(depTask.id));
            }
        };
        cancelRecursively(taskId);
    }

    getStatus() {
        return { ...this.taskStatus };
    }
}
