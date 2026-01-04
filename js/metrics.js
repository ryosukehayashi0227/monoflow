/**
 * MonoFlow Metrics Logic - High Precision Cycle Time
 */

const STORAGE_KEY = 'monoflow-v10-refactored';
let statusChart = null;
let priorityChart = null;
let throughputChart = null;
let selectedLabels = new Set(); 

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

function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// --- UI Interaction ---
const labelMenu = document.getElementById('metrics-label-menu');
function toggleLabelMenu(e) { e.stopPropagation(); if(labelMenu) labelMenu.classList.toggle('hidden'); }
function clearLabels() { selectedLabels.clear(); initMetrics(); }
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
        const colorClass = CONSTANTS.COLORS[l.color] || 'bg-blue-100 text-blue-700 border-blue-200';
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
    const backLink = document.querySelector('a[href="index.html"] span');
    if (backLink) backLink.textContent = Common.t('back_to_app');
    const cards = document.querySelectorAll('.stat-card');
    cards[0].querySelector('.stat-label').textContent = Common.t('metrics_total');
    cards[1].querySelector('.stat-label').textContent = Common.t('metrics_rate');
    cards[2].querySelector('.stat-label').textContent = Common.t('metrics_avg');
    cards[3].querySelector('.stat-label').textContent = Common.t('metrics_cycle_time');
    cards[4].querySelector('.stat-label').textContent = Common.t('metrics_est_finish');
    cards[5].querySelector('.stat-label').textContent = Common.t('metrics_done');
    document.getElementById('throughput-title').textContent = Common.t('metrics_throughput');
    const h2s = document.querySelectorAll('h2');
    if (h2s.length >= 3) {
        h2s[1].innerHTML = `<i data-lucide="pie-chart" class="w-4 h-4"></i> ${Common.t('metrics_dist')}`;
        h2s[2].innerHTML = `<i data-lucide="bar-chart-3" class="w-4 h-4"></i> ${Common.t('metrics_prio_dist')}`;
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
        startDateVal = toDateKey(d);
        document.getElementById('start-date').value = startDateVal;
    }
    if (!endDateVal) {
        endDateVal = toDateKey(new Date());
        document.getElementById('end-date').value = endDateVal;
    }

    const start = new Date(startDateVal.split('-')[0], startDateVal.split('-')[1]-1, startDateVal.split('-')[2], 0,0,0);
    const end = new Date(endDateVal.split('-')[0], endDateVal.split('-')[1]-1, endDateVal.split('-')[2], 23,59,59);
    const startTs = start.getTime();
    const endTs = end.getTime();
    const nowTs = new Date().getTime();

    const dailyThroughput = {};
    let temp = new Date(start);
    while (temp <= end) { dailyThroughput[toDateKey(temp)] = 0; temp.setDate(temp.getDate() + 1); }

    const statusCounts = { todo: 0, progress: 0, done: 0 };
    const priorityCounts = { high: 0, medium: 0, low: 0, none: 0 };
    let doneInPeriod = 0;
    let leadTimeTotal = 0;
    let cycleTimeTotal = 0;
    let cycleCount = 0;

    const allTasks = Object.values(data.tasks);
    const filteredTasks = allTasks.filter(t => {
        if (selectedLabels.size > 0 && (!t.labels || !t.labels.some(lid => selectedLabels.has(lid)))) return false;
        const created = parseDate(t.createdAt);
        const completed = parseDate(t.completedDate);
        if (!created) return false;
        
        const isRelevant = created.getTime() <= endTs && (!completed || completed.getTime() >= startTs);
        if (!isRelevant) return false;

        priorityCounts[t.priority || 'none']++;
        let status = 'todo';
        let isInProgress = false;
        for (const cid in data.columns) {
            if (data.columns[cid].taskIds.includes(t.id)) {
                if (cid === 'c2') { status = 'progress'; isInProgress = true; }
                if (cid === 'c3') status = 'done';
                break;
            }
        }
        if (t.archived && completed) status = 'done';
        statusCounts[status]++;

        // Current Cycle Time (Age in Progress)
        if (isInProgress) {
            const lastUpdated = parseDate(t.updatedAt) || created;
            cycleTimeTotal += (nowTs - lastUpdated.getTime());
            cycleCount++;
        }

        // Throughput & Lead Time
        if (completed && completed.getTime() >= startTs && completed.getTime() <= endTs) {
            doneInPeriod++;
            const key = toDateKey(completed);
            if (dailyThroughput[key] !== undefined) dailyThroughput[key]++;
            leadTimeTotal += (completed.getTime() - created.getTime());
        }
        return true;
    });

    const total = filteredTasks.length;
    const compRate = total > 0 ? Math.round((statusCounts.done / total) * 100) : 0;
    
    // Average Lead Time (Days)
    const avgLead = doneInPeriod > 0 ? (leadTimeTotal / doneInPeriod / (1000 * 60 * 60 * 24)).toFixed(1) : "0.0";
    
    // Average Cycle Time (Days or Hours)
    let avgCycleStr = "0.0";
    if (cycleCount > 0) {
        const avgMs = cycleTimeTotal / cycleCount;
        const avgDays = avgMs / (1000 * 60 * 60 * 24);
        if (avgDays < 0.1) {
            const avgHours = avgMs / (1000 * 60 * 60);
            avgCycleStr = `${avgHours.toFixed(1)}h`;
        } else {
            avgCycleStr = avgDays.toFixed(1);
        }
    }

    // Est. Completion
    const daysInPeriod = Math.max(1, Math.round((endTs - startTs) / (1000 * 60 * 60 * 24)));
    const pace = doneInPeriod / daysInPeriod; 
    let estFinishStr = "--";
    const remaining = statusCounts.todo + statusCounts.progress;
    if (pace > 0 && remaining > 0) {
        const finishDate = new Date();
        finishDate.setDate(finishDate.getDate() + (remaining / pace));
        estFinishStr = finishDate.toLocaleDateString(State.language === 'ja' ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric' });
    } else if (remaining === 0 && total > 0) {
        estFinishStr = "Done";
    }

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completion-rate').textContent = `${compRate}%`;
    document.getElementById('avg-days').textContent = avgLead;
    document.getElementById('cycle-time').textContent = avgCycleStr;
    document.getElementById('est-finish').textContent = estFinishStr;
    document.getElementById('done-tasks').textContent = doneInPeriod;

    renderStatusChart(statusCounts);
    renderPriorityChart(priorityCounts);
    renderThroughputChart(dailyThroughput);
}

function renderThroughputChart(dataMap) {
    const ctx = document.getElementById('throughputChart').getContext('2d');
    if (throughputChart) throughputChart.destroy();
    const labels = Object.keys(dataMap).map(d => {
        const p = d.split('-').map(Number);
        return new Date(p[0], p[1]-1, p[2]).toLocaleDateString(State.language === 'ja' ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric' });
    });
    throughputChart = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: [{ data: Object.values(dataMap), borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#fff' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: State.theme === 'dark' ? '#1e293b' : '#f1f5f9' }, ticks: { stepSize: 1, color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } }, x: { grid: { display: false }, ticks: { color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } } } }
    });
}

function renderStatusChart(counts) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: [Common.t('col_todo'), Common.t('col_progress'), Common.t('col_done')], datasets: [{ data: [counts.todo, counts.progress, counts.done], backgroundColor: ['#E2E8F0', '#3B82F6', '#22C55E'], borderWidth: 0 }] },
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
        data: { labels: labels, datasets: [{ data: values, backgroundColor: ['#FEE2E2', '#FFEDD5', '#DBEAFE', '#F1F5F9'], borderColor: ['#EF4444', '#F97316', '#3B82F6', '#94A3B8'], borderWidth: 2, borderRadius: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { display: false }, ticks: { stepSize: 1, color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } }, x: { grid: { display: false }, ticks: { color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } } }, plugins: { legend: { display: false } } }
    });
}

document.addEventListener('DOMContentLoaded', () => { initMetrics(); lucide.createIcons(); document.getElementById('start-date').addEventListener('change', initMetrics); document.getElementById('end-date').addEventListener('change', initMetrics); });
