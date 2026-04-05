import {
    tasks,
    habits,
    getTasksForDate,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleSubtaskComplete,
    deleteSubtask,
    addHabit,
    deleteHabit,
    toggleHabitCompletion,
    saveHabits
} from '../core/models.js';

import { formatDateShort, formatDateFull, getMonday } from '../core/utils.js';
import { setupModals } from '../ui/modal.js';

let currentDate;
let currentHabitWeekStart;

export function init() {
    const today = new Date();
    currentDate = today.toISOString().split('T')[0];
    currentHabitWeekStart = getMonday(new Date());

    generateCalendar(currentHabitWeekStart);
    renderHabits(currentHabitWeekStart);
    renderTaskList(currentDate);

    setupModals();

    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('prev-days')?.addEventListener('click', () => {
        currentHabitWeekStart.setDate(currentHabitWeekStart.getDate() - 7);
        generateCalendar(currentHabitWeekStart);
    });
    document.getElementById('next-days')?.addEventListener('click', () => {
        currentHabitWeekStart.setDate(currentHabitWeekStart.getDate() + 7);
        generateCalendar(currentHabitWeekStart);
    });

    document.getElementById('prev-week-habits')?.addEventListener('click', () => {
        currentHabitWeekStart.setDate(currentHabitWeekStart.getDate() - 7);
        renderHabits(currentHabitWeekStart);
    });
    document.getElementById('next-week-habits')?.addEventListener('click', () => {
        currentHabitWeekStart.setDate(currentHabitWeekStart.getDate() + 7);
        renderHabits(currentHabitWeekStart);
    });

    document.getElementById('add-task-btn')?.addEventListener('click', () => {
        const modal = document.getElementById('add-task-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('task-name').value = '';
            document.getElementById('task-description').value = '';
            document.getElementById('subtasks').value = '';
        }
    });

    document.getElementById('add-habit')?.addEventListener('click', () => {
        const modal = document.getElementById('add-habit-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('habit-name').value = '';
        }
    });

    document.getElementById('add-task-submit')?.addEventListener('click', () => {
        const name = document.getElementById('task-name')?.value.trim();
        const desc = document.getElementById('task-description')?.value.trim();
        const rawSubtasks = document.getElementById('subtasks')?.value || '';
        const subtasks = rawSubtasks
            .split('\n')
            .map(s => s.trim())
            .filter(s => s);

        if (name) {
            addTask(currentDate, name, desc, subtasks);
            document.getElementById('add-task-modal').style.display = 'none';
            renderTaskList(currentDate);
        }
    });

    document.getElementById('edit-task-submit')?.addEventListener('click', () => {
        const modal = document.getElementById('edit-task-modal');
        const taskId = Number(modal.dataset.taskId);
        if (!taskId) return;

        const name = document.getElementById('edit-task-name')?.value.trim();
        const desc = document.getElementById('edit-task-description')?.value.trim();
        const rawSubtasks = document.getElementById('edit-subtasks')?.value || '';
        const subtasks = rawSubtasks
            .split('\n')
            .map(s => s.trim())
            .filter(s => s);

        if (name) {
            updateTask(taskId, name, desc, subtasks);
            modal.style.display = 'none';
            renderTaskList(currentDate);
        }
    });

    document.getElementById('add-habit-submit')?.addEventListener('click', () => {
        const name = document.getElementById('habit-name')?.value.trim();
        if (name) {
            addHabit(name);
            document.getElementById('add-habit-modal').style.display = 'none';
            renderHabits(currentHabitWeekStart);
        }
    });

    document.getElementById('delete-confirm-btn')?.addEventListener('click', () => {
        const modal = document.getElementById('delete-task-modal');
        const taskId = Number(modal.dataset.taskId);
        const habitId = Number(modal.dataset.habitId);

        if (taskId) {
            deleteTask(taskId);
            delete modal.dataset.taskId;
        } else if (habitId) {
            deleteHabit(habitId);
            delete modal.dataset.habitId;
        }

        modal.style.display = 'none';
        renderTaskList(currentDate);
        renderHabits(currentHabitWeekStart);
    });
}

function generateCalendar(weekStart) {
    const daysEl = document.getElementById('calendar-days');
    if (!daysEl) return;

    daysEl.innerHTML = '';
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    document.getElementById('calendar-range').textContent = `${formatDateShort(weekStart)} – ${formatDateShort(end)}`;

    let d = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
        const dateStr = d.toISOString().split('T')[0];
        const el = document.createElement('div');
        el.className = 'calendar-day' + (getTasksForDate(dateStr).length ? ' has-tasks' : '');
        el.textContent = `${d.getDate()} ${['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d.getDay()]}`;
        el.dataset.date = dateStr;

        el.addEventListener('click', () => {
            currentDate = dateStr;
            document.querySelectorAll('.calendar-day').forEach(e => e.classList.remove('active'));
            el.classList.add('active');
            document.getElementById('current-date').textContent = formatDateFull(new Date(dateStr));
            renderTaskList(dateStr);
        });

        daysEl.appendChild(el);
        d.setDate(d.getDate() + 1);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayEl = daysEl.querySelector(`[data-date="${todayStr}"]`);
    if (todayEl) todayEl.classList.add('active');
}

function renderTaskList(dateStr) {
    const list = document.getElementById('task-list');
    if (!list) return;

    const tasksForDate = getTasksForDate(dateStr);
    list.innerHTML = '';

    if (tasksForDate.length === 0) {
        list.innerHTML = '<li class="task-item">Нет задач</li>';
        return;
    }

    tasksForDate.forEach(task => {
        const el = document.createElement('li');
        el.className = `task-item ${task.completed ? 'completed' : ''}`;
        el.dataset.id = task.id;

        el.innerHTML = `
            <div class="task-header">
                <label class="task-checkbox-wrapper">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-title">${task.title}</span>
                </label>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn">✏️</button>
                    <button class="task-action-btn delete-btn">×</button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            ${task.subtasks?.length ? `
                <div class="subtasks">
                    ${task.subtasks.map((st, i) => {
                        const subtask = typeof st === 'string' ? { text: st, completed: false } : st;
                        return `
                            <div class="subtask-item">
                                <label class="subtask-checkbox-wrapper">
                                    <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                                    <span class="subtask-text">${subtask.text}</span>
                                </label>
                                <div class="subtask-actions">
                                    <button class="subtask-action-btn delete" data-subtask-idx="${i}">×</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}
        `;

        const checkbox = el.querySelector('.task-checkbox-wrapper input');
        checkbox.addEventListener('change', () => {
            toggleTaskComplete(task.id);
            renderTaskList(currentDate); 
        });

        el.querySelectorAll('.subtask-checkbox-wrapper input').forEach((cb, idx) => {
            cb.addEventListener('change', () => {
                toggleSubtaskComplete(task.id, idx);
                renderTaskList(currentDate);
            });
        });

        el.querySelector('.edit-btn')?.addEventListener('click', () => {
            const modal = document.getElementById('edit-task-modal');
            modal.dataset.taskId = task.id;
            document.getElementById('edit-task-name').value = task.title;
            document.getElementById('edit-task-description').value = task.description || '';
            document.getElementById('edit-subtasks').value = task.subtasks.map(st =>
                typeof st === 'string' ? st : st.text
            ).join('\n');
            modal.style.display = 'flex';
        });

        el.querySelector('.delete-btn')?.addEventListener('click', () => {
            const modal = document.getElementById('delete-task-modal');
            modal.dataset.taskId = task.id;
            modal.querySelector('h3').textContent = 'Удалить задачу';
            modal.querySelector('p').textContent = 'Удаляем задачу (безвозвратно)';
            modal.style.display = 'flex';
        });

        el.querySelectorAll('.subtask-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = Number(btn.dataset.subtaskIdx);
                deleteSubtask(task.id, idx);
                renderTaskList(currentDate);
            });
        });

        list.appendChild(el);
    });
}

function renderHabits(weekStart) {
    const tbody = document.getElementById('habits-body');
    if (!tbody) return;

    const dates = [];
    let d = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
        const dateStr = new Date(d).toISOString().split('T')[0];
        dates.push(dateStr);
        d.setDate(d.getDate() + 1);
    }

    const start = new Date(dates[0]);
    const end = new Date(dates[6]);
    document.getElementById('current-week-habits').textContent =
        `${start.getDate()} ${['янв','фев','мар','апр','мая','июня','июля','авг','сен','окт','ноя','дек'][start.getMonth()]} - ` +
        `${end.getDate()} ${['янв','фев','мар','апр','мая','июня','июля','авг','сен','окт','ноя','дек'][end.getMonth()]}`;

    tbody.innerHTML = '';

    habits.forEach(habit => {
        const tr = document.createElement('tr');
        tr.className = 'habit-row';

        tr.innerHTML = `
            <td>
                <button class="habit-delete-btn">×</button>
                <span>${habit.name}</span>
            </td>
        `;

        dates.forEach(dateStr => {
            const td = document.createElement('td');
            td.innerHTML = `<input type="checkbox" ${habit.completions?.[dateStr] ? 'checked' : ''}>`;
            tr.appendChild(td);

            td.querySelector('input').addEventListener('change', () => {
                toggleHabitCompletion(habit.id, dateStr);
            });
        });

        const notesTd = document.createElement('td');
        notesTd.innerHTML = `<input type="text" value="${habit.notes || ''}" placeholder="Заметки">`;
        tr.appendChild(notesTd);

        notesTd.querySelector('input').addEventListener('change', (e) => {
            habit.notes = e.target.value;
            saveHabits();
        });

        tr.querySelector('.habit-delete-btn').addEventListener('click', () => {
            const modal = document.getElementById('delete-task-modal');
            modal.dataset.habitId = habit.id;
            modal.querySelector('h3').textContent = 'Удалить привычку';
            modal.querySelector('p').textContent = 'Удаляем привычку (безвозвратно)';
            modal.style.display = 'flex';
        });

        tbody.appendChild(tr);
    });
}