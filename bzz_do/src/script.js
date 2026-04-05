import { tasks, habits, diaryEntries } from './core/models.js';
import { loadFromStorage } from './core/storage.js';

function getActivePage() {
    const path = window.location.pathname;
    if (path.includes('planner.html')) return 'planner';
    if (path.includes('diary.html')) return 'diary';
    if (path.includes('stats.html')) return 'stats';
    if (path.includes('profile.html')) return 'profile';
    return 'index';
}

document.addEventListener('DOMContentLoaded', () => {
    import('./core/models.js').then(() => {
        const page = getActivePage();
        switch (page) {
            case 'planner':
                import('./pages/planner.js').then(module => module.init());
                break;
            case 'diary':
                import('./pages/diary.js').then(module => module.init());
                break;
            case 'stats':
                import('./pages/stats.js').then(module => module.init());
                break;
            case 'profile':
                import('./pages/profile.js').then(module => module.init());
                break;
            default:
                import('./pages/index.js').then(module => module.init());
        }
    });
});