/**
 * MonoFlow Metrics Logic - Accurate Count Fix
 */

const STORAGE_KEY = 'monoflow-v10-refactored';
let statusChart = null;
let priorityChart = null;
let selectedLabels = new Set(); 

const COLORS = {
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200'
};

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(/-/g, '/');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
}

// --- UI Interaction for Label Menu ---
const labelMenu = document.getElementById('metrics-label-menu');
function toggleLabelMenu(e) {
    e.stopPropagation();
    if(labelMenu) labelMenu.classList.toggle('hidden');
}
function clearLabels() {
    selectedLabels.clear();
    initMetrics();
}
document.addEventListener('click', () => { if(labelMenu) labelMenu.classList.add('hidden'); });
if(labelMenu) labelMenu.addEventListener('click', (e) => e.stopPropagation());

function renderLabelList(data) {
    const container = document.getElementById('metrics-label-chips');
    const countDisplay = document.getElementById('selected-label-count');
    if (!data || !data.labels || !container) return;
    countDisplay.textContent = selectedLabels.size > 0 ? `${selectedLabels.size}` : Common.t('filter_all');
    container.innerHTML = '';
    data.labels.forEach(l => {
        const isActive = selectedLabels.has(l.id);
        const colorClass = COLORS[l.color] || COLORS.blue;
        const item = document.createElement('button');
        item.className = `w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isActive ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50/50'}`;
        item.innerHTML = `<div class="w-4 h-4 rounded-full border flex items-center justify-center ${isActive ? colorClass : 'border-slate-200 bg-white dark:bg-slate-700 dark:border-slate-600'}">${isActive ? '<i data-lucide="check" class="w-2.5 h-2.5"></i>' : ''}</div><span class="text-sm font-semibold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}">${l.name}</span>`;
        item.onclick = () => { if (isActive) selectedLabels.delete(l.id); else selectedLabels.add(l.id); initMetrics(); };
        container.appendChild(item);
    });
    lucide.createIcons();
}

function translateUI() {
    document.querySelector('h1').textContent = Common.t('metrics_title');
    const subtitle = document.querySelector('h1 + p');
    if (subtitle) subtitle.textContent = Common.t('metrics_subtitle');
    const periodLabel = document.getElementById('metrics-period-label');
    if (periodLabel) periodLabel.textContent = Common.t('metrics_period');
    const labelLabel = document.getElementById('metrics-label-label');
    if (labelLabel) labelLabel.textContent = Common.t('filter_label');
    const aboutLink = document.getElementById('about-link');
    if (aboutLink) aboutLink.textContent = Common.t('about_link');
    const menuTitle = document.querySelector('#metrics-label-menu span');
    if (menuTitle) menuTitle.textContent = Common.t('metrics_label_select');
    const menuClear = document.querySelector('#metrics-label-menu button');
    if (menuClear) menuClear.textContent = Common.t('metrics_clear');
    const backLink = document.querySelector('a[href="index.html"] span');
    if (backLink) backLink.textContent = Common.t('back_to_app');
    const cards = document.querySelectorAll('.stat-card');
    if (cards.length >= 4) {
        cards[0].querySelector('.stat-label').textContent = Common.t('metrics_total');
        cards[1].querySelector('.stat-label').textContent = Common.t('metrics_rate');
        cards[2].querySelector('.stat-label').textContent = Common.t('metrics_avg');
        cards[3].querySelector('.stat-label').textContent = Common.t('metrics_done');
    }
    const h2s = document.querySelectorAll('h2');
    if (h2s.length >= 2) {
        h2s[0].innerHTML = `<i data-lucide="pie-chart" class="w-4 h-4"></i> ${Common.t('metrics_dist')}`;
        h2s[1].innerHTML = `<i data-lucide="bar-chart-3" class="w-4 h-4"></i> ${Common.t('metrics_prio_dist')}`;
    }
}

function initMetrics() {
    const data = loadData();
    if (!data) return;

    translateUI();
    renderLabelList(data);

    let startDateVal = document.getElementById('start-date').value;
    let endDateVal = document.getElementById('end-date').value;

    if (!startDateVal) {
        const d = new Date(); d.setDate(d.getDate() - 14);
        startDateVal = d.toISOString().split('T')[0];
        document.getElementById('start-date').value = startDateVal;
    }
    if (!endDateVal) {
        endDateVal = new Date().toISOString().split('T')[0];
        document.getElementById('end-date').value = endDateVal;
    }

    const startTs = new Date(startDateVal).setHours(0,0,0,0);
    const endTs = new Date(endDateVal).setHours(23,59,59,999);

    const allTasks = Object.values(data.tasks);
    
    // 1. Filter Tasks for the period
    const filteredTasks = allTasks.filter(t => {
        if (selectedLabels.size > 0 && (!t.labels || !t.labels.some(lid => selectedLabels.has(lid)))) return false;
        const created = parseDate(t.createdAt);
        const completed = parseDate(t.completedDate);
        if (!created) return false;
        
        // Task is relevant if it was active during this period
        return created.getTime() <= endTs && (!completed || completed.getTime() >= startTs);
    });

    const statusCounts = { todo: 0, progress: 0, done: 0 };
    const priorityCounts = { high: 0, medium: 0, low: 0, none: 0 };
    let doneInPeriod = 0;
    let leadTimeTotal = 0;

    filteredTasks.forEach(t => {
        priorityCounts[t.priority || 'none']++;

        const completed = parseDate(t.completedDate);
        let status = 'todo';
        
        // Accurate Status Check (Done column OR archive with completedDate)
        let isInDoneColumn = false;
        for (const cid in data.columns) {
            if (data.columns[cid].taskIds.includes(t.id)) {
                if (cid === 'c2') status = 'progress';
                if (cid === 'c3') { status = 'done'; isInDoneColumn = true; }
                break;
            }
        }
        // If task is archived but has completedDate, it counts as 'done'
        if (t.archived && completed) status = 'done';
        statusCounts[status]++;

        // Total Done IN THIS PERIOD (This is what the card shows)
        if (completed && completed.getTime() >= startTs && completed.getTime() <= endTs) {
            doneInPeriod++;
            const created = parseDate(t.createdAt);
            if (created) leadTimeTotal += (completed.getTime() - created.getTime());
        }
    });

    const total = filteredTasks.length;
    const compRate = total > 0 ? Math.round((statusCounts.done / total) * 100) : 0;
    const avgDays = doneInPeriod > 0 ? (leadTimeTotal / doneInPeriod / (1000 * 60 * 60 * 24)).toFixed(1) : "0.0";

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completion-rate').textContent = `${compRate}%`;
    document.getElementById('avg-days').textContent = avgDays;
    document.getElementById('done-tasks').textContent = doneInPeriod;

    renderStatusChart(statusCounts);
    renderPriorityChart(priorityCounts);
}

function renderStatusChart(counts) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [Common.t('col_todo'), Common.t('col_progress'), Common.t('col_done')],
            datasets: [{
                data: [counts.todo, counts.progress, counts.done],
                backgroundColor: ['#E2E8F0', '#3B82F6', '#22C55E'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold', family: 'Inter' }, color: State.theme === 'dark' ? '#cbd5e1' : '#64748b' } } } }
    });
}

function renderPriorityChart(counts) {
    const ctx = document.getElementById('priorityChart').getContext('2d');
    if (priorityChart) priorityChart.destroy();
    const labels = CONSTANTS.PRIORITIES.map(p => p.label[State.language]);
    const values = CONSTANTS.PRIORITIES.map(p => counts[p.value] || 0);
    priorityChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: Common.t('metrics_total'), data: values, backgroundColor: ['#FEE2E2', '#FFEDD5', '#DBEAFE', '#F1F5F9'], borderColor: ['#EF4444', '#F97316', '#3B82F6', '#94A3B8'], borderWidth: 2, borderRadius: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { display: false }, ticks: { stepSize: 1, color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } }, x: { grid: { display: false }, ticks: { color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } } }, plugins: { legend: { display: false } } }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMetrics();
    lucide.createIcons();
    const sDate = document.getElementById('start-date');
    const eDate = document.getElementById('end-date');
    if(sDate) sDate.addEventListener('change', initMetrics);
    if(eDate) eDate.addEventListener('change', initMetrics);
});