/**
 * MonoFlow - Metrics Page Logic
 * Handles data visualization for task statistics.
 */

const Metrics = {
    // Initialize Metrics Page: Load data, set up UI, render charts
    init: () => {
        const data = DataService.load();
        if (!data) { window.location.href = 'index.html'; return; }
        State.data = data;

        // Setup UI translations and event listeners
        const backLink = document.getElementById('back-link');
        if (backLink) backLink.innerHTML = `<i data-lucide="arrow-left" class="w-4 h-4"></i> ${Common.t('back_to_board')}`;
        Common.setT('metrics-title', 'menu_metrics');
        Common.setT('label-status-dist', 'status_distribution');
        Common.setT('label-priority-dist', 'priority_distribution');
        Common.setT('label-throughput', 'throughput_history');

        // Filter Setup
        const filterEl = document.getElementById('metrics-filter');
        filterEl.innerHTML = `<option value="all">${Common.t('filter_all')}</option>` + State.data.labels.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
        filterEl.onchange = (e) => Metrics.render(e.target.value);

        Metrics.render('all');
        lucide.createIcons();
    },

    // Calculate and rendering all statistics based on current filter
    render: (filterId) => {
        const tasks = Object.values(State.data.tasks).filter(t => !t.archived);
        const filtered = filterId === 'all' ? tasks : tasks.filter(t => t.labels && t.labels.includes(filterId));

        const total = filtered.length;
        const done = filtered.filter(t => State.data.columns[CONSTANTS.DONE_COLUMN_ID].taskIds.includes(t.id)).length;
        const inProgress = filtered.filter(t => State.data.columns['c2'].taskIds.includes(t.id)).length;
        const todo = filtered.filter(t => State.data.columns['c1'].taskIds.includes(t.id)).length;

        // KPI Cards
        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completion-rate').textContent = total ? Math.round((done / total) * 100) + '%' : '0%';

        // Calculate Lead Time (Created -> Done)
        const doneTasks = filtered.filter(t => State.data.columns[CONSTANTS.DONE_COLUMN_ID].taskIds.includes(t.id) && t.completedDate);
        let avgLeadTime = 0;
        if (doneTasks.length > 0) {
            const totalLead = doneTasks.reduce((acc, t) => acc + (new Date(t.completedDate) - new Date(t.createdAt)), 0);
            avgLeadTime = Math.round(totalLead / doneTasks.length / (1000 * 60 * 60 * 24));
        }
        document.getElementById('avg-lead-time').textContent = avgLeadTime + ' ' + Common.t('days_suffix');

        // Estimate completion based on simple velocity (avg tasks done per day)
        const velocity = Metrics.calculateVelocity(doneTasks);
        const remaining = total - done;
        const daysLeft = velocity > 0 ? Math.ceil(remaining / velocity) : 0;
        const estDate = daysLeft > 0 ? new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString() : '---';
        document.getElementById('est-completion').textContent = estDate;

        Metrics.renderCharts(todo, inProgress, done, filtered);
    },

    // Helper: Calculate daily completion rate (velocity)
    calculateVelocity: (doneTasks) => {
        if (doneTasks.length === 0) return 0;
        // Group by date
        const counts = {};
        doneTasks.forEach(t => {
            const date = t.completedDate.split('T')[0];
            counts[date] = (counts[date] || 0) + 1;
        });
        const days = Object.keys(counts).length;
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        return days > 0 ? total / days : 0;
    },

    // Render Chart.js instances
    renderCharts: (todo, inProgress, done, tasks) => {
        // Status Distribution Doughnut Chart
        const ctx1 = document.getElementById('statusChart').getContext('2d');
        if (State.statusChart) State.statusChart.destroy();
        State.statusChart = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: [Common.t('col_todo'), Common.t('col_progress'), Common.t('col_done')],
                datasets: [{
                    data: [todo, inProgress, done],
                    backgroundColor: ['#E2E8F0', '#3B82F6', '#22C55E']
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });

        // Priority Distribution Bar Chart
        const high = tasks.filter(t => t.priority === 'high').length;
        const med = tasks.filter(t => t.priority === 'medium').length;
        const low = tasks.filter(t => t.priority === 'low').length;
        const none = tasks.filter(t => t.priority === 'none').length;
        const ctx2 = document.getElementById('priorityChart').getContext('2d');
        if (State.priorityChart) State.priorityChart.destroy();
        State.priorityChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: [Common.t('p_high'), Common.t('p_medium'), Common.t('p_low'), Common.t('p_none')],
                datasets: [{
                    label: Common.t('task_count'),
                    data: [high, med, low, none],
                    backgroundColor: ['#EF4444', '#F97316', '#3B82F6', '#94A3B8']
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                plugins: { legend: { display: false } }
            }
        });

        // Throughput History Line Chart (Last 7 Days)
        const ctx3 = document.getElementById('throughputChart').getContext('2d');
        if (State.throughputChart) State.throughputChart.destroy();
        const labels = []; const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split('T')[0];
            labels.push(ds);
            data.push(tasks.filter(t => t.completedDate && t.completedDate.startsWith(ds)).length);
        }
        State.throughputChart = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: Common.t('tasks_completed'),
                    data: data,
                    borderColor: '#22C55E',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(34, 197, 94, 0.1)'
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                plugins: { legend: { display: false } }
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', Metrics.init);
