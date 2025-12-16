class ArchiveManager {
    constructor() {
        this.currentUser = localStorage.getItem('dailyPlanner_currentUser') || 'anonymous';
        this.tasksKey = `dailyPlanner_tasks_${this.currentUser}`;
        this.init();
    }

    init() {
        this.renderArchive();
        this.setupFilters();
    }

    getCompletedTasks() {
        const tasks = JSON.parse(localStorage.getItem(this.tasksKey) || '[]');
        return tasks
            .filter(task => task.completed)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    }

    renderArchive(filter = 'all') {
        const archiveList = document.getElementById('archive-list');
        if (!archiveList) return;
        
        let tasks = this.getCompletedTasks();
        const now = new Date();
        
        if (filter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            tasks = tasks.filter(task => new Date(task.completedAt) >= weekAgo);
        } else if (filter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            tasks = tasks.filter(task => new Date(task.completedAt) >= monthAgo);
        }
        
        if (tasks.length === 0) {
            archiveList.innerHTML = `
                <div class="empty-state">
                    <p>📭 Архив пуст</p>
                    <p>Выполненные задачи появятся здесь</p>
                </div>
            `;
            return;
        }
        
        archiveList.innerHTML = tasks.map(task => `
            <div class="archive-item">
                <div class="archive-task">
                    <span class="archive-text">${task.text}</span>
                    <div class="archive-meta">
                        <span class="archive-date">
                            ${new Date(task.completedAt).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                        <span class="archive-time">
                            ${new Date(task.completedAt).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderArchive(btn.dataset.filter);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.archiveManager = new ArchiveManager();
});