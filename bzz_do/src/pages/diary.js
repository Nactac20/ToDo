import {
    diaryEntries,
    addOrUpdateDiaryEntry,
    deleteDiaryEntry,
    getDiaryEntry,
    getDiaryEntriesInRange
} from '../core/models.js';
import { formatDateISO, formatDateFull } from '../core/utils.js';

let currentDate = new Date();

export function init() {
    updateDateDisplay();
    loadDiaryForDate(currentDate);
    renderDiaryHistory();

    document.getElementById('diary-prev-day')?.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
        loadDiaryForDate(currentDate);
    });
    document.getElementById('diary-next-day')?.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
        loadDiaryForDate(currentDate);
    });

    document.getElementById('diary-save-btn')?.addEventListener('click', saveDiaryEntry);
    document.getElementById('diary-delete-btn')?.addEventListener('click', openDeleteModal);

    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('diary-mood-value').value = btn.dataset.value;
        });
    });

    setupModals();
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

    document.getElementById('delete-diary-confirm')?.addEventListener('click', confirmDelete);
}

function updateDateDisplay() {
    const el = document.getElementById('diary-current-date');
    if (!el) return;
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();
    el.textContent = `${isToday ? 'Сегодня' : formatDateFull(currentDate)}`;
}

function loadDiaryForDate(date) {
    const entry = getDiaryEntry(formatDateISO(date));
    const moodInput = document.getElementById('diary-mood-value') || document.createElement('input');
    moodInput.id = 'diary-mood-value';
    moodInput.type = 'hidden';
    moodInput.value = entry ? entry.mood : 3;
    document.body.appendChild(moodInput);

    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.value) === (entry ? entry.mood : 3));
    });

    document.getElementById('diary-content').value = entry ? entry.content : '';
    document.getElementById('diary-delete-btn').style.display = entry ? 'inline-block' : 'none';
}

function saveDiaryEntry() {
    const mood = Number(document.getElementById('diary-mood-value')?.value || 3);
    const content = document.getElementById('diary-content')?.value || '';
    addOrUpdateDiaryEntry(formatDateISO(currentDate), mood, content);
    document.getElementById('diary-delete-btn').style.display = 'inline-block';
    renderDiaryHistory();
}

function openDeleteModal() {
    const modal = document.getElementById('delete-diary-modal');
    modal.style.display = 'flex';
}

function confirmDelete() {
    const modal = document.getElementById('delete-diary-modal');
    deleteDiaryEntry(formatDateISO(currentDate));
    modal.style.display = 'none';
    loadDiaryForDate(currentDate);
    renderDiaryHistory();
}

function renderDiaryHistory() {
    const list = document.getElementById('diary-entries-list');
    if (!list) return;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentEntries = getDiaryEntriesInRange(weekAgo, new Date())
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = recentEntries.length ? '' : '<li>Нет записей за последние 7 дней</li>';

    recentEntries.forEach(entry => {
        const li = document.createElement('li');
        li.className = 'diary-history-item';
        const date = new Date(entry.date);
        const moodEmoji = ['😞','😐','🙂','😄','🤩'][entry.mood - 1] || '🙂';
        li.innerHTML = `
            <strong>${date.getDate()} ${['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'][date.getMonth()]}</strong> 
            — Настроение: ${moodEmoji}  
            <button class="btn-view" data-date="${entry.date}">Просмотр</button>
        `;
        li.querySelector('.btn-view').addEventListener('click', () => {
            openViewModal(entry);
        });
        list.appendChild(li);
    });
}

function openViewModal(entry) {
    const modal = document.getElementById('view-diary-modal');
    const dateEl = document.getElementById('view-date');
    const moodEl = document.getElementById('view-mood');
    const contentEl = document.getElementById('view-content');

    dateEl.textContent = formatDateFull(new Date(entry.date));
    moodEl.textContent = ['😞','😐','🙂','😄','🤩'][entry.mood - 1] || '🙂';
    contentEl.textContent = entry.content || '(пусто)';

    modal.style.display = 'flex';
}