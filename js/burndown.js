/**
 * MonoFlow Burndown Calculation Logic - Robust Date Handling
 */

const STORAGE_KEY = 'monoflow-v10-refactored';
let burndownChart = null;

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
}

// Robust date parser to handle various formats
function parseDate(dateStr) {
    if (!dateStr) return null;
    // Replace - with / for better cross-browser parsing if needed, 
    // but ISO strings (with T) should usually be fine.
    const d = new Date(dateStr); 
    return isNaN(d.getTime()) ? null : d;
}

function translateUI() {
    const titleEl = document.querySelector('h1');
    if (titleEl) titleEl.textContent = Common.t('burndown_title');
    const subtitle = document.querySelector('h1 + p');
    if (subtitle) subtitle.textContent = Common.t('burndown_subtitle');
    
    const periodLabel = document.getElementById('burndown-period-label');
    if (periodLabel) periodLabel.textContent = Common.t('burndown_period');
    
    const trendTitle = document.querySelector('h2');
    if (trendTitle) trendTitle.innerHTML = `<i data-lucide="line-chart" class="w-4 h-4"></i> ${Common.t('burndown_trend')}`;
    
    const backLink = document.querySelector('a[href="index.html"] span');
    if (backLink) backLink.textContent = Common.t('back_to_app');
    
    const aboutLink = document.getElementById('about-link');
    if (aboutLink) aboutLink.textContent = Common.t('about_link');
}

function initBurndown() {
    const data = loadData();
    if (!data) return;

    translateUI();

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

    const start = parseDate(startDateVal);
    const end = parseDate(endDateVal);
    if (!start || !end) return;

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const labels = [];
    const dateArray = [];
    let current = new Date(start);
    const locale = State.language === 'ja' ? 'ja-JP' : 'en-US';
    
    // Safety break to prevent infinite loops if dates are somehow messed up
    let safetyCounter = 0;
    while (current <= end && safetyCounter < 1000) {
        labels.push(current.toLocaleDateString(locale, { month: 'short', day: 'numeric' }));
        dateArray.push(new Date(current));
        current.setDate(current.getDate() + 1);
        safetyCounter++;
    }

    const tasks = Object.values(data.tasks);
    const burndownData = dateArray.map(day => {
        const dayEnd = day.getTime() + (24 * 60 * 60 * 1000) - 1;
        return tasks.filter(t => {
            const created = parseDate(t.createdAt);
            if (!created || created.getTime() > dayEnd) return false;

            if (t.completedDate) {
                const completed = parseDate(t.completedDate);
                if (completed && completed.getTime() <= dayEnd) return false;
            }
            
            if (t.archived && !t.completedDate) return false;

            return true;
        }).length;
    });

    const activeCountEl = document.getElementById('active-task-count');
    if (activeCountEl && burndownData.length > 0) {
        const currentCount = burndownData[burndownData.length - 1];
        activeCountEl.textContent = `${Common.t('burndown_current')}: ${currentCount}`;
    }

    renderChart(labels, burndownData);
}

function renderChart(labels, dataPoints) {
    const ctx = document.getElementById('burndownChart').getContext('2d');
    if (burndownChart) burndownChart.destroy();

    const idealData = [];
    const startVal = dataPoints[0] || 0;
    const steps = dataPoints.length - 1;
    for (let i = 0; i <= steps; i++) {
        if (steps === 0) idealData.push(startVal);
        else idealData.push(Math.max(0, startVal - (startVal / steps) * i));
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
                    borderColor: State.theme === 'dark' ? '#334155' : '#E2E8F0',
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
    const sDate = document.getElementById('start-date');
    const eDate = document.getElementById('end-date');
    if(sDate) sDate.addEventListener('change', initBurndown);
    if(eDate) eDate.addEventListener('change', initBurndown);
});
