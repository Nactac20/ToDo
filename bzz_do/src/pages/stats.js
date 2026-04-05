import {
    tasks,
    habits,
    diaryEntries,
    getTasksByDateRange,
    getDiaryEntriesInRange
} from '../core/models.js';
import { formatDateISO, formatDateShort } from '../core/utils.js';

export function init() {
    updateStats();
    renderHabitSummary();
    renderHistoryTable();
    renderChart();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
    const streak = calculateStreak();

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-productivity').textContent = `${productivity}%`;
    document.getElementById('stat-streak').textContent = streak;
}

function calculateStreak() {
    if (tasks.length === 0) return 0;

    const dates = [...new Set(tasks.map(t => t.date))].map(d => new Date(d)).sort((a, b) => a - b);

    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < dates.length; i++) {
        const diff = Math.floor((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else if (diff > 1) {
            currentStreak = 1;
        }
    }

    return maxStreak;
}

function renderHabitSummary() {
    const container = document.getElementById('habit-summary');
    if (habits.length === 0) {
        container.innerHTML = '<p>Нет привычек</p>';
        return;
    }

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);

    let html = '<ul class="habit-summary-list">';
    habits.forEach(habit => {
        let count = 0;
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateStr = formatDateISO(date);
            if (habit.completions[dateStr]) count++;
        }
        const stars = '⭐'.repeat(count) + '☆'.repeat(7 - count);
        html += `<li><strong>${habit.name}</strong>: ${count}/7 ${stars}</li>`;
    });
    html += '</ul>';

    container.innerHTML = html;
}

function renderHistoryTable() {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    const dateMap = {};
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = formatDateISO(date);
        dateMap[dateStr] = {
            date: date,
            tasks: 0,
            completed: 0,
            habits: 0,
            mood: null
        };
    }

    tasks.forEach(task => {
        if (dateMap[task.date]) {
            dateMap[task.date].tasks++;
            if (task.completed) dateMap[task.date].completed++;
        }
    });

    habits.forEach(habit => {
        Object.keys(habit.completions).forEach(dateStr => {
            if (dateMap[dateStr] && habit.completions[dateStr]) {
                dateMap[dateStr].habits++;
            }
        });
    });

    diaryEntries.forEach(entry => {
        if (dateMap[entry.date]) {
            dateMap[entry.date].mood = entry.mood;
        }
    });

    const rows = Object.values(dateMap).map(item => {
        const moodEmoji = item.mood ? ['😞','😐','🙂','😄','🤩'][item.mood - 1] : '—';
        return `
            <tr>
                <td>${formatDateShort(item.date)}</td>
                <td>${item.tasks}</td>
                <td>${item.completed}</td>
                <td>${item.habits}</td>
                <td class="mood-cell">${moodEmoji}</td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rows;
}

function renderChart() {
    const ctx = document.getElementById('tasks-chart');
    if (!ctx) return;

    const today = new Date();
    const labels = [];
    const totalData = [];
    const completedData = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = formatDateISO(date);
        labels.push(date.toLocaleDateString([], { weekday: 'short', day: 'numeric' }));

        const dayTasks = tasks.filter(t => t.date === dateStr);
        totalData.push(dayTasks.length);
        completedData.push(dayTasks.filter(t => t.completed).length);
    }

    const oldChart = Chart.getChart(ctx);
    if (oldChart) oldChart.destroy();

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Всего',
                    data: totalData,
                    backgroundColor: '#ddd',
                    borderColor: '#999',
                    borderWidth: 1
                },
                {
                    label: 'Выполнено',
                    data: completedData,
                    backgroundColor: '#ffd700',
                    borderColor: '#000',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}