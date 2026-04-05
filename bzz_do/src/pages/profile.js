import { saveToStorage, loadFromStorage } from '../core/storage.js';
import { tasks, habits, diaryEntries } from '../core/models.js';

export function init() {
    loadUserProfile();
    setupModals();

    document.getElementById('save-profile')?.addEventListener('click', openSaveModal);
    document.getElementById('export-data')?.addEventListener('click', exportData);
    document.getElementById('clear-data')?.addEventListener('click', openResetModal);
    document.getElementById('change-avatar')?.addEventListener('click', () => {
        alert('Загрузка аватара пока не реализована');
    });
    document.getElementById('theme')?.addEventListener('change', applyTheme);
}

function setupModals() {
    document.querySelectorAll('.close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    });

    document.getElementById('save-profile-confirm')?.addEventListener('click', confirmSave);
    document.getElementById('reset-all-confirm')?.addEventListener('click', confirmReset);
}

function loadUserProfile() {
    const saved = loadFromStorage('todo-profile', {
        username: 'anna_bee',
        email: 'anna@example.com',
        theme: 'bee',
        notifications: true
    });

    document.getElementById('username').value = saved.username;
    document.getElementById('email').value = saved.email;
    document.getElementById('theme').value = saved.theme;
    document.getElementById('notifications').checked = saved.notifications;

    updateStatsCounters();
    applyTheme();
}

function updateStatsCounters() {
    const completed = tasks.filter(t => t.completed).length;
    const days = new Set(tasks.map(t => t.date)).size;
    document.querySelector('.profile-stats span:nth-child(1) strong').textContent = completed;
    document.querySelector('.profile-stats span:nth-child(2) strong').textContent = days;
}

function openSaveModal() {
    const modal = document.getElementById('save-profile-modal');
    modal.style.display = 'flex';
}

function confirmSave() {
    const profile = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        theme: document.getElementById('theme').value,
        notifications: document.getElementById('notifications').checked
    };
    saveToStorage('todo-profile', profile);
    alert('Настройки сохранены!');
    document.getElementById('save-profile-modal').style.display = 'none';
}

function openResetModal() {
    const modal = document.getElementById('reset-all-modal');
    modal.style.display = 'flex';
}

function confirmReset() {
    localStorage.clear();
    alert('Все данные сброшены. Перезагрузите страницу.');
    document.getElementById('reset-all-modal').style.display = 'none';
}

function exportData() {
    const data = {
        tasks,
        habits,
        diary: diaryEntries,
        profile: loadFromStorage('todo-profile')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo_bee_export_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function applyTheme() {
    const theme = document.getElementById('theme').value;
    document.body.className = theme;

    if (theme === 'dark') {
        document.documentElement.style.setProperty('--bg-color', '#121212');
        document.documentElement.style.setProperty('--text-color', '#fff');
        document.documentElement.style.setProperty('--header-bg', '#1e1e1e');
        document.documentElement.style.setProperty('--card-bg', '#1e1e1e');
        document.documentElement.style.setProperty('--accent', '#ffd700');
        document.documentElement.style.setProperty('--border', '#333');
    } else if (theme === 'light') {
        document.documentElement.style.setProperty('--bg-color', '#fff');
        document.documentElement.style.setProperty('--text-color', '#000');
        document.documentElement.style.setProperty('--header-bg', '#fff');
        document.documentElement.style.setProperty('--card-bg', '#fff');
        document.documentElement.style.setProperty('--accent', '#ffd700');
        document.documentElement.style.setProperty('--border', '#ddd');
    } else { 
        document.documentElement.style.setProperty('--bg-color', '#fff');
        document.documentElement.style.setProperty('--text-color', '#000');
        document.documentElement.style.setProperty('--header-bg', '#ffd700');
        document.documentElement.style.setProperty('--card-bg', '#fff');
        document.documentElement.style.setProperty('--accent', '#ffd700');
        document.documentElement.style.setProperty('--border', '#ddd');
    }

    const logo = document.querySelector('.logo');
    if (logo) {
        if (theme === 'dark') {
            logo.style.color = '#ffd700';
        } else {
            logo.style.color = '#000';
        }
    }
}