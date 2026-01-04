/**
 * MonoFlow Burndown Chart - Pro Analytics Edition
 */

function loadData() { return DataService.load(); }

function translateUI() {
    const t = (id, key) => Common.setT(id, key);
    const a = (id, attr, key) => Common.setAttr(id, attr, key);
    t('brand-title', 'burndown_title'); t('brand-subtitle', 'burndown_subtitle');
    t('nav-board', 'menu_board'); t('nav-metrics', 'menu_metrics'); t('nav-burndown', 'menu_burndown');
    t('about-link', 'about_link');
    t('notify-title', 'notify_title');
    t('burndown-period-label', 'burndown_period');
    t('burndown-deadline-label', 'burndown_deadline');
    t('burndown-label-label', 'filter_label');
    t('burndown-trend-label', 'burndown_trend');
    t('burndown-label-select-title', 'metrics_label_select');
    t('footer-text', 'help_footer');
    t('menu-board-text', 'menu_board'); t('menu-metrics-text', 'menu_metrics'); t('menu-burndown-text', 'menu_burndown'); t('menu-about-text', 'menu_about');
    a('help-btn', 'title', 'menu_help');
    a('lang-btn', 'title', 'switch_lang');
    a('theme-btn', 'title', 'toggle_theme');
}

let burndownChart = null;
let selectedLabels = new Set();

function clearLabels() { selectedLabels.clear(); initBurndown(); }

function renderLabelList(data) {
    const c = document.getElementById('burndown-label-chips');
    const d = document.getElementById('selected-label-count');
    if (!data || !c) return;
    d.textContent = selectedLabels.size > 0 ? `${selectedLabels.size}` : Common.t('filter_all');
    c.innerHTML = '';
    data.labels.forEach(l => {
        const active = selectedLabels.has(l.id);
        const item = document.createElement('button');
        item.className = `w-full flex items-center gap-3 p-2 rounded-xl transition-all ${active ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50/50'}`;
        item.innerHTML = `<div class="w-4 h-4 rounded-full border flex items-center justify-center ${active ? CONSTANTS.COLORS[l.color] : 'border-slate-200 bg-white dark:bg-slate-700'}">${active ? '<i data-lucide="check" class="w-2.5 h-2.5"></i>' : ''}</div><span class="text-sm font-semibold ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500'}">${l.name}</span>`;
        item.onclick = () => { if (active) selectedLabels.delete(l.id); else selectedLabels.add(l.id); initBurndown(); };
        c.appendChild(item);
    });
    lucide.createIcons();
}

function initBurndown() {
    const data = loadData(); if (!data) return;
    translateUI(); renderLabelList(data);
    let sVal = document.getElementById('start-date').value;
    let eVal = document.getElementById('end-date').value;
    const tDeadVal = document.getElementById('target-deadline').value;
    if (!sVal) { const d = new Date(); d.setDate(d.getDate()-14); sVal = Common.toDateKey(d); document.getElementById('start-date').value = sVal; }
    if (!eVal) { eVal = Common.toDateKey(new Date()); document.getElementById('end-date').value = eVal; }
    const start = Common.parseDate(sVal); const end = Common.parseDate(eVal); const tDead = Common.parseDate(tDeadVal);
    if (!start || !end) return;
    start.setHours(0,0,0,0); end.setHours(23,59,59,999);
    const labels = []; const dateArray = []; let curr = new Date(start);
    const locale = State.language === 'ja' ? 'ja-JP' : 'en-US';
    while (curr <= end) { labels.push(curr.toLocaleDateString(locale, { month: 'short', day: 'numeric' })); dateArray.push(new Date(curr)); curr.setDate(curr.getDate()+1); }
    const tasks = Object.values(data.tasks).filter(t => selectedLabels.size === 0 || (t.labels && t.labels.some(lid => selectedLabels.has(lid))));
    const burndown = []; const added = []; const done = [];
    dateArray.forEach(day => {
        const dStart = day.getTime(); const dEnd = dStart + 86400000 - 1;
        burndown.push(tasks.filter(t => {
            const c = Common.parseDate(t.createdAt); const d = Common.parseDate(t.completedDate);
            return c && c.getTime() <= dEnd && (!d || d.getTime() > dEnd) && (!t.archived || t.completedDate);
        }).length);
        added.push(tasks.filter(t => { const c = Common.parseDate(t.createdAt); return c && c.getTime() >= dStart && c.getTime() <= dEnd; }).length);
        done.push(tasks.filter(t => { const d = Common.parseDate(t.completedDate); return d && d.getTime() >= dStart && d.getTime() <= dEnd; }).length);
    });
    const activeEl = document.getElementById('active-task-count');
    if (activeEl) activeEl.textContent = `${Common.t('burndown_current')}: ${burndown[burndown.length-1]}`;
    renderChart(labels, burndown, added, done, tDead, dateArray);
}

const weekendPlugin = {
    id: 'weekendShading',
    beforeDraw: (chart) => {
        const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
        const dateArray = chart.config._dateArray; if (!dateArray) return;
        ctx.save(); ctx.fillStyle = State.theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
        dateArray.forEach((date, i) => { if (date.getDay() === 0 || date.getDay() === 6) { const xPos = x.getPixelForValue(i); const w = x.width / (dateArray.length - 1); ctx.fillRect(xPos - w/2, top, w, bottom - top); } });
        ctx.restore();
    }
};

function renderChart(labels, burndown, added, done, deadline, dateArray) {
    const ctx = document.getElementById('burndownChart').getContext('2d'); if (burndownChart) burndownChart.destroy();
    const ideal = []; const startVal = burndown[0] || 0; const steps = burndown.length - 1;
    for (let i = 0; i <= steps; i++) ideal.push(Math.max(0, startVal - (startVal/steps) * i));
    const textColor = State.theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = State.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    burndownChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { type: 'line', label: Common.t('burndown_actual'), data: burndown, borderColor: '#2563EB', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderWidth: 4, fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#fff', zIndex: 10 },
                { type: 'line', label: Common.t('burndown_ideal'), data: ideal, borderColor: State.theme === 'dark' ? '#475569' : '#CBD5E1', borderDash: [5, 5], borderWidth: 2, fill: false, pointRadius: 0 },
                { label: Common.t('burndown_scope_add'), data: added, backgroundColor: 'rgba(249, 115, 22, 0.4)', borderRadius: 4, yAxisID: 'yDelta' },
                { label: Common.t('burndown_scope_done'), data: done.map(v => -v), backgroundColor: 'rgba(34, 197, 94, 0.4)', borderRadius: 4, yAxisID: 'yDelta' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, _dateArray: dateArray, interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, font: { weight: 'bold', family: 'Inter' }, color: textColor } },
                tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${Math.abs(ctx.parsed.y)}` } }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: Common.t('metrics_tasks_left'), color: textColor }, grid: { color: gridColor }, ticks: { stepSize: 1, color: textColor } },
                yDelta: { position: 'right', grid: { display: false }, title: { display: true, text: 'Daily Delta', color: textColor }, ticks: { color: textColor, callback: (v) => Math.abs(v) } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        },
        plugins: [weekendPlugin, {
            id: 'deadlineLine',
            afterDraw: (chart) => {
                if (!deadline) return;
                const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
                const idx = dateArray.findIndex(d => Common.toDateKey(d) === Common.toDateKey(deadline));
                if (idx === -1) return;
                const xPos = x.getPixelForValue(idx);
                ctx.save(); ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.moveTo(xPos, top); ctx.lineTo(xPos, bottom); ctx.lineWidth = 2; ctx.strokeStyle = '#F97316'; ctx.stroke();
                ctx.fillStyle = '#F97316'; ctx.font = 'bold 10px Inter'; ctx.fillText(Common.t('burndown_deadline'), xPos + 5, top + 15); ctx.restore();
            }
        }]
    });
}

document.addEventListener('DOMContentLoaded', () => { initBurndown(); lucide.createIcons(); document.getElementById('start-date').addEventListener('change', initBurndown); document.getElementById('end-date').addEventListener('change', initBurndown); document.getElementById('target-deadline').addEventListener('change', initBurndown); });