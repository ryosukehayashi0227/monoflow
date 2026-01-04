/**
 * MonoFlow Burndown Calculation Logic
 */

const STORAGE_KEY = 'monoflow-v10-refactored';
let burndownChart = null;

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
}

function initBurndown() {
    const data = loadData();
    if (!data) return;

    // 1. Get Date Range
    let startDateVal = document.getElementById('start-date').value;
    let endDateVal = document.getElementById('end-date').value;

    if (!startDateVal) {
        // Default to 14 days ago
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
    while (current <= end) {
        labels.push(current.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }));
        dateArray.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    // 3. Calculate Remaining Tasks per Day
    const tasks = Object.values(data.tasks);
    const burndownData = dateArray.map(day => {
        const dayEnd = new Date(day).setHours(23, 59, 59, 999);
        
        // Count tasks that existed on this day and were not yet completed
        return tasks.filter(t => {
            const created = new Date(t.createdAt).getTime();
            // Exist on this day?
            if (created > dayEnd) return false;
            
            // Completed by this day?
            if (t.completedDate) {
                const completed = new Date(t.completedDate.replace(/-/g, '/')).getTime();
                if (completed <= dayEnd) return false;
            }
            
            return true;
        }).length;
    });

    // Update Current count
    document.getElementById('active-task-count').textContent = `現在: ${burndownData[burndownData.length - 1]} タスク`;

    renderChart(labels, burndownData);
}

function renderChart(labels, dataPoints) {
    const ctx = document.getElementById('burndownChart').getContext('2d');
    if (burndownChart) burndownChart.destroy();

    // Ideal Line (Starts at same point as real data, ends at 0)
    const idealData = [];
    const startVal = dataPoints[0];
    const steps = dataPoints.length - 1;
    for (let i = 0; i <= steps; i++) {
        idealData.push(startVal - (startVal / steps) * i);
    }

    burndownChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '実際の残りタスク',
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
                    label: '理想的な進捗',
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
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, font: { weight: 'bold', family: 'Inter' } } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { stepSize: 1, font: { family: 'Inter' } } },
                x: { grid: { display: false }, ticks: { font: { family: 'Inter' } } }
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
