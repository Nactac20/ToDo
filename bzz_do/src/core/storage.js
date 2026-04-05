export const TASKS_STORAGE_KEY = 'todo-tasks';
export const HABITS_STORAGE_KEY = 'todo-habits';
export const DIARY_STORAGE_KEY = 'todo-diary';

export function loadFromStorage(key, fallback = []) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
        console.warn(`Не удалось загрузить ${key} из localStorage`, e);
        return fallback;
    }
}

export function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn(`Не удалось сохранить ${key} в localStorage`, e);
    }
}