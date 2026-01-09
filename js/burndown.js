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
        if (filterEl) {
            filterEl.innerHTML = `<option value="all">${Common.t('filter_all')}</option>` + State.data.labels.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
            filterEl.onchange = (e) => Burndown.render(e.target.value);
        }

        // Expose global function for header refresh button
        window.initBurndown = () => location.reload();

        Burndown.render('all');
        lucide.createIcons();
    },

    // Render the Burndown Chart
    render: (filterId) => {
        const tasks = Object.values(State.data.tasks).filter(t => !t.archived);
        const filtered = filterId === 'all' ? tasks : tasks.filter(t => t.labels && t.labels.includes(filterId));

        if (filtered.length === 0) return;

        // 1. Determine Timeline (Start Date to End Date/Today)
        // Robustly parse dates, ignoring invalid ones
        const startDates = filtered
            .map(t => t.createdAt ? new Date(t.createdAt).getTime() : NaN)
            .filter(d => !isNaN(d));

        if (startDates.length === 0) return;

        const minDate = new Date(Math.min(...startDates));
        minDate.setHours(0, 0, 0, 0);

        // Determine End Date (Latest due date or completion date, or today + buffer)
        const dueDates = filtered.map(t => t.dueDate ? new Date(t.dueDate).getTime() : NaN).filter(d => !isNaN(d));
        const compDates = filtered.map(t => t.completedDate ? new Date(t.completedDate).getTime() : NaN).filter(d => !isNaN(d));

        const maxDateVal = Math.max(...dueDates, ...compDates, Date.now());
        const maxDate = new Date(maxDateVal);
        maxDate.setHours(0, 0, 0, 0);

        // Limit range to prevent massive loop if data is weird (e.g. 1970)
        // If start date is too old (more than 1 year ago), clamp it for visualization unless user wants otherwise
        const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (minDate < oneYearAgo) {
            minDate.setTime(oneYearAgo.getTime());
        }

        // Generate array of date strings for the chart labels
        const labels = [];
        let curr = new Date(minDate);
        // Safety break to prevent infinite loops
        let iterations = 0;
        while (curr <= maxDate && iterations < 1000) {
            labels.push(curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
            iterations++;
        }

        // 2. Calculate Remaining Tasks per Day
        const realData = [];
        const idealData = [];
        const totalTasks = filtered.length;

        // Initialize Ideal Line (Linear drop from Total to 0)
        const idealSlope = labels.length > 1 ? totalTasks / (labels.length - 1) : 0;

        labels.forEach((dateStr, idx) => {
            const dateObj = new Date(dateStr);
            const nextDate = new Date(dateObj); nextDate.setDate(nextDate.getDate() + 1);

            // Only plot "Real" line up to today
            // Use current time comparison for "today", but allow end-of-day inclusion
            const isFuture = dateObj > new Date();

            // For the chart, we want to show the state at the END of that day.
            // If the day is in the past or today, we calculate.
            if (!isFuture || dateStr === new Date().toISOString().split('T')[0]) {
                // Count tasks created ON or BEFORE this date
                const createdCount = filtered.filter(t => {
                    if (!t.createdAt) return false;
                    return new Date(t.createdAt) < nextDate;
                }).length;

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
        const ctxEl = document.getElementById('burndownChart');
        if (!ctxEl) return;
        const ctx = ctxEl.getContext('2d');

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
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', Burndown.init);