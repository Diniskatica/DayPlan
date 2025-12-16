class AuthManager {
    constructor() {
        this.usersKey = 'dailyPlanner_users';
        this.currentUserKey = 'dailyPlanner_currentUser';
        this.init();
    }

    init() {
        // Инициализируем хранилище пользователей, если пусто
        if (!localStorage.getItem(this.usersKey)) {
            localStorage.setItem(this.usersKey, JSON.stringify([
                { username: 'demo', password: 'demo', createdAt: new Date().toISOString() }
            ]));
        }
        this.renderAuthBlock();
    }

    getCurrentUser() {
        return localStorage.getItem(this.currentUserKey) || 'anonymous';
    }

    renderAuthBlock() {
        const authBlock = document.getElementById('auth-block');
        if (!authBlock) return;

        const currentUser = this.getCurrentUser();
        
        if (currentUser === 'anonymous') {
            authBlock.innerHTML = `
                <button id="show-auth" class="btn-auth">Войти</button>
            `;
            document.getElementById('show-auth')?.addEventListener('click', () => this.showModal());
        } else {
            authBlock.innerHTML = `
                <span class="username">@${currentUser}</span>
                <button id="logout" class="btn-auth">Выйти</button>
            `;
            document.getElementById('logout')?.addEventListener('click', () => this.logout());
        }
    }

    showModal() {
        const modal = document.getElementById('auth-modal');
        const forms = document.getElementById('auth-forms');
        
        forms.innerHTML = `
            <div class="auth-form active" id="login-form">
                <h3>Вход</h3>
                <input type="text" id="login-username" placeholder="Имя пользователя" required>
                <input type="password" id="login-password" placeholder="Пароль" required>
                <button class="btn-primary" id="login-btn">Войти</button>
                <p class="auth-switch">Нет аккаунта? <a href="#" id="go-register">Зарегистрироваться</a></p>
            </div>
            <div class="auth-form" id="register-form">
                <h3>Регистрация</h3>
                <input type="text" id="register-username" placeholder="Имя пользователя" minlength="3" required>
                <input type="password" id="register-password" placeholder="Пароль" minlength="4" required>
                <button class="btn-primary" id="register-btn">Создать аккаунт</button>
                <p class="auth-switch">Есть аккаунт? <a href="#" id="go-login">Войти</a></p>
            </div>
        `;

        // Показываем модальное окно
        modal.style.display = 'block';

        // Обработчики переключения форм
        document.getElementById('go-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').classList.remove('active');
            document.getElementById('register-form').classList.add('active');
        });

        document.getElementById('go-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-form').classList.remove('active');
            document.getElementById('login-form').classList.add('active');
        });

        // Обработчики кнопок
        document.getElementById('login-btn')?.addEventListener('click', () => this.login());
        document.getElementById('register-btn')?.addEventListener('click', () => this.register());

        // Закрытие модального окна
        document.querySelector('.close-modal')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        const users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem(this.currentUserKey, username);
            this.migrateTasks('anonymous', username);
            this.renderAuthBlock();
            document.getElementById('auth-modal').style.display = 'none';
            window.location.reload();
        } else {
            alert('Неверное имя пользователя или пароль');
        }
    }

    register() {
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        
        if (username.length < 3) {
            alert('Имя пользователя должно быть не менее 3 символов');
            return;
        }
        
        if (password.length < 4) {
            alert('Пароль должен быть не менее 4 символов');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
        
        if (users.find(u => u.username === username)) {
            alert('Пользователь с таким именем уже существует');
            return;
        }
        
        users.push({
            username,
            password,
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        localStorage.setItem(this.currentUserKey, username);
        this.migrateTasks('anonymous', username);
        
        this.renderAuthBlock();
        document.getElementById('auth-modal').style.display = 'none';
        alert('Аккаунт создан!');
        window.location.reload();
    }

    migrateTasks(fromUser, toUser) {
        const oldKey = `dailyPlanner_tasks_${fromUser}`;
        const newKey = `dailyPlanner_tasks_${toUser}`;
        
        const oldTasks = JSON.parse(localStorage.getItem(oldKey) || '[]');
        const newTasks = JSON.parse(localStorage.getItem(newKey) || '[]');
        
        // Объединяем задачи, убирая дубликаты по id
        const combinedTasks = [...newTasks, ...oldTasks];
        const uniqueTasks = combinedTasks.filter((task, index, self) =>
            index === self.findIndex(t => t.id === task.id)
        );
        
        localStorage.setItem(newKey, JSON.stringify(uniqueTasks));
        localStorage.removeItem(oldKey);
    }

    logout() {
        localStorage.removeItem(this.currentUserKey);
        this.renderAuthBlock();
        window.location.reload();
    }
}

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});