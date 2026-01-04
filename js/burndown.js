/**
 * MonoFlow Burndown Calculation Logic with Localization
 */

const STORAGE_KEY = 'monoflow-v10-refactored';
let burndownChart = null;

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
}

function translateUI() {
    document.querySelector('h1').textContent = Common.t('burndown_title');
    document.querySelector('h1 + p').textContent = Common.t('burndown_subtitle');
    document.querySelector('.text-slate-300').previousElementSibling.previousElementSibling.textContent = Common.t('burndown_period');
    document.querySelector('h2').innerHTML = `<i data-lucide="line-chart" class="w-4 h-4"></i> ${Common.t('burndown_trend')}`;
    document.querySelector('a[href="index.html"] span').textContent = Common.t('back_to_app');
}

function initBurndown() {
    const data = loadData();
    if (!data) return;

    translateUI();

    // 1. Get Date Range
    let startDateVal = document.getElementById('start-date').value;
    let endDateVal = document.getElementById('end-date').value;

    if (!startDateVal) {
        const d = new Date();
        d.setDate(d.getDate() - 14);
        startDateVal = d.toISOString().split('T')[0];
        document.getElementById('start-date').value = startDateVal;
    }
    if (!endDateVal) {
        endDateVal = new Date().toISOString().split('T')[0];
        document.getElementById('end-date').value = endDateVal;
    }

    const start = new Date(startDateVal);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDateVal);
    end.setHours(23, 59, 59, 999);

    // 2. Generate Daily Labels
    const labels = [];
    const dateArray = [];
    let current = new Date(start);
    const locale = State.language === 'ja' ? 'ja-JP' : 'en-US';
    while (current <= end) {
        labels.push(current.toLocaleDateString(locale, { month: 'short', day: 'numeric' }));
        dateArray.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    // 3. Calculate Remaining Tasks per Day
    const tasks = Object.values(data.tasks);
    const burndownData = dateArray.map(day => {
        const dayEnd = new Date(day).setHours(23, 59, 59, 999);
        return tasks.filter(t => {
            const created = new Date(t.createdAt).getTime();
            if (created > dayEnd) return false;
            if (t.completedDate) {
                const completed = new Date(t.completedDate.replace(/-/g, '/')).getTime();
                if (completed <= dayEnd) return false;
            }
            return true;
        }).length;
    });

    // Update Current count
    document.getElementById('active-task-count').textContent = `${Common.t('burndown_current')}: ${burndownData[burndownData.length - 1]}`;

    renderChart(labels, burndownData);
}

function renderChart(labels, dataPoints) {
    const ctx = document.getElementById('burndownChart').getContext('2d');
    if (burndownChart) burndownChart.destroy();

    const idealData = [];
    const startVal = dataPoints[0];
    const steps = dataPoints.length - 1;
    for (let i = 0; i <= steps; i++) {
        idealData.push(startVal - (startVal / steps) * i);
    }

    const textColor = State.theme === 'dark' ? '#94a3b8' : '#64748b';

    burndownChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: Common.t('burndown_actual'),
                    data: dataPoints,
                    borderColor: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 3
                },
                {
                    label: Common.t('burndown_ideal'),
                    data: idealData,
                    borderColor: '#E2E8F0',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false,
                    tension: 0,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, font: { weight: 'bold', family: 'Inter' }, color: textColor } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: State.theme === 'dark' ? '#1e293b' : '#F1F5F9' }, ticks: { stepSize: 1, font: { family: 'Inter' }, color: textColor } },
                x: { grid: { display: false }, ticks: { font: { family: 'Inter' }, color: textColor } }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initBurndown();
    lucide.createIcons();
    document.getElementById('start-date').addEventListener('change', initBurndown);
    document.getElementById('end-date').addEventListener('change', initBurndown);
});