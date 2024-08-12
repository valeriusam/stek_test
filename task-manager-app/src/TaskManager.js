export default class TaskManager {
    constructor(maxConcurrentTasks = 2) {
        this.maxConcurrentTasks = maxConcurrentTasks;
        this.tasks = [];
        this.taskStatus = {};
        this.activeTasks = 0;
        this.taskQueue = [];
    }

    addTask(task, priority, dependencies, timeout = 0) {
        const taskId = `task${this.tasks.length + 1}`;
        this.tasks.push({ task, priority, dependencies, id: taskId, timeout });
        this.taskStatus[taskId] = 'pending';
    }

    // async executeTask(taskInfo) {
    //     const { task, id } = taskInfo;
    //     try {
    //         this.taskStatus[id] = 'running';
    //         await task();
    //         this.taskStatus[id] = 'completed';
    //     } catch (error) {
    //         this.taskStatus[id] = 'failed';
    //         console.error(`Ошибка в задаче ${id}:`, error);
    //     } finally {
    //         this.activeTasks--;o
    //         this.executeTasks();
    //     }
    // }

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
    //
    //         const taskPromise = this.executeTask(taskInfo).then(() => {
    //             this.activeTasks--;
    //
    //             return this.executeTasks();
    //         });
    //
    //         tasksExecutionPromises.push(taskPromise);
    //     }
    //
    //     await Promise.all(tasksExecutionPromises);
    // }

    async executeTask(taskInfo) {
        const { task, id, timeout } = taskInfo;
        try {
            this.taskStatus[id] = 'running';

            if (timeout > 0) {
                await Promise.race([
                    task(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error(`Task ${id} timed out`)), timeout))
                ]);
            } else {
                await task();
            }

            this.taskStatus[id] = 'completed';
        } catch (error) {
            this.taskStatus[id] = 'failed';
            console.error(`Error in task ${id}:`, error);
        } finally {
            this.activeTasks--;
            this.executeTasks();
        }
    }

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
    //         const taskPromise = this.executeTask(taskInfo).then(() => {
    //             this.activeTasks--;
    //             return this.executeTasks();
    //         });
    //
    //         tasksExecutionPromises.push(taskPromise);
    //     }
    //
    //     await Promise.all(tasksExecutionPromises);
    // }

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
    //
    //         try {
    //             await this.executeTask(taskInfo);
    //         } finally {
    //             this.activeTasks--;
    //             this.executeTasks(); // Запуск следующей задачи после завершения текущей
    //         }
    //     }
    // }


    async executeTasks() {
        while (this.activeTasks < this.maxConcurrentTasks && this.tasks.length) {
            const taskInfo = this.tasks.find(taskInfo =>
                taskInfo.dependencies.every(dep => this.taskStatus[dep] === 'completed')
            );

            if (!taskInfo) break;

            this.tasks = this.tasks.filter(task => task.id !== taskInfo.id);
            this.activeTasks++;

            const taskExecution = this.executeTask(taskInfo);
            taskExecution.finally(() => {
                this.activeTasks--;
                this.executeTasks();
            });
            await taskExecution;
        }
    }
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
