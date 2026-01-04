/**
 * MonoFlow Burndown Chart - Pro Analytics Edition
 */

const STORAGE_KEY = 'monoflow-v10-refactored';
let burndownChart = null;
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
function clearLabels() {
    selectedLabels.clear();
    initBurndown();
}

function renderLabelList(data) {
    const container = document.getElementById('burndown-label-chips');
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
        item.onclick = () => { if (isActive) selectedLabels.delete(l.id); else selectedLabels.add(l.id); initBurndown(); };
        container.appendChild(item);
    });
    lucide.createIcons();
}

function translateUI() {
    const titleEl = document.querySelector('h1');
    if (titleEl) titleEl.textContent = Common.t('burndown_title');
    
    const subtitle = document.querySelector('h1 + p');
    if (subtitle) subtitle.textContent = Common.t('burndown_subtitle');
    
    const periodLabel = document.getElementById('burndown-period-label');
    if (periodLabel) periodLabel.textContent = Common.t('burndown_period');

    const deadlineLabel = document.getElementById('burndown-deadline-label');
    if (deadlineLabel) deadlineLabel.textContent = Common.t('burndown_deadline');

    const labelLabel = document.getElementById('burndown-label-label');
    if (labelLabel) labelLabel.textContent = Common.t('filter_label');

    const trendLabel = document.getElementById('burndown-trend-label');
    if (trendLabel) trendLabel.textContent = Common.t('burndown_trend');

    const menuTitle = document.getElementById('burndown-label-select-title');
    if (menuTitle) menuTitle.textContent = Common.t('metrics_label_select');

    const aboutLink = document.getElementById('about-link');
    if (aboutLink) aboutLink.textContent = Common.t('about_link');
}

function initBurndown() {
    const data = loadData();
    if (!data) return;

    translateUI();
    renderLabelList(data);

    let startDateVal = document.getElementById('start-date').value;
    let endDateVal = document.getElementById('end-date').value;
    const targetDeadlineVal = document.getElementById('target-deadline').value;

    if (!startDateVal) {
        const d = new Date(); d.setDate(d.getDate() - 14);
        startDateVal = toDateKey(d);
        document.getElementById('start-date').value = startDateVal;
    }
    if (!endDateVal) {
        endDateVal = toDateKey(new Date());
        document.getElementById('end-date').value = endDateVal;
    }

    const start = parseDate(startDateVal);
    const end = parseDate(endDateVal);
    const targetDeadline = parseDate(targetDeadlineVal);
    if (!start || !end) return;

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const labels = [];
    const dateArray = [];
    let current = new Date(start);
    const locale = State.language === 'ja' ? 'ja-JP' : 'en-US';
    
    while (current <= end) {
        labels.push(current.toLocaleDateString(locale, { month: 'short', day: 'numeric' }));
        dateArray.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    const tasks = Object.values(data.tasks).filter(t => {
        if (selectedLabels.size > 0 && (!t.labels || !t.labels.some(lid => selectedLabels.has(lid)))) return false;
        return true;
    });

    const burndownData = [];
    const scopeAddedData = [];
    const scopeDoneData = [];

    dateArray.forEach(day => {
        const dayStart = day.getTime();
        const dayEnd = dayStart + (24 * 60 * 60 * 1000) - 1;

        // Current Remaining
        const remaining = tasks.filter(t => {
            const created = parseDate(t.createdAt);
            const completed = parseDate(t.completedDate);
            if (!created || created.getTime() > dayEnd) return false;
            if (completed && completed.getTime() <= dayEnd) return false;
            if (t.archived && !t.completedDate) return false;
            return true;
        }).length;
        burndownData.push(remaining);

        // Daily Delta
        const added = tasks.filter(t => {
            const created = parseDate(t.createdAt);
            return created && created.getTime() >= dayStart && created.getTime() <= dayEnd;
        }).length;
        scopeAddedData.push(added);

        const done = tasks.filter(t => {
            const completed = parseDate(t.completedDate);
            return completed && completed.getTime() >= dayStart && completed.getTime() <= dayEnd;
        }).length;
        scopeDoneData.push(done);
    });

    // Forecast Calculation
    const forecastData = [...burndownData];
    const last14DaysDone = tasks.filter(t => {
        const completed = parseDate(t.completedDate);
        const twoWeeksAgo = new Date().getTime() - (14 * 24 * 60 * 60 * 1000);
        return completed && completed.getTime() >= twoWeeksAgo;
    }).length;
    const dailyVelocity = last14DaysDone / 14;

    // Extend line into the future labels if needed? 
    // For now, let's just mark the current count.
    const activeCountEl = document.getElementById('active-task-count');
    if (activeCountEl) {
        const currentCount = burndownData[burndownData.length - 1];
        activeCountEl.textContent = `${Common.t('burndown_current')}: ${currentCount}`;
    }

    renderChart(labels, burndownData, scopeAddedData, scopeDoneData, targetDeadline, dateArray, dailyVelocity);
}

// Custom plugin for weekend shading
const weekendPlugin = {
    id: 'weekendShading',
    beforeDraw: (chart) => {
        const { ctx, chartArea: { top, bottom, left, right }, scales: { x, y } } = chart;
        const dateArray = chart.config._dateArray;
        if (!dateArray) return;

        ctx.save();
        ctx.fillStyle = State.theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
        
        dateArray.forEach((date, i) => {
            const day = date.getDay();
            if (day === 0 || day === 6) { // 0=Sun, 6=Sat
                const xPos = x.getPixelForValue(i);
                const width = x.width / (dateArray.length - 1);
                ctx.fillRect(xPos - width/2, top, width, bottom - top);
            }
        });
        ctx.restore();
    }
};

function renderChart(labels, burndown, added, done, deadline, dateArray, velocity) {
    const ctx = document.getElementById('burndownChart').getContext('2d');
    if (burndownChart) burndownChart.destroy();

    const idealData = [];
    const startVal = burndown[0] || 0;
    const steps = burndown.length - 1;
    for (let i = 0; i <= steps; i++) {
        idealData.push(Math.max(0, startVal - (startVal / steps) * i));
    }

    // Forecast line
    const forecastData = new Array(burndown.length).fill(null);
    forecastData[burndown.length - 1] = burndown[burndown.length - 1];
    // We don't have future labels in the current view, but we could add them if we wanted.
    // For now, let's keep the focus on current window.

    const textColor = State.theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = State.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    burndownChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'line',
                    label: Common.t('burndown_actual'),
                    data: burndown,
                    borderColor: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    zIndex: 10
                },
                {
                    type: 'line',
                    label: Common.t('burndown_ideal'),
                    data: idealData,
                    borderColor: State.theme === 'dark' ? '#475569' : '#CBD5E1',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: Common.t('burndown_scope_add'),
                    data: added,
                    backgroundColor: 'rgba(249, 115, 22, 0.4)',
                    borderRadius: 4,
                    yAxisID: 'yDelta'
                },
                {
                    label: Common.t('burndown_scope_done'),
                    data: done.map(v => -v),
                    backgroundColor: 'rgba(34, 197, 94, 0.4)',
                    borderRadius: 4,
                    yAxisID: 'yDelta'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            _dateArray: dateArray,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, font: { weight: 'bold', family: 'Inter' }, color: textColor } },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            label += Math.abs(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: Common.t('metrics_tasks_left'), color: textColor },
                    grid: { color: gridColor }, 
                    ticks: { stepSize: 1, color: textColor } 
                },
                yDelta: {
                    position: 'right',
                    grid: { display: false },
                    title: { display: true, text: 'Daily Delta', color: textColor },
                    ticks: { color: textColor, callback: (v) => Math.abs(v) }
                },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        },
        plugins: [weekendPlugin, {
            id: 'deadlineLine',
            afterDraw: (chart) => {
                if (!deadline) return;
                const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
                const deadlineIdx = dateArray.findIndex(d => toDateKey(d) === toDateKey(deadline));
                if (deadlineIdx === -1) return;

                const xPos = x.getPixelForValue(deadlineIdx);
                ctx.save();
                ctx.beginPath();
                ctx.setLineDash([5, 5]);
                ctx.moveTo(xPos, top);
                ctx.lineTo(xPos, bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#F97316';
                ctx.stroke();
                
                ctx.fillStyle = '#F97316';
                ctx.font = 'bold 10px Inter';
                ctx.fillText(Common.t('burndown_deadline'), xPos + 5, top + 15);
                ctx.restore();
            }
        }]
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initBurndown();
    lucide.createIcons();
    document.getElementById('start-date').addEventListener('change', initBurndown);
    document.getElementById('end-date').addEventListener('change', initBurndown);
    document.getElementById('target-deadline').addEventListener('change', initBurndown);
});