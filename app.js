class TaskManager {
    constructor() {
        this.currentUser = localStorage.getItem('dailyPlanner_currentUser') || 'anonymous';
        this.tasksKey = `dailyPlanner_tasks_${this.currentUser}`;
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.tasksKey)) {
            this.saveTasks([]);
        }
        this.renderTasks();
        this.setupEventListeners();
    }

    getTasks() {
        return JSON.parse(localStorage.getItem(this.tasksKey) || '[]');
    }

    saveTasks(tasks) {
        localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
    }

    addTask(text) {
        if (!text.trim()) return;
        
        const tasks = this.getTasks();
        const newTask = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
            isToday: true
        };
        
        tasks.unshift(newTask);
        this.saveTasks(tasks);
        this.renderTasks();
    }

    toggleTask(id) {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            tasks[taskIndex].completedAt = tasks[taskIndex].completed ? 
                new Date().toISOString() : null;
            this.saveTasks(tasks);
            this.renderTasks();
        }
    }

    deleteTask(id) {
        const tasks = this.getTasks().filter(task => task.id !== id);
        this.saveTasks(tasks);
        this.renderTasks();
    }

    clearCompleted() {
        const tasks = this.getTasks().filter(task => !task.completed);
        this.saveTasks(tasks);
        this.renderTasks();
    }

    renderTasks() {
        const tasksList = document.getElementById('tasks-list');
        if (!tasksList) return;
        
        const tasks = this.getTasks().filter(task => task.isToday);
        
        if (tasks.length === 0) {
            tasksList.innerHTML = `
                <li class="empty-state">
                    <p>🎉 Нет задач на сегодня!</p>
                    <p>Добавьте первую задачу выше.</p>
                </li>
            `;
            return;
        }
        
        tasksList.innerHTML = tasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <label class="task-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <div class="task-content">
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <span class="task-time">
                        ${new Date(task.createdAt).toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </span>
                </div>
                <button class="delete-btn" title="Удалить">×</button>
            </li>
        `).join('');
        
        // Обновляем счётчик
        const completedCount = tasks.filter(t => t.completed).length;
        const counter = document.getElementById('tasks-counter');
        if (counter) {
            counter.textContent = `${completedCount}/${tasks.length}`;
        }
    }

    setupEventListeners() {
        // Добавление задачи
        document.getElementById('add-btn')?.addEventListener('click', () => {
            const input = document.getElementById('task-input');
            this.addTask(input.value);
            input.value = '';
            input.focus();
        });
        
        document.getElementById('task-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('add-btn').click();
            }
        });
        
        // Очистка выполненных
        document.getElementById('clear-completed')?.addEventListener('click', () => {
            if (confirm('Удалить все выполненные задачи?')) {
                this.clearCompleted();
            }
        });
        
        // Делегирование событий для списка задач
        document.getElementById('tasks-list')?.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            
            const taskId = taskItem.dataset.id;
            
            if (e.target.closest('.task-checkbox') || e.target.type === 'checkbox') {
                this.toggleTask(taskId);
            }
            
            if (e.target.closest('.delete-btn')) {
                if (confirm('Удалить задачу?')) {
                    this.deleteTask(taskId);
                }
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});