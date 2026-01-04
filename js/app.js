/**
 * ==========================================================================================
 *  MonoFlow - Core Application Logic
 * ==========================================================================================
 */

// --- 1. Constants & Config ---
const CONSTANTS = {
    STORAGE_KEY: 'monoflow-v10-refactored',
    LANG_KEY: 'monoflow-lang',
    DONE_COLUMN_ID: 'c3',
    COLORS: {
        red: 'bg-red-100 text-red-700 border-red-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    PRIORITIES: [
        { value: 'high', label: { ja: '高', en: 'High' }, icon: 'chevrons-up', style: 'text-red-600 bg-red-50 border-red-200' },
        { value: 'medium', label: { ja: '中', en: 'Med' }, icon: 'minus', style: 'text-orange-600 bg-orange-50 border-orange-200' },
        { value: 'low', label: { ja: '低', en: 'Low' }, icon: 'chevrons-down', style: 'text-blue-600 bg-blue-50 border-blue-200' },
        { value: 'none', label: { ja: '指定なし', en: 'None' }, icon: '', style: 'text-slate-600 bg-slate-100 border-slate-300' }
    ],
    I18N: {
        ja: {
            app_desc: 'Simple Personal Kanban',
            filter_label: 'ラベル',
            filter_all: 'すべてのラベル',
            add_placeholder: '新しいタスクを入力...',
            add_btn: '追加',
            menu_export: 'エクスポート (JSON)',
            menu_import: 'インポート',
            menu_metrics: 'Metrics',
            menu_burndown: 'Burndown',
            menu_help: 'User Guide',
            menu_reset: 'ボードのリセット',
            modal_title: 'タスク詳細',
            modal_label_title: 'タイトル',
            modal_label_priority: '優先度',
            modal_label_tags: 'ラベル',
            modal_label_new_tag: '新しいラベル名',
            modal_label_parent: '親タスク',
            modal_label_none: '(なし)',
            modal_label_desc: '詳細メモ',
            modal_label_date: '期限',
            modal_btn_cancel: 'キャンセル',
            modal_btn_save: '保存',
            col_todo: '未着手',
            col_progress: '進行中',
            col_done: '完了',
            task_created: '作成',
            task_updated: '更新',
            task_completed: '完了',
            confirm_delete: 'タスクを削除しますか？',
            confirm_reset_1: '【警告】すべてのタスクを完全に削除しますか？\nこの操作は取り消せません。',
            confirm_reset_2: '本当に削除しますか？\n削除前に「エクスポート」してバックアップを取っておくことをお勧めします。',
            reset_done: 'ボードをリセットしました。',
            import_done: 'インポートが完了しました。',
            import_fail: 'インポートに失敗しました。',
            welcome_title: 'MonoFlowへようこそ',
            welcome_desc: 'これはサンプルタスクです。'
        },
        en: {
            app_desc: 'Simple Personal Kanban',
            filter_label: 'Label',
            filter_all: 'All Labels',
            add_placeholder: 'Add a new task...',
            add_btn: 'Add',
            menu_export: 'Export (JSON)',
            menu_import: 'Import',
            menu_metrics: 'Metrics',
            menu_burndown: 'Burndown',
            menu_help: 'User Guide',
            menu_reset: 'Reset Board',
            modal_title: 'Task Details',
            modal_label_title: 'Title',
            modal_label_priority: 'Priority',
            modal_label_tags: 'Labels',
            modal_label_new_tag: 'New Label Name',
            modal_label_parent: 'Parent Task',
            modal_label_none: '(None)',
            modal_label_desc: 'Notes',
            modal_label_date: 'Due Date',
            modal_btn_cancel: 'Cancel',
            modal_btn_save: 'Save',
            col_todo: 'To Do',
            col_progress: 'In Progress',
            col_done: 'Done',
            task_created: 'Created',
            task_updated: 'Updated',
            task_completed: 'Done',
            confirm_delete: 'Delete this task?',
            confirm_reset_1: '[WARNING] Are you sure you want to delete ALL tasks?\nThis cannot be undone.',
            confirm_reset_2: 'Are you absolutely sure?\nWe strongly recommend exporting a backup first.',
            reset_done: 'Board has been reset.',
            import_done: 'Import successful.',
            import_fail: 'Import failed.',
            welcome_title: 'Welcome to MonoFlow',
            welcome_desc: 'This is a sample task.'
        }
    }
};

// --- 2. State Management ---
const State = {
    data: null,
    filter: 'all',
    language: 'ja',
    tempLabels: []
};

// --- 3. Data Service ---
const DataService = {
    init: () => {
        State.language = localStorage.getItem(CONSTANTS.LANG_KEY) || (navigator.language.startsWith('ja') ? 'ja' : 'en');
        const saved = localStorage.getItem(CONSTANTS.STORAGE_KEY);
        if (saved) {
            State.data = JSON.parse(saved);
        } else {
            State.data = {
                tasks: {
                    't1': { id: 't1', content: App.t('welcome_title'), description: App.t('welcome_desc'), dueDate: '', parentId: null, labels: [], priority: 'high', updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
                },
                columns: { 'c1': { id: 'c1', title: 'To Do', taskIds: ['t1'] }, 'c2': { id: 'c2', title: 'In Progress', taskIds: [] }, 'c3': { id: 'c3', title: 'Done', taskIds: [] } },
                columnOrder: ['c1', 'c2', 'c3'],
                labels: [{ id: 'l1', name: 'Priority', color: 'red' }, { id: 'l2', name: 'Work', color: 'blue' }]
            };
        }
        DataService.ensureIntegrity();
    },
    save: () => localStorage.setItem(CONSTANTS.STORAGE_KEY, JSON.stringify(State.data)),
    setLanguage: (lang) => {
        State.language = lang;
        localStorage.setItem(CONSTANTS.LANG_KEY, lang);
        App.render();
    },
    ensureIntegrity: () => {
        const allInCols = new Set(Object.values(State.data.columns).flatMap(c => c.taskIds));
        Object.keys(State.data.tasks).forEach(id => { if (!allInCols.has(id)) State.data.columns['c1'].taskIds.push(id); });
        DataService.save();
    },
    deleteTask: (taskId, colId) => {
        if(!confirm(App.t('confirm_delete'))) return;
        State.data.columns[colId].taskIds = State.data.columns[colId].taskIds.filter(id => id !== taskId);
        delete State.data.tasks[taskId];
        Object.values(State.data.tasks).forEach(t => { if(t.parentId === taskId) t.parentId = null; });
        DataService.save(); App.render();
    },
    resetAll: () => {
        if (!confirm(App.t('confirm_reset_1'))) return;
        if (!confirm(App.t('confirm_reset_2'))) return;
        State.data.tasks = {};
        for (const colId in State.data.columns) State.data.columns[colId].taskIds = [];
        DataService.save(); App.render();
        alert(App.t('reset_done'));
    },
    export: () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(State.data, null, 2)], { type: "application/json" }));
        a.download = `monoflow-backup.json`; a.click();
    },
    import: (input) => {
        const file = input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                State.data = JSON.parse(e.target.result);
                DataService.save(); App.render(); alert(App.t('import_done'));
            } catch(err) { alert(App.t('import_fail')); }
            input.value = '';
        };
        reader.readAsText(file);
    }
};

// --- 4. Label Manager ---
const LabelManager = {
    create: () => {
        const nameInput = document.getElementById('new-label-name');
        const name = nameInput.value.trim(); if(!name) return;
        const colorRadio = document.querySelector('input[name="label-color":checked');
        const color = colorRadio ? colorRadio.value : 'blue';
        State.data.labels.push({ id: `l-${Date.now()}`, name, color });
        DataService.save(); nameInput.value = ''; Modal.renderLabels();
    },
    delete: (id) => {
        if(!confirm(App.t('confirm_delete'))) return;
        State.data.labels = State.data.labels.filter(l => l.id !== id);
        Object.values(State.data.tasks).forEach(t => { if(t.labels) t.labels = t.labels.filter(lid => lid !== id); });
        State.tempLabels = State.tempLabels.filter(lid => lid !== id);
        DataService.save(); Modal.renderLabels(); App.render();
    }
};

// --- 5. Modal Logic ---
const Modal = {
    elements: {
        overlay: document.getElementById('task-modal'),
        content: document.querySelector('#task-modal .modal-content'),
        id: document.getElementById('edit-task-id'),
        title: document.getElementById('edit-task-content'),
        desc: document.getElementById('edit-task-desc'),
        date: document.getElementById('edit-task-date'),
        parent: document.getElementById('edit-task-parent'),
        labelsContainer: document.getElementById('edit-task-labels')
    },
    init: () => {
        const cContainer = document.getElementById('label-color-picker');
        const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        cContainer.innerHTML = colors.map((c, i) => `<input type="radio" name="label-color" value="${c}" id="c-${c}" class="hidden color-radio" ${i===0?'checked':''}>
            <label for="c-${c}" class="w-5 h-5 rounded-full bg-${c}-500 cursor-pointer block color-label hover:scale-110"></label>`).join('');
    },
    renderStaticUI: () => {
        document.querySelector('#task-modal h3').textContent = App.t('modal_title');
        
        // Target labels by their following input/select/textarea for precision
        const titleLabel = document.querySelector('input#edit-task-content').previousElementSibling;
        if (titleLabel) titleLabel.textContent = App.t('modal_label_title');

        const priorityLabel = document.getElementById('priority-options-container').previousElementSibling;
        if (priorityLabel) priorityLabel.textContent = App.t('modal_label_priority');

        const tagsLabel = document.getElementById('edit-task-labels').parentElement.querySelector('label');
        if (tagsLabel) tagsLabel.textContent = App.t('modal_label_tags');

        const parentLabel = document.querySelector('select#edit-task-parent').parentElement.previousElementSibling;
        if (parentLabel) parentLabel.textContent = App.t('modal_label_parent');

        const notesLabel = document.querySelector('textarea#edit-task-desc').previousElementSibling;
        if (notesLabel) notesLabel.textContent = App.t('modal_label_desc');

        const dateLabel = document.querySelector('input#edit-task-date').previousElementSibling;
        if (dateLabel) dateLabel.textContent = App.t('modal_label_date');

        const btns = Modal.elements.overlay.querySelectorAll('.p-6.border-t button');
        if (btns.length >= 2) {
            btns[0].textContent = App.t('modal_btn_cancel');
            btns[1].textContent = App.t('modal_btn_save');
        }
        
        const pContainer = document.getElementById('priority-options-container');
        pContainer.innerHTML = CONSTANTS.PRIORITIES.map(p => `<label class="cursor-pointer">
            <input type="radio" name="priority" value="${p.value}" class="peer sr-only">
            <div class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 peer-checked:${p.style} text-sm font-bold flex items-center gap-1 transition-all hover:bg-slate-50">
                ${p.icon ? `<i data-lucide="${p.icon}" class="w-4 h-4"></i>` : ''} ${p.label[State.language]}
            </div></label>`).join('');
        lucide.createIcons();
    },
    open: (taskId) => {
        const task = State.data.tasks[taskId]; if (!task) return;
        Modal.renderStaticUI();
        Modal.elements.id.value = taskId; Modal.elements.title.value = task.content; Modal.elements.desc.value = task.description || ''; Modal.elements.date.value = task.dueDate || '';
        document.getElementById('display-created-at').textContent = `${App.t('task_created')}: ${task.createdAt ? UI.formatTime(task.createdAt) : '---'}`;
        document.getElementById('display-updated-at').textContent = `${App.t('task_updated')}: ${task.updatedAt ? UI.formatTime(task.updatedAt) : '---'}`;
        const pRadio = Modal.elements.overlay.querySelector(`input[name="priority"][value="${task.priority || 'none'}"]`); if(pRadio) pRadio.checked = true;
        Modal.elements.parent.innerHTML = `<option value="">${App.t('modal_label_none')}</option>`;
        Object.values(State.data.tasks).forEach(t => { if (t.id !== taskId && !t.parentId) { const opt = document.createElement('option'); opt.value = t.id; opt.textContent = t.content.substring(0, 30); Modal.elements.parent.appendChild(opt); } });
        Modal.elements.parent.value = task.parentId || '';
        State.tempLabels = task.labels ? [...task.labels] : []; Modal.renderLabels();
        Modal.elements.overlay.classList.remove('hidden'); void Modal.elements.overlay.offsetWidth;
        Modal.elements.overlay.classList.remove('opacity-0'); Modal.elements.content.classList.remove('scale-95', 'opacity-0');
        Modal.elements.content.classList.add('scale-100', 'opacity-100'); document.body.classList.add('modal-open');
    },
    close: () => {
        Modal.elements.overlay.classList.add('opacity-0'); Modal.elements.content.classList.remove('scale-100', 'opacity-100');
        Modal.elements.content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => { Modal.elements.overlay.classList.add('hidden'); document.body.classList.remove('modal-open'); }, 250);
    },
    save: () => {
        const id = Modal.elements.id.value; const content = Modal.elements.title.value.trim();
        if (content && State.data.tasks[id]) {
            const t = State.data.tasks[id]; t.content = content; t.description = Modal.elements.desc.value; t.dueDate = Modal.elements.date.value;
            t.labels = State.tempLabels; 
            const pRadio = Modal.elements.overlay.querySelector('input[name="priority":checked');
            t.priority = pRadio ? pRadio.value : 'none'; 
            t.parentId = Modal.elements.parent.value || null;
            t.updatedAt = new Date().toISOString();
            if (t.parentId) Object.values(State.data.tasks).forEach(child => { if (child.parentId === id) child.parentId = null; });
            DataService.save(); App.render(); Modal.close();
        }
    },
    renderLabels: () => {
        const container = Modal.elements.labelsContainer; container.innerHTML = '';
        State.data.labels.forEach(label => {
            const isSelected = State.tempLabels.includes(label.id); const colorClass = CONSTANTS.COLORS[label.color] || CONSTANTS.COLORS.blue;
            const el = document.createElement('div');
            el.className = `flex items-center gap-1 px-2 py-1 rounded-full border cursor-pointer transition-all ${colorClass} ${isSelected ? 'ring-2 ring-slate-400' : 'opacity-60 hover:opacity-100'}`;
            el.innerHTML = `<span class="text-xs font-bold mr-1 select-none">${label.name}</span><button type="button" class="hover:text-red-900"><i data-lucide="x" class="w-3 h-3"></i></button>`;
            el.onclick = (e) => { if (e.target.closest('button')) { e.stopPropagation(); LabelManager.delete(label.id); return; }
                if (isSelected) State.tempLabels = State.tempLabels.filter(id => id !== label.id); else State.tempLabels.push(label.id);
                Modal.renderLabels();
            };
            container.appendChild(el);
        });
        lucide.createIcons();
    }
};

// --- 6. UI Generator ---
const UI = {
    formatTime: (iso) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleString(State.language === 'ja' ? 'ja-JP' : 'en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }); },
    createTaskCard: (task, columnId, visibleTasksContext) => {
        const isDone = columnId === CONSTANTS.DONE_COLUMN_ID; const el = document.createElement('div');
        const hasParent = !!task.parentId && !!State.data.tasks[task.parentId]; const indentClass = hasParent ? 'child-task scale-95 origin-left' : '';
        el.className = `task-card bg-white border border-slate-200 rounded-xl p-4 shadow-sm group relative cursor-pointer ${indentClass} ${isDone ? 'is-done' : ''}`;
        el.dataset.taskId = task.id;
        const pConfig = CONSTANTS.PRIORITIES.find(p => p.value === task.priority);
        const priorityHtml = (pConfig && pConfig.value !== 'none') ? `<div class="flex items-center justify-center w-6 h-6 rounded-md border ${pConfig.style.replace('text-sm font-bold', '')}"><i data-lucide="${pConfig.icon}" class="w-4 h-4"></i></div>` : '';
        const labelsHtml = task.labels && task.labels.length > 0 ? `<div class="flex flex-wrap gap-1.5 mb-2">` + task.labels.map(lid => {
            const l = State.data.labels.find(x => x.id === lid); return l ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${CONSTANTS.COLORS[l.color] || CONSTANTS.COLORS.blue}">${l.name}</span>` : '';
        }).join('') + `</div>` : '';
        let parentIndicator = '';
        if (task.parentId) { const p = State.data.tasks[task.parentId]; if (p) parentIndicator = `<div class="text-[10px] text-blue-500 font-semibold mb-1 flex items-center gap-1"><i data-lucide="corner-down-right" class="w-3 h-3"></i>${p.content.substring(0,15)}...</div>`; } 
        let metaHtml = `<div class="flex items-center gap-3 mt-3">`;
        if (isDone && task.completedDate) metaHtml += `<div class="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md"><i data-lucide="check-circle-2" class="w-3 h-3"></i>${App.t('task_completed')}: ${task.completedDate}</div>`;
        else if (task.dueDate) { const overdue = new Date(task.dueDate) < new Date().setHours(0,0,0,0); const style = overdue ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-500 bg-slate-50 border-slate-100'; metaHtml += `<div class="flex items-center gap-1 text-xs font-medium border px-2 py-1 rounded-md w-fit ${style}"><i data-lucide="clock" class="w-3 h-3"></i>${task.dueDate}</div>`; } 
        if (task.description) metaHtml += `<i data-lucide="align-left" class="w-3 h-3 text-slate-400"></i>`;
        if (task.updatedAt) { metaHtml += `<div class="ml-auto flex flex-col items-end gap-0.5"><div class="text-[9px] text-slate-300 font-medium">${App.t('task_created')}: ${UI.formatTime(task.createdAt)}</div>`;
            if (task.updatedAt !== task.createdAt) metaHtml += `<div class="flex items-center gap-1 text-[9px] text-blue-400 font-bold"><i data-lucide="refresh-cw" class="w-2 h-2"></i>${App.t('task_updated')}: ${UI.formatTime(task.updatedAt)}</div>`;
            metaHtml += `</div>`; } 
        metaHtml += `</div>`;
        el.innerHTML = `${parentIndicator}${labelsHtml}<div class="flex justify-between items-start gap-2"><span class="task-title text-[15px] font-medium text-slate-700 leading-relaxed flex-grow">${task.content}</span><div class="flex flex-col gap-1 items-end">${priorityHtml}<button onclick="event.stopPropagation(); DataService.deleteTask('${task.id}', '${columnId}')" class="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div></div>${metaHtml}`;
        el.onclick = () => Modal.open(task.id); return el;
    },
    createVirtualParent: (parentTask) => {
        const el = document.createElement('div'); let laneName = '???';
        for(const cid in State.data.columns) if(State.data.columns[cid].taskIds.includes(parentTask.id)) { const colKey = cid === 'c1' ? 'col_todo' : (cid === 'c2' ? 'col_progress' : 'col_done'); laneName = App.t(colKey); break; }
        el.className = 'task-card virtual-parent-card rounded-xl p-3 flex flex-col gap-1';
        el.innerHTML = `<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><i data-lucide="link" class="w-3 h-3"></i> ${State.language === 'ja' ? '実体は' : 'In'}「${laneName}」</div><span class="text-sm font-semibold text-slate-400 truncate">${parentTask.content}</span>`;
        return el;
    }
};

// --- 7. Main Controller ---
const App = {
    t: (key) => (CONSTANTS.I18N[State.language] && CONSTANTS.I18N[State.language][key]) || key,
    init: () => {
        DataService.init(); Modal.init();
        document.getElementById('add-task-form').addEventListener('submit', App.handleAddTask);
        document.getElementById('label-filter').addEventListener('change', (e) => { State.filter = e.target.value; App.render(); });
        document.getElementById('task-modal').addEventListener('click', (e) => { if (e.target.id === 'task-modal') Modal.close(); });
        const menu = document.getElementById('settings-menu');
        window.toggleMenu = (e) => { e.stopPropagation(); menu.classList.toggle('hidden'); };
        document.addEventListener('click', () => menu.classList.add('hidden'));
        App.render();
    },
    handleAddTask: (e) => {
        e.preventDefault(); const input = document.getElementById('new-task-input'); const content = input.value.trim();
        if (content) {
            const id = `task-${Date.now()}`; const now = new Date().toISOString();
            State.data.tasks[id] = { id, content, description: '', dueDate: '', parentId: null, labels: [], priority: 'none', createdAt: now, updatedAt: now };
            State.data.columns['c1'].taskIds.unshift(id); DataService.save(); App.render(); input.value = '';
        }
    },
    render: () => {
        const board = document.getElementById('board'); board.innerHTML = '';
        
        // Update Static UI elements based on language
        const appDesc = document.querySelector('header p.text-slate-400');
        if (appDesc) appDesc.textContent = App.t('app_desc');
        
        const taskInput = document.getElementById('new-task-input');
        if (taskInput) taskInput.placeholder = App.t('add_placeholder');
        
        const addBtnSpan = document.querySelector('#add-task-form span');
        if (addBtnSpan) addBtnSpan.textContent = App.t('add_btn');
        
        App.updateFilterDropdown();
        const m = document.getElementById('settings-menu');
        m.children[0].innerHTML = `<i data-lucide="download" class="w-4 h-4 text-slate-400"></i> ${App.t('menu_export')}`;
        m.children[1].innerHTML = `<i data-lucide="upload" class="w-4 h-4 text-slate-400"></i> ${App.t('menu_import')}`;
        m.children[2].innerHTML = `<i data-lucide="bar-chart-2" class="w-4 h-4 text-slate-400"></i> ${App.t('menu_metrics')}`;
        m.children[3].innerHTML = `<i data-lucide="trending-down" class="w-4 h-4 text-slate-400"></i> ${App.t('menu_burndown')}`;
        m.children[4].innerHTML = `<i data-lucide="help-circle" class="w-4 h-4 text-slate-400"></i> ${App.t('menu_help')}`;
        let lBtn = document.getElementById('lang-switch-btn');
        if (!lBtn) { lBtn = document.createElement('button'); lBtn.id = 'lang-switch-btn'; lBtn.className = 'w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-bold text-blue-600 flex items-center gap-2 border-t border-slate-100 transition-colors'; m.insertBefore(lBtn, m.querySelector('.text-red-600')); }
        lBtn.innerHTML = `<i data-lucide="languages" class="w-4 h-4"></i> ${State.language === 'ja' ? 'English' : '日本語'}`;
        lBtn.onclick = () => DataService.setLanguage(State.language === 'ja' ? 'en' : 'ja');
        m.querySelector('.text-red-600').innerHTML = `<i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i> ${App.t('menu_reset')}`;

        State.data.columnOrder.forEach(colId => {
            const col = State.data.columns[colId]; const colTitle = colId === 'c1' ? App.t('col_todo') : (colId === 'c2' ? App.t('col_progress') : App.t('col_done'));
            const colEl = document.createElement('div'); colEl.className = 'bg-slate-200/40 backdrop-blur-md rounded-[2rem] p-6 flex flex-col border border-white/20 shadow-inner h-full min-h-[500px]';
            colEl.innerHTML = `<div class="flex justify-between items-center mb-6 px-2"><h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">${colTitle}</h2><span class="bg-white/80 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full shadow-sm border border-slate-100">${col.taskIds.length}</span></div>`;
            const listEl = document.createElement('div'); listEl.className = 'task-list space-y-3 pb-20 flex-grow min-h-[200px]'; listEl.dataset.columnId = colId;
            const visible = col.taskIds.map(id => State.data.tasks[id]).filter(Boolean).filter(t => State.filter === 'all' || (t.labels && t.labels.includes(State.filter)));
            const renderItems = []; const processed = new Set();
            const roots = visible.filter(t => !t.parentId || !visible.some(pt => pt.id === t.parentId));
            roots.forEach(root => {
                if (processed.has(root.id)) return;
                if (root.parentId) { const pTask = State.data.tasks[root.parentId]; if (pTask && (!renderItems.length || renderItems[renderItems.length-1].task?.id !== pTask.id)) renderItems.push({ type: 'virtual', task: pTask }); } 
                renderItems.push({ type: 'real', task: root }); processed.add(root.id);
                visible.filter(c => c.parentId === root.id).forEach(child => { renderItems.push({ type: 'real', task: child }); processed.add(child.id); });
            });
            visible.forEach(t => { if (!processed.has(t.id)) renderItems.push({ type: 'real', task: t }); });
            renderItems.forEach(item => listEl.appendChild(item.type === 'virtual' ? UI.createVirtualParent(item.task) : UI.createTaskCard(item.task, colId, visible)));
            colEl.appendChild(listEl); board.appendChild(colEl);
        });
        lucide.createIcons(); App.initDragAndDrop();
    },
    updateFilterDropdown: () => {
        const s = document.getElementById('label-filter'); s.innerHTML = `<option value="all">${App.t('filter_all')}</option>`;
        State.data.labels.forEach(l => { const opt = document.createElement('option'); opt.value = l.id; opt.textContent = l.name; if(l.id === State.filter) opt.selected = true; s.appendChild(opt); });
    },
    initDragAndDrop: () => {
        if (State.filter !== 'all') return;
        document.querySelectorAll('.task-list').forEach(list => {
            new Sortable(list, { group: 'tasks', animation: 250, ghostClass: 'ghost-card', onEnd: (evt) => {
                const { item, to, from } = evt; if (item.classList.contains('virtual-parent-card')) return;
                const taskId = item.dataset.taskId; const toCol = to.dataset.columnId; const fromCol = from.dataset.columnId;
                State.data.columns[fromCol].taskIds = State.data.columns[fromCol].taskIds.filter(id => id !== taskId);
                const newTaskIds = []; Array.from(to.children).forEach(child => { if (!child.classList.contains('virtual-parent-card') && child.dataset.taskId) newTaskIds.push(child.dataset.taskId); });
                State.data.columns[toCol].taskIds = newTaskIds;
                const task = State.data.tasks[taskId];
                if (toCol === CONSTANTS.DONE_COLUMN_ID) { if (!task.completedDate) { const now = new Date(); task.completedDate = `${now.toLocaleDateString(State.language === 'ja' ? 'ja-JP' : 'en-US', {year:'numeric',month:'2-digit',day:'2-digit'}).replaceAll('/','-')} ${now.toLocaleTimeString(State.language === 'ja' ? 'ja-JP' : 'en-US', {hour:'2-digit',minute:'2-digit'})}`; } } else task.completedDate = null;
                task.updatedAt = new Date().toISOString(); DataService.save(); App.render();
            }});
        });
    }
};
App.init();