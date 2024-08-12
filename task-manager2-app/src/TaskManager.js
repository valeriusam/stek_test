class Task {
    constructor(id, time, priority, dependencies = []) {
        this.id = id;
        this.time = time;
        this.priority = priority;
        this.dependencies = dependencies; // Зависимые задачи
        this.isCompleted = false;
    }

    isReady() {
        // Задача готова к выполнению, если все её зависимости завершены
        return this.dependencies.every(dep => dep.isCompleted);
    }

    run() {
        console.log(this + ' launched.');
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(this + ' completed.');
                this.isCompleted = true;
                resolve();
            }, this.time);
        });
    }

    toString() {
        return `Task ${this.id}[${this.time}ms, priority=${this.priority}]`;
    }
}

class TaskManager {
    constructor(capacity) {
        this.capacity = capacity;
        this.waiting = [];
        this.running = [];
    }

    push(tk) {
        this.waiting.push(tk);
        this.waiting.sort((a, b) => b.priority - a.priority); // Сортировка по приоритету
        this.next(); // Попробовать запустить задачи
    }

    next() {
        while (this.running.length < this.capacity && this.waiting.length) {
            // Берем задачу с наивысшим приоритетом, которая готова к запуску
            const task = this.waiting.find(t => t.isReady());

            if (!task) break; // Если нет готовых задач, выходим из цикла

            // Убираем задачу из очереди ожидания
            this.waiting = this.waiting.filter(t => t !== task);
            this.running.push(task);

            const runningTask = task.run();
            console.log("Currently running: " + this.running);

            runningTask.then(() => {
                this.running = this.running.filter(t => t !== task);
                console.log("Currently running: " + this.running);
                this.next(); // Попробовать запустить следующую задачу
            });
        }

        // Если больше нет задач, ни ожидающих, ни выполняющихся
        if (!this.running.length && !this.waiting.length) {
            console.log("All done.");
        }
    }
}

// Пример использования:
const a = new Task('A', 100, 3);
const b = new Task('B', 200, 2);
const c = new Task('C', 400, 1, [a, b]); // C зависит от завершения A и B
const d = new Task('D', 5000, 2);
const e = new Task('E', 6000, 1, [c, d]); // E зависит от завершения C и D

const manager = new TaskManager(2);
manager.push(a);
manager.push(b);
manager.push(c);
manager.push(d);
manager.push(e);;
