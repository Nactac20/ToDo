import {
    tasks,
    getTasksForDate,
    toggleTaskComplete,
    toggleSubtaskComplete,
    deleteSubtask,
    deleteTask
} from '../core/models.js';
import { formatDateFull, formatDateISO, nextId } from '../core/utils.js';

let currentMonthStart = new Date();
currentMonthStart.setDate(1);

export function init() {
    renderCalendar();
    renderTasksForDay(formatDateISO(new Date()));

    document.getElementById('planner-prev-month')?.addEventListener('click', () => {
        currentMonthStart.setMonth(currentMonthStart.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('planner-next-month')?.addEventListener('click', () => {
        currentMonthStart.setMonth(currentMonthStart.getMonth() + 1);
        renderCalendar();
    });

    document.getElementById('task-detail-modal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
    });
    document.querySelector('#task-detail-modal .close')?.addEventListener('click', () => {
        document.getElementById('task-detail-modal').style.display = 'none';
    });
}

function renderCalendar() {
    const grid = document.getElementById('planner-calendar-grid');
    const monthYearEl = document.getElementById('planner-month-year');
    if (!grid || !monthYearEl) return;

    const year = currentMonthStart.getFullYear();
    const month = currentMonthStart.getMonth();
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    grid.innerHTML = '';

    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekdays.forEach(day => {
        const weekdayEl = document.createElement('div');
        weekdayEl.className = 'week-day';
        weekdayEl.textContent = day;
        grid.appendChild(weekdayEl);
    });

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i < startDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'other-month';
        empty.textContent = new Date(year, month, 1 - (startDay - i)).getDate();
        grid.appendChild(empty);
    }

    const todayStr = formatDateISO(new Date());

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDateISO(date);
        const dayEl = document.createElement('div');
        dayEl.textContent = day;
        dayEl.dataset.date = dateStr;

        if (dateStr === todayStr) dayEl.classList.add('today');
        if (getTasksForDate(dateStr).length > 0) dayEl.classList.add('has-tasks');

        dayEl.addEventListener('click', () => {
            document.querySelectorAll('.planner-calendar-grid div').forEach(el => el.classList.remove('active'));
            dayEl.classList.add('active');
            document.getElementById('planner-selected-day').textContent = formatDateFull(date);
            renderTasksForDay(dateStr);
        });

        grid.appendChild(dayEl);
    }

    const todayEl = grid.querySelector(`[data-date="${todayStr}"]`);
    if (todayEl) {
        todayEl.classList.add('active');
        document.getElementById('planner-selected-day').textContent = `Сегодня, ${formatDateFull(new Date())}`;
    }
}

function renderTasksForDay(dateStr) {
    const list = document.getElementById('planner-task-list');
    const placeholder = document.querySelector('.task-list-placeholder');
    if (!list) return;

    const tasksForDay = getTasksForDate(dateStr);
    list.innerHTML = '';

    if (tasksForDay.length === 0) {
        placeholder.style.display = 'block';
        list.style.display = 'none';
        return;
    }

    placeholder.style.display = 'none';
    list.style.display = 'block';

    tasksForDay.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <label class="task-checkbox-wrapper">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-title">${task.title}</span>
            </label>
            ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
        `;

        li.addEventListener('click', (e) => {
            if (e.target.closest('.task-checkbox-wrapper')) return;
            openTaskDetail(task);
        });

        const checkbox = li.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            toggleTaskComplete(task.id);
            li.classList.toggle('completed', checkbox.checked);
        });

        list.appendChild(li);
    });
}

function openTaskDetail(task) {
    const modal = document.getElementById('task-detail-modal');
    const content = modal.querySelector('#task-detail-content');
    content.innerHTML = `
        <h4>${task.title}</h4>
        ${task.description ? `<p><strong>Описание:</strong> ${task.description}</p>` : ''}
        ${task.subtasks?.length ? `
            <h5>Подзадачи:</h5>
            <ul>
                ${task.subtasks.map((st, i) => `
                    <li>
                        <label>
                            <input type="checkbox" ${st.completed ? 'checked' : ''} data-task-id="${task.id}" data-idx="${i}">
                            ${st.text}
                        </label>
                    </li>
                `).join('')}
            </ul>
        ` : ''}
        <div class="modal-actions">
            <button class="btn-cancel" onclick="document.getElementById('task-detail-modal').style.display='none'">Закрыть</button>
        </div>
    `;
    content.addEventListener('change', (e) => {
        if (e.target.matches('input[type="checkbox"]')) {
            const taskId = Number(e.target.dataset.taskId);
            const idx = Number(e.target.dataset.idx);
            toggleSubtaskComplete(taskId, idx);
        }
    });

    modal.style.display = 'flex';
}