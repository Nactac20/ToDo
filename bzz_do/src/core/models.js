import { nextId } from './utils.js';
import { TASKS_STORAGE_KEY, HABITS_STORAGE_KEY, DIARY_STORAGE_KEY, loadFromStorage, saveToStorage } from './storage.js';

export let tasks = loadFromStorage(TASKS_STORAGE_KEY);
tasks.forEach(task => {
    if (Array.isArray(task.subtasks)) {
        task.subtasks = task.subtasks.map(st => ({
            text: st.text || st,
            completed: st.completed || false
        }));
    }
});

export function saveTasks() { saveToStorage(TASKS_STORAGE_KEY, tasks); }
export function addTask(date, title, description = '', subtasks = []) {
    const newTask = {
        id: nextId(tasks),
        date,
        title,
        description,
        subtasks: subtasks.map(text => ({ text, completed: false })),
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    return newTask;
}
export function updateTask(id, title, description, subtasks) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.title = title;
        task.description = description;
        task.subtasks = subtasks.map(s => typeof s === 'string' ? { text: s, completed: false } : ({ text: s.text, completed: s.completed || false }));
        task.completed = task.subtasks.length === 0 ? false : task.subtasks.every(st => st.completed);
        saveTasks();
    }
}
export function deleteTask(id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
        tasks.splice(idx, 1);
        saveTasks();
    }
}
export function toggleTaskComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        if (task.subtasks && task.subtasks.length > 0) {
            const allCompleted = task.subtasks.every(st => st.completed);
            task.subtasks.forEach(st => st.completed = !allCompleted);
            task.completed = task.subtasks.every(st => st.completed);
        } else {
            task.completed = !task.completed;
        }
        saveTasks();
    }
}
export function toggleSubtaskComplete(taskId, subtaskIdx) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.subtasks[subtaskIdx]) {
        task.subtasks[subtaskIdx].completed = !task.subtasks[subtaskIdx].completed;
        task.completed = task.subtasks.every(st => st.completed);
        saveTasks();
    }
}
export function deleteSubtask(taskId, subtaskIdx) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.subtasks[subtaskIdx] !== undefined) {
        task.subtasks.splice(subtaskIdx, 1);
        task.completed = task.subtasks.length === 0 ? false : task.subtasks.every(st => st.completed);
        saveTasks();
    }
}
export function getTasksForDate(date) {
    return tasks.filter(t => t.date === date);
}
export function getTasksByDateRange(startDate, endDate) {
    return tasks.filter(t => {
        const taskDate = new Date(t.date);
        return taskDate >= startDate && taskDate <= endDate;
    });
}

export let habits = loadFromStorage(HABITS_STORAGE_KEY);

export function saveHabits() { saveToStorage(HABITS_STORAGE_KEY, habits); }
export function addHabit(name, notes = '') {
    const newHabit = { id: nextId(habits), name, completions: {}, notes };
    habits.push(newHabit);
    saveHabits();
    return newHabit;
}
export function deleteHabit(id) {
    const idx = habits.findIndex(h => h.id === id);
    if (idx !== -1) {
        habits.splice(idx, 1);
        saveHabits();
    }
}
export function toggleHabitCompletion(habitId, dateStr) {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        habit.completions[dateStr] = !habit.completions[dateStr];
        saveHabits();
    }
}

export let diaryEntries = loadFromStorage(DIARY_STORAGE_KEY);

export function saveDiary() { saveToStorage(DIARY_STORAGE_KEY, diaryEntries); }
export function addOrUpdateDiaryEntry(dateStr, mood = 3, content = '', updatedAt = new Date()) {
    const existing = diaryEntries.find(e => e.date === dateStr);
    if (existing) {
        existing.mood = mood;
        existing.content = content;
        existing.updatedAt = new Date(updatedAt).toISOString();
    } else {
        diaryEntries.push({
            id: nextId(diaryEntries),
            date: dateStr,
            mood,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date(updatedAt).toISOString()
        });
    }
    saveDiary();
    return diaryEntries.find(e => e.date === dateStr);
}
export function deleteDiaryEntry(dateStr) {
    const idx = diaryEntries.findIndex(e => e.date === dateStr);
    if (idx !== -1) {
        diaryEntries.splice(idx, 1);
        saveDiary();
    }
}
export function getDiaryEntry(dateStr) {
    return diaryEntries.find(e => e.date === dateStr);
}
export function getDiaryEntriesInRange(startDate, endDate) {
    return diaryEntries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate >= startDate && entryDate <= endDate;
    });
}