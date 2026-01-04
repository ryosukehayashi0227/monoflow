/**
 * MonoFlow Metrics Logic - Standardized Insights
 */

function loadData() { return DataService.load(); }

function translateUI() {
    const t = (id, key) => Common.setT(id, key);
    const a = (id, attr, key) => Common.setAttr(id, attr, key);
    t('brand-title', 'metrics_title'); t('brand-subtitle', 'metrics_subtitle');
    t('nav-board', 'menu_board'); t('nav-metrics', 'menu_metrics'); t('nav-burndown', 'menu_burndown');
    t('about-link', 'about_link');
    t('notify-title', 'notify_title');
    t('metrics-period-label', 'metrics_period');
    t('metrics-label-label', 'filter_label');
    t('throughput-title', 'metrics_throughput');
    t('footer-text', 'help_footer');
    t('menu-board-text', 'menu_board'); t('menu-metrics-text', 'menu_metrics'); t('menu-burndown-text', 'menu_burndown'); t('menu-about-text', 'menu_about');
    a('help-btn', 'title', 'menu_help');
    a('lang-btn', 'title', 'switch_lang');
    a('theme-btn', 'title', 'toggle_theme');

    const cards = document.querySelectorAll('.stat-card');
    if (cards.length >= 6) {
        cards[0].querySelector('.stat-label').textContent = Common.t('metrics_total');
        cards[1].querySelector('.stat-label').textContent = Common.t('metrics_rate');
        cards[2].querySelector('.stat-label').textContent = Common.t('metrics_avg');
        cards[3].querySelector('.stat-label').textContent = Common.t('metrics_cycle_time');
        cards[4].querySelector('.stat-label').textContent = Common.t('metrics_est_finish');
        cards[5].querySelector('.stat-label').textContent = Common.t('metrics_done');
    }
    const h2s = document.querySelectorAll('h2');
    if (h2s.length >= 3) {
        h2s[1].innerHTML = `<i data-lucide="pie-chart" class="w-4 h-4"></i> ${Common.t('metrics_dist')}`;
        h2s[2].innerHTML = `<i data-lucide="bar-chart-3" class="w-4 h-4"></i> ${Common.t('metrics_prio_dist')}`;
    }
}

let statusChart, priorityChart, throughputChart;
let selectedLabels = new Set();

function toggleLabelMenu(e) { e.stopPropagation(); const m = document.getElementById('settings-menu'); if(m) m.classList.toggle('hidden'); }
function clearLabels() { selectedLabels.clear(); initMetrics(); }

function renderLabelList(data) {
    const c = document.getElementById('metrics-label-chips');
    const d = document.getElementById('selected-label-count');
    if (!data || !c) return;
    d.textContent = selectedLabels.size > 0 ? `${selectedLabels.size}` : Common.t('filter_all');
    c.innerHTML = '';
    data.labels.forEach(l => {
        const active = selectedLabels.has(l.id);
        const item = document.createElement('button');
        item.className = `w-full flex items-center gap-3 p-2 rounded-xl transition-all ${active ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50/50'}`;
        item.innerHTML = `<div class="w-4 h-4 rounded-full border flex items-center justify-center ${active ? CONSTANTS.COLORS[l.color] : 'border-slate-200 bg-white dark:bg-slate-700'}">${active ? '<i data-lucide="check" class="w-2.5 h-2.5"></i>' : ''}</div><span class="text-sm font-semibold ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500'}">${l.name}</span>`;
        item.onclick = () => { if (active) selectedLabels.delete(l.id); else selectedLabels.add(l.id); initMetrics(); };
        c.appendChild(item);
    });
    lucide.createIcons();
}

function initMetrics() {
    const data = loadData(); if (!data) return;
    translateUI(); renderLabelList(data);
    let sVal = document.getElementById('start-date').value;
    let eVal = document.getElementById('end-date').value;
    if (!sVal) { const d = new Date(); d.setDate(d.getDate()-14); sVal = Common.toDateKey(d); document.getElementById('start-date').value = sVal; }
    if (!eVal) { eVal = Common.toDateKey(new Date()); document.getElementById('end-date').value = eVal; }
    const startTs = Common.parseDate(sVal).setHours(0,0,0,0);
    const endTs = Common.parseDate(eVal).setHours(23,59,59,999);
    const dailyThroughput = {}; let temp = new Date(startTs);
    while (temp.getTime() <= endTs) { dailyThroughput[Common.toDateKey(temp)] = 0; temp.setDate(temp.getDate()+1); }
    const statusCounts = { todo: 0, progress: 0, done: 0 };
    const priorityCounts = { high: 0, medium: 0, low: 0, none: 0 };
    let doneInPeriod = 0, leadTimeTotal = 0, cycleTimeTotal = 0, cycleCount = 0;
    const tasks = Object.values(data.tasks).filter(t => {
        if (selectedLabels.size > 0 && (!t.labels || !t.labels.some(lid => selectedLabels.has(lid)))) return false;
        const created = Common.parseDate(t.createdAt); const completed = Common.parseDate(t.completedDate);
        if (!created || created.getTime() > endTs || (completed && completed.getTime() < startTs)) return false;
        priorityCounts[t.priority || 'none']++;
        let status = 'todo'; let isInProgress = false;
        for (const cid in data.columns) { if (data.columns[cid].taskIds.includes(t.id)) { if (cid === 'c2') { status = 'progress'; isInProgress = true; } if (cid === 'c3') status = 'done'; break; } }
        if (t.archived && completed) status = 'done';
        statusCounts[status]++;
        if (isInProgress) { const upd = Common.parseDate(t.updatedAt) || created; cycleTimeTotal += (new Date().getTime() - upd.getTime()); cycleCount++; }
        if (completed && completed.getTime() >= startTs && completed.getTime() <= endTs) {
            doneInPeriod++; dailyThroughput[Common.toDateKey(completed)]++;
            leadTimeTotal += (completed.getTime() - created.getTime());
        }
        return true;
    });
    const total = tasks.length;
    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completion-rate').textContent = `${total ? Math.round((statusCounts.done/total)*100) : 0}%`;
    const leadVal = doneInPeriod ? (leadTimeTotal/doneInPeriod/(86400000)).toFixed(1) : "0.0";
    document.getElementById('avg-days').textContent = `${leadVal} ${Common.t('unit_days')}`;
    
    let avgCycleStr = `0.0 ${Common.t('unit_days')}`; 
    if (cycleCount) { 
        const d = cycleTimeTotal/cycleCount/86400000; 
        avgCycleStr = d < 0.1 ? `${(d*24).toFixed(1)} ${Common.t('unit_hours')}` : `${d.toFixed(1)} ${Common.t('unit_days')}`; 
    }
    document.getElementById('cycle-time').textContent = avgCycleStr;
    const pace = doneInPeriod / Math.max(1, Math.round((endTs-startTs)/86400000));
    const remaining = statusCounts.todo + statusCounts.progress;
    let est = "--"; if (pace > 0 && remaining > 0) { const f = new Date(); f.setDate(f.getDate() + (remaining/pace)); est = f.toLocaleDateString(State.language === 'ja' ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric' }); } else if (remaining === 0 && total > 0) est = "Done";
    document.getElementById('est-finish').textContent = est;
    document.getElementById('done-tasks').textContent = doneInPeriod;
    renderStatusChart(statusCounts); renderPriorityChart(priorityCounts); renderThroughputChart(dailyThroughput);
}

function renderThroughputChart(dataMap) {
    const ctx = document.getElementById('throughputChart').getContext('2d'); if (throughputChart) throughputChart.destroy();
    throughputChart = new Chart(ctx, { type: 'line', data: { labels: Object.keys(dataMap).map(d => Common.parseDate(d).toLocaleDateString(State.language === 'ja' ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric' })), datasets: [{ data: Object.values(dataMap), borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: State.theme === 'dark' ? '#1e293b' : '#f1f5f9' }, ticks: { stepSize: 1, color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } }, x: { grid: { display: false }, ticks: { color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } } } } });
}

function renderStatusChart(counts) {
    const ctx = document.getElementById('statusChart').getContext('2d'); if (statusChart) statusChart.destroy();
    statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: [Common.t('col_todo'), Common.t('col_progress'), Common.t('col_done')], datasets: [{ data: [counts.todo, counts.progress, counts.done], backgroundColor: ['#E2E8F0', '#3B82F6', '#22C55E'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold', family: 'Inter' }, color: State.theme === 'dark' ? '#cbd5e1' : '#64748b' } } } } });
}

function renderPriorityChart(counts) {
    const ctx = document.getElementById('priorityChart').getContext('2d'); if (priorityChart) priorityChart.destroy();
    priorityChart = new Chart(ctx, { type: 'bar', data: { labels: CONSTANTS.PRIORITIES.map(p => p.label[State.language]), datasets: [{ data: CONSTANTS.PRIORITIES.map(p => counts[p.value] || 0), backgroundColor: ['#FEE2E2', '#FFEDD5', '#DBEAFE', '#F1F5F9'], borderColor: ['#EF4444', '#F97316', '#3B82F6', '#94A3B8'], borderWidth: 2, borderRadius: 8 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { display: false }, ticks: { stepSize: 1, color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } }, x: { grid: { display: false }, ticks: { color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } } }, plugins: { legend: { display: false } } } });
}

document.addEventListener('DOMContentLoaded', () => { initMetrics(); lucide.createIcons(); document.getElementById('start-date').addEventListener('change', initMetrics); document.getElementById('end-date').addEventListener('change', initMetrics); });
