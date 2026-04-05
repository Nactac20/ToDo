export function nextId(arr) {
    return arr.length === 0 ? 1 : Math.max(...arr.map(item => item.id)) + 1;
}

export function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : day - 1;
    d.setDate(d.getDate() - diff);
    return d;
}

export function formatDateShort(date) {
    const monthNames = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
}

export function formatDateFull(date) {
    const monthNames = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateISO(date) {
    return date.toISOString().split('T')[0];
}