/**
 * MonoFlow Metrics Logic with Date & Multi-Label Popover Filter
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

// --- UI Interaction for Label Menu ---
const labelMenu = document.getElementById('metrics-label-menu');
function toggleLabelMenu(e) {
    e.stopPropagation();
    labelMenu.classList.toggle('hidden');
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

    // Update count display
    countDisplay.textContent = selectedLabels.size > 0 ? `${selectedLabels.size}` : Common.t('filter_all');

    container.innerHTML = '';
    data.labels.forEach(l => {
        const isActive = selectedLabels.has(l.id);
        const colorClass = COLORS[l.color] || COLORS.blue;
        
        const item = document.createElement('button');
        item.className = `w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isActive ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50/50'}`;
        
        item.innerHTML = `
            <div class="w-4 h-4 rounded-full border flex items-center justify-center ${isActive ? colorClass : 'border-slate-200 bg-white dark:bg-slate-700 dark:border-slate-600'}">
                ${isActive ? '<i data-lucide="check" class="w-2.5 h-2.5"></i>' : ''}
            </div>
            <span class="text-sm font-semibold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}">${l.name}</span>
        `;
        
        item.onclick = () => {
            if (isActive) selectedLabels.delete(l.id);
            else selectedLabels.add(l.id);
            initMetrics(); // Refresh data
        };
        
        container.appendChild(item);
    });
    lucide.createIcons();
}

function translateUI() {
    // Page Title & Subtitle
    document.querySelector('h1').textContent = Common.t('metrics_title');
    document.querySelector('h1 + p').textContent = Common.t('metrics_subtitle');
    
    // Labels in Filter
    document.querySelector('.text-slate-300').previousElementSibling.previousElementSibling.textContent = Common.t('metrics_period');
    document.querySelector('#metrics-label-menu span').textContent = Common.t('metrics_label_select');
    document.querySelector('#metrics-label-menu button').textContent = Common.t('metrics_clear');
    document.querySelector('a[href="index.html"] span').textContent = Common.t('back_to_app');
    
    // Stat Cards
    const cards = document.querySelectorAll('.stat-card');
    cards[0].querySelector('.stat-label').textContent = Common.t('metrics_total');
    cards[1].querySelector('.stat-label').textContent = Common.t('metrics_rate');
    cards[2].querySelector('.stat-label').textContent = Common.t('metrics_avg');
    cards[3].querySelector('.stat-label').textContent = Common.t('metrics_done');
    
    // Chart Titles
    const h2s = document.querySelectorAll('h2');
    h2s[0].innerHTML = `<i data-lucide="pie-chart" class="w-4 h-4"></i> ${Common.t('metrics_dist')}`;
    h2s[1].innerHTML = `<i data-lucide="bar-chart-3" class="w-4 h-4"></i> ${Common.t('metrics_prio_dist')}`;
}

function initMetrics() {
    const data = loadData();
    if (!data) return;

    translateUI();
    renderLabelList(data);

    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
    const end = endDate ? new Date(endDate).setHours(23,59,59,999) : null;

    const allTasks = Object.values(data.tasks);
    const filteredTasks = allTasks.filter(t => {
        let datePass = true;
        if (start || end) {
            const created = new Date(t.createdAt).getTime();
            const completed = t.completedDate ? new Date(t.completedDate.replace(/-/g, '/')).getTime() : null;
            if (start && end) {
                datePass = (created >= start && created <= end) || (completed && completed >= start && completed <= end);
            } else if (start) {
                datePass = created >= start || (completed && completed >= start);
            } else if (end) {
                datePass = created <= end || (completed && completed <= end);
            }
        }

        let labelPass = true;
        if (selectedLabels.size > 0) {
            labelPass = t.labels && t.labels.some(lid => selectedLabels.has(lid));
        }

        return datePass && labelPass;
    });

    // Stats
    const statusCounts = { todo: 0, progress: 0, done: 0 };
    filteredTasks.forEach(t => {
        for (const colId in data.columns) {
            if (data.columns[colId].taskIds.includes(t.id)) {
                if (colId === 'c1') statusCounts.todo++;
                else if (colId === 'c2') statusCounts.progress++;
                else if (colId === 'c3') statusCounts.done++;
                break;
            }
        }
    });

    const priorityCounts = { high: 0, medium: 0, low: 0, none: 0 };
    filteredTasks.forEach(t => priorityCounts[t.priority || 'none']++);

    const total = filteredTasks.length;
    const doneTasks = statusCounts.done;
    const completionRate = total > 0 ? Math.round((doneTasks / total) * 100) : 0;

    let totalLeadTime = 0;
    let timedTasksCount = 0;
    filteredTasks.forEach(t => {
        if (t.completedDate && t.createdAt) {
            const s = new Date(t.createdAt);
            const e = new Date(t.completedDate.replace(/-/g, '/'));
            if (!isNaN(s) && !isNaN(e)) {
                totalLeadTime += (e - s);
                timedTasksCount++;
            }
        }
    });
    const avgDays = timedTasksCount > 0 
        ? (totalLeadTime / timedTasksCount / (1000 * 60 * 60 * 24)).toFixed(1) 
        : "0.0";

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    document.getElementById('avg-days').textContent = avgDays;
    document.getElementById('done-tasks').textContent = doneTasks;

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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold', family: 'Inter' }, color: State.theme === 'dark' ? '#cbd5e1' : '#64748b' } }
            }
        }
    });
}

function renderPriorityChart(counts) {
    const ctx = document.getElementById('priorityChart').getContext('2d');
    if (priorityChart) priorityChart.destroy();
    
    const labels = CONSTANTS.PRIORITIES.map(p => p.label[State.language]);
    const values = CONSTANTS.PRIORITIES.map(p => counts[p.value]);

    priorityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: Common.t('metrics_total'),
                data: values,
                backgroundColor: ['#FEE2E2', '#FFEDD5', '#DBEAFE', '#F1F5F9'],
                borderColor: ['#EF4444', '#F97316', '#3B82F6', '#94A3B8'],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { display: false }, ticks: { stepSize: 1, color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } },
                x: { grid: { display: false }, ticks: { color: State.theme === 'dark' ? '#94a3b8' : '#64748b' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMetrics();
    lucide.createIcons();
    document.getElementById('start-date').addEventListener('change', initMetrics);
    document.getElementById('end-date').addEventListener('change', initMetrics);
});