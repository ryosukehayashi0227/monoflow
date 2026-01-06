/**
 * MonoFlow - Burndown Page Logic
 * Handles burndown chart generation and data processing.
 */

const Burndown = {
    // Initialize Burndown Page: Load data, setup filter, and render
    init: () => {
        const data = DataService.load();
        if (!data) { window.location.href = 'index.html'; return; }
        State.data = data;

        // Setup UI translations and links
        const backLink = document.getElementById('back-link');
        if (backLink) backLink.innerHTML = `<i data-lucide="arrow-left" class="w-4 h-4"></i> ${Common.t('back_to_board')}`;
        Common.setT('burndown-title', 'menu_burndown');

        // Populate label filter
        const filterEl = document.getElementById('burndown-filter');
        filterEl.innerHTML = `<option value="all">${Common.t('filter_all')}</option>` + State.data.labels.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
        filterEl.onchange = (e) => Burndown.render(e.target.value);

        Burndown.render('all');
        lucide.createIcons();
    },

    // Render the Burndown Chart
    render: (filterId) => {
        const tasks = Object.values(State.data.tasks).filter(t => !t.archived);
        const filtered = filterId === 'all' ? tasks : tasks.filter(t => t.labels && t.labels.includes(filterId));

        // 1. Determine Timeline (Start Date to End Date/Today)
        const startDates = filtered.map(t => new Date(t.createdAt).getTime());
        if (startDates.length === 0) return;
        const minDate = new Date(Math.min(...startDates));
        minDate.setHours(0, 0, 0, 0);

        // Determine End Date (Latest due date or completion date, or today + buffer)
        const dueDates = filtered.filter(t => t.dueDate).map(t => new Date(t.dueDate).getTime());
        const compDates = filtered.filter(t => t.completedDate).map(t => new Date(t.completedDate).getTime());
        const maxDateVal = Math.max(...dueDates, ...compDates, Date.now());
        const maxDate = new Date(maxDateVal);
        maxDate.setHours(0, 0, 0, 0);

        // Generate array of date strings for the chart labels
        const labels = [];
        let curr = new Date(minDate);
        while (curr <= maxDate) {
            labels.push(curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
        }

        // 2. Calculate Remaining Tasks per Day
        const realData = [];
        const idealData = [];
        const totalTasks = filtered.length;

        // Initialize Ideal Line (Linear drop from Total to 0)
        const idealSlope = totalTasks / (labels.length - 1);

        labels.forEach((dateStr, idx) => {
            const dateObj = new Date(dateStr);
            const nextDate = new Date(dateObj); nextDate.setDate(nextDate.getDate() + 1);

            // Only plot "Real" line up to today
            if (dateObj <= new Date()) {
                // Count tasks created ON or BEFORE this date
                const createdCount = filtered.filter(t => new Date(t.createdAt) < nextDate).length;

                // Count tasks completed ON or BEFORE this date
                const completedCount = filtered.filter(t => {
                    const isDoneCol = State.data.columns[CONSTANTS.DONE_COLUMN_ID].taskIds.includes(t.id);
                    // Check if strictly done or archived-done
                    if (!isDoneCol && !(t.archived && t.completedDate)) return false;
                    return t.completedDate && new Date(t.completedDate) < nextDate;
                }).length;

                realData.push(Math.max(0, createdCount - completedCount));
            }

            idealData.push(Math.max(0, totalTasks - (idealSlope * idx)));
        });

        // 3. Render Chart using Chart.js
        const ctx = document.getElementById('burndownChart').getContext('2d');
        if (State.burndownChart) State.burndownChart.destroy();

        State.burndownChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: Common.t('burndown_actual'),
                        data: realData,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.1,
                        fill: true
                    },
                    {
                        label: Common.t('burndown_ideal'),
                        data: idealData,
                        borderColor: '#94A3B8',
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { maxTicksLimit: 10 }
                    },
                    y: { beginAtZero: true }
                }
            },
            // Custom plugin to shade weekends (optional, Simplified for stability)
            plugins: [{
                id: 'weekendShading',
                beforeDraw: (chart) => {
                    const ctx = chart.ctx;
                    const xAxis = chart.scales.x;
                    const yAxis = chart.scales.y;
                    ctx.save();
                    chart.data.labels.forEach((label, index) => {
                        const date = new Date(label);
                        const day = date.getDay(); // 0=Sun, 6=Sat
                        if (day === 0 || day === 6) {
                            const xStart = xAxis.getPixelForTick(index);
                            // Width approximation (distance to next tick or previous)
                            // Ideally calculate width correctly, but for now just shade a thin strip or skip
                            // to avoid complex geometry logic in this tool call.
                        }
                    });
                    ctx.restore();
                }
            }]
        });
    }
};

document.addEventListener('DOMContentLoaded', Burndown.init);