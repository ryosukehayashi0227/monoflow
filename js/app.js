/**
 * ==========================================================================================
 *  Monoflow - Core Application Logic
 *  Organized into Modules: Constants, State, DataService, UI, LabelManager, Modal, Main
 * ==========================================================================================
 */

// --- 1. Constants & Config ---
const CONSTANTS = {
    STORAGE_KEY: 'monoflow-v10-refactored',
    DONE_COLUMN_ID: 'c3',
    COLORS: {
        red: 'bg-red-100 text-red-700 border-red-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    PRIORITIES: [
        { value: 'high', label: '高', icon: 'chevrons-up', style: 'text-red-600 bg-red-50 border-red-200' },
        { value: 'medium', label: '中', icon: 'minus', style: 'text-orange-600 bg-orange-50 border-orange-200' },
        { value: 'low', label: '低', icon: 'chevrons-down', style: 'text-blue-600 bg-blue-50 border-blue-200' },
        { value: 'none', label: '指定なし', icon: '', style: 'text-slate-600 bg-slate-100 border-slate-300' }
    ]
};

// --- 2. State Management ---
const State = {
    data: null,
    filter: 'all',
    tempLabels: [] // Labels selected in modal
};

// --- 3. Data Service ---
const DataService = {
    init: () => {
        const initialData = {
            tasks: {
                't1': { id: 't1', content: 'Monoflowへようこそ', description: 'これはサンプルタスクです。', dueDate: '', parentId: null, labels: [], priority: 'high' },
            },
            columns: {
                'c1': { id: 'c1', title: 'To Do', taskIds: ['t1'] },
                'c2': { id: 'c2', title: 'In Progress', taskIds: [] },
                'c3': { id: 'c3', title: 'Done', taskIds: [] },
            },
            columnOrder: ['c1', 'c2', 'c3'],
            labels: [
                { id: 'l1', name: 'Priority', color: 'red' },
                { id: 'l2', name: 'Work', color: 'blue' }
            ]
        };
        const saved = localStorage.getItem(CONSTANTS.STORAGE_KEY);
        State.data = saved ? JSON.parse(saved) : initialData;
        DataService.ensureIntegrity();
    },

    save: () => {
        localStorage.setItem(CONSTANTS.STORAGE_KEY, JSON.stringify(State.data));
    },

    ensureIntegrity: () => {
        // Recover orphans
        const allTaskIds = new Set(Object.values(State.data.columns).flatMap(c => c.taskIds));
        Object.keys(State.data.tasks).forEach(id => {
            if (!allTaskIds.has(id)) {
                State.data.columns['c1'].taskIds.push(id);
            }
        });
        DataService.save();
    },

    deleteTask: (taskId, colId) => {
        if(!confirm('タスクを削除しますか？')) return;
        State.data.columns[colId].taskIds = State.data.columns[colId].taskIds.filter(id => id !== taskId);
        delete State.data.tasks[taskId];
        // Reset parentId for children
        Object.values(State.data.tasks).forEach(t => { if(t.parentId === taskId) t.parentId = null; });
        DataService.save();
        App.render();
    },

    export: () => {
        const blob = new Blob([JSON.stringify(State.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monoflow-backup-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    },

    import: (input) => {
        const file = input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if(confirm("現在のデータはすべて上書きされます。よろしいですか？")) {
                    State.data = imported;
                    DataService.save();
                    App.render();
                }
            } catch(err) { alert("ファイルの読み込みに失敗しました。"); }
            input.value = '';
        };
        reader.readAsText(file);
    }
};

// --- 4. Label Manager ---
const LabelManager = {
    create: () => {
        const nameInput = document.getElementById('new-label-name');
        const name = nameInput.value.trim();
        if(!name) return;
        const color = document.querySelector('input[name="label-color"]:checked')?.value || 'blue';
        State.data.labels.push({ id: `l-${Date.now()}`, name, color });
        DataService.save();
        nameInput.value = '';
        Modal.renderLabels();
    },
    delete: (id) => {
        if(!confirm('ラベルを削除しますか？')) return;
        State.data.labels = State.data.labels.filter(l => l.id !== id);
        Object.values(State.data.tasks).forEach(t => { 
            if(t.labels) t.labels = t.labels.filter(lid => lid !== id); 
        });
        State.tempLabels = State.tempLabels.filter(lid => lid !== id);
        DataService.save();
        Modal.renderLabels();
        App.render();
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
        // Generate Priority Options
        const pContainer = document.getElementById('priority-options-container');
        pContainer.innerHTML = CONSTANTS.PRIORITIES.map(p => `
            <label class="cursor-pointer">
                <input type="radio" name="priority" value="${p.value}" class="peer sr-only">
                <div class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 peer-checked:${p.style} text-sm font-bold flex items-center gap-1 transition-all hover:bg-slate-50">
                    ${p.icon ? `<i data-lucide="${p.icon}" class="w-4 h-4"></i>` : ''} ${p.label}
                </div>
            </label>
        `).join('');

        // Generate Color Picker
        const cContainer = document.getElementById('label-color-picker');
        const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        cContainer.innerHTML = colors.map((c, i) => `
            <input type="radio" name="label-color" value="${c}" id="c-${c}" class="hidden color-radio" ${i===0?'checked':''}>
            <label for="c-${c}" class="w-5 h-5 rounded-full bg-${c}-500 cursor-pointer block color-label hover:scale-110"></label>
        `).join('');
    },

    open: (taskId) => {
        const task = State.data.tasks[taskId];
        if (!task) return;

        const { elements } = Modal;
        elements.id.value = task.id;
        elements.title.value = task.content;
        elements.desc.value = task.description || '';
        elements.date.value = task.dueDate || '';
        
        // Priority
        const pVal = task.priority || 'none';
        const pRadio = document.querySelector(`input[name="priority"][value="${pVal}"]`);
        if(pRadio) pRadio.checked = true;

        // Parent Options
        elements.parent.innerHTML = '<option value="">(なし)</option>';
        Object.values(State.data.tasks).forEach(t => {
            if (t.id !== taskId && !t.parentId) {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.content.substring(0, 30);
                elements.parent.appendChild(opt);
            }
        });
        elements.parent.value = task.parentId || '';

        // Labels
        State.tempLabels = task.labels ? [...task.labels] : [];
        Modal.renderLabels();

        Modal.elements.overlay.classList.remove('hidden');
        void Modal.elements.overlay.offsetWidth; // trigger reflow
        Modal.elements.overlay.classList.remove('opacity-0');
        Modal.elements.content.classList.remove('scale-95', 'opacity-0');
        Modal.elements.content.classList.add('scale-100', 'opacity-100');
        document.body.classList.add('modal-open');
    },

    close: () => {
        Modal.elements.overlay.classList.add('opacity-0');
        Modal.elements.content.classList.remove('scale-100', 'opacity-100');
        Modal.elements.content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            Modal.elements.overlay.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }, 250);
    },

    save: () => {
        const id = Modal.elements.id.value;
        const content = Modal.elements.title.value.trim();
        
        if (content && State.data.tasks[id]) {
            const t = State.data.tasks[id];
            t.content = content;
            t.description = Modal.elements.desc.value;
            t.dueDate = Modal.elements.date.value;
            t.labels = State.tempLabels;
            t.priority = document.querySelector('input[name="priority"]:checked')?.value || 'none';
            t.parentId = Modal.elements.parent.value || null;

            // If became child, reset own children
            if (t.parentId) {
                Object.values(State.data.tasks).forEach(child => {
                    if (child.parentId === id) child.parentId = null;
                });
            }

            DataService.save();
            App.render();
            Modal.close();
        }
    },

    renderLabels: () => {
        const container = Modal.elements.labelsContainer;
        container.innerHTML = '';
        State.data.labels.forEach(label => {
            const isSelected = State.tempLabels.includes(label.id);
            const colorClass = CONSTANTS.COLORS[label.color] || CONSTANTS.COLORS.blue;
            
            const el = document.createElement('div');
            el.className = `flex items-center gap-1 px-2 py-1 rounded-full border cursor-pointer transition-all ${colorClass} ${isSelected ? 'ring-2 ring-slate-400' : 'opacity-60 hover:opacity-100'}`;
            el.innerHTML = `
                <span class="text-xs font-bold mr-1 select-none">${label.name}</span>
                <button type="button" class="hover:text-red-900"><i data-lucide="x" class="w-3 h-3"></i></button>
            `;
            
            // Click handlers
            el.onclick = (e) => {
                // Delete button click
                if (e.target.closest('button')) {
                    e.stopPropagation();
                    LabelManager.delete(label.id);
                    return;
                }
                // Toggle Selection
                if (isSelected) State.tempLabels = State.tempLabels.filter(id => id !== label.id);
                else State.tempLabels.push(label.id);
                Modal.renderLabels();
            };
            
            container.appendChild(el);
        });
        lucide.createIcons();
    }
};

// --- 6. UI Generator ---
const UI = {
    createTaskCard: (task, columnId, visibleTasksContext) => {
        const isDone = columnId === CONSTANTS.DONE_COLUMN_ID;
        const el = document.createElement('div');
        
        // Indent Check: 
        // If it has a parentId, it is a child. 
        // Logic: It should be indented if it's under a Real Parent OR a Virtual Parent.
        // Since we insert Virtual Parents for orphans, ANY task with a valid parentId should be indented.
        const hasParent = !!task.parentId && !!State.data.tasks[task.parentId];
        const indentClass = hasParent ? 'child-task scale-95 origin-left' : '';
        
        el.className = `task-card bg-white border border-slate-200 rounded-xl p-4 shadow-sm group relative cursor-pointer ${indentClass} ${isDone ? 'is-done' : ''}`;
        el.dataset.taskId = task.id;

        // Priority Icon
        const pConfig = CONSTANTS.PRIORITIES.find(p => p.value === task.priority);
        const priorityHtml = (pConfig && pConfig.value !== 'none') 
            ? `<div class="flex items-center justify-center w-6 h-6 rounded-md border ${pConfig.style.replace('text-sm font-bold', '')}"><i data-lucide="${pConfig.icon}" class="w-4 h-4"></i></div>` 
            : '';

        // Labels
        const labelsHtml = task.labels && task.labels.length > 0
            ? `<div class="flex flex-wrap gap-1.5 mb-2">` + task.labels.map(lid => {
                const l = State.data.labels.find(x => x.id === lid);
                return l ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${CONSTANTS.COLORS[l.color] || CONSTANTS.COLORS.blue}">${l.name}</span>` : '';
              }).join('') + `</div>`
            : '';

        // Parent Indicator
        let parentIndicator = '';
        if (task.parentId) {
            const p = State.data.tasks[task.parentId];
            if (p) parentIndicator = `<div class="text-[10px] text-blue-500 font-semibold mb-1 flex items-center gap-1"><i data-lucide="corner-down-right" class="w-3 h-3"></i>${p.content.substring(0,15)}...</div>`;
        }

        // Meta (Date/Time)
        let metaHtml = `<div class="flex items-center gap-3 mt-3">`;
        if (isDone && task.completedDate) {
            metaHtml += `<div class="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md"><i data-lucide="check-circle-2" class="w-3 h-3"></i>完了: ${task.completedDate}</div>`;
        } else if (task.dueDate) {
            const overdue = new Date(task.dueDate) < new Date().setHours(0,0,0,0);
            const style = overdue ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-500 bg-slate-50 border-slate-100';
            metaHtml += `<div class="flex items-center gap-1 text-xs font-medium border px-2 py-1 rounded-md w-fit ${style}"><i data-lucide="clock" class="w-3 h-3"></i>${task.dueDate}</div>`;
        }
        if (task.description) metaHtml += `<i data-lucide="align-left" class="w-3 h-3 text-slate-400"></i>`;
        metaHtml += `</div>`;

        el.innerHTML = `
            ${parentIndicator}
            ${labelsHtml}
            <div class="flex justify-between items-start gap-2">
                <span class="task-title text-[15px] font-medium text-slate-700 leading-relaxed flex-grow">${task.content}</span>
                <div class="flex flex-col gap-1 items-end">
                    ${priorityHtml}
                    <button onclick="event.stopPropagation(); DataService.deleteTask('${task.id}', '${columnId}')" class="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            ${metaHtml}
        `;
        
        el.addEventListener('click', () => Modal.open(task.id));
        return el;
    },

    createVirtualParent: (parentTask) => {
        const el = document.createElement('div');
        let laneName = '不明';
        for(const cid in State.data.columns) {
            if(State.data.columns[cid].taskIds.includes(parentTask.id)) { laneName = State.data.columns[cid].title; break; }
        }
        el.className = 'task-card virtual-parent-card rounded-xl p-3 flex flex-col gap-1';
        el.innerHTML = `
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><i data-lucide="link" class="w-3 h-3"></i> 実体は「${laneName}」</div>
            <span class="text-sm font-semibold text-slate-400 truncate">${parentTask.content}</span>
        `;
        return el;
    }
};

// --- 7. Main Application Controller ---
const App = {
    init: () => {
        DataService.init();
        Modal.init();
        
        // Event Listeners
        document.getElementById('add-task-form').addEventListener('submit', App.handleAddTask);
        document.getElementById('label-filter').addEventListener('change', (e) => {
            State.filter = e.target.value;
            App.render();
        });
        
        // Close modal listener
        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target.id === 'task-modal') Modal.close();
        });

        // Global Settings Toggle
        const menu = document.getElementById('settings-menu');
        window.toggleMenu = (e) => { e.stopPropagation(); menu.classList.toggle('hidden'); };
        document.addEventListener('click', () => menu.classList.add('hidden'));

        App.render();
    },

    handleAddTask: (e) => {
        e.preventDefault();
        const input = document.getElementById('new-task-input');
        const content = input.value.trim();
        if (content) {
            const id = `task-${Date.now()}`;
            State.data.tasks[id] = { 
                id, content, description: '', dueDate: '', 
                parentId: null, labels: [], priority: 'none' 
            };
            State.data.columns['c1'].taskIds.unshift(id);
            DataService.save();
            App.render();
            input.value = '';
        }
    },

    render: () => {
        const board = document.getElementById('board');
        board.innerHTML = '';
        App.updateFilterDropdown();

        State.data.columnOrder.forEach(colId => {
            const column = State.data.columns[colId];
            const colEl = document.createElement('div');
            colEl.className = 'bg-slate-200/40 backdrop-blur-md rounded-[2rem] p-6 flex flex-col border border-white/20 shadow-inner h-full min-h-[500px]';
            colEl.innerHTML = `
                <div class="flex justify-between items-center mb-6 px-2">
                    <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        ${column.title}
                    </h2>
                    <span class="bg-white/80 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full shadow-sm border border-slate-100">
                        ${column.taskIds.length}
                    </span>
                </div>
            `;

            const listEl = document.createElement('div');
            listEl.className = 'task-list space-y-3 min-h-[100px] pb-4';
            listEl.dataset.columnId = colId;

            // --- Filtering & Grouping Logic ---
            const tasks = column.taskIds.map(id => State.data.tasks[id]).filter(Boolean);
            const visible = tasks.filter(t => State.filter === 'all' || (t.labels && t.labels.includes(State.filter)));

            const renderItems = []; // { type: 'real'|'virtual', task }
            const processed = new Set();

            // 1. Identify Roots & Orphans
            // A task is a "Root in this column" if:
            // - It has no parent
            // - OR its parent is NOT in the visible list of THIS column (meaning parent is elsewhere)
            const roots = visible.filter(t => !t.parentId || !visible.some(pt => pt.id === t.parentId));
            
            roots.forEach(root => {
                // If this root actually HAS a parent (but parent is absent/elsewhere),
                // we must show a Virtual Parent first.
                if (root.parentId) {
                    const pTask = State.data.tasks[root.parentId];
                    // Add virtual parent if it exists and we haven't rendered it yet in this loop context
                    // (Actually, each orphan child needs its own context, or grouped under one virtual?
                    //  Simplest: Just show virtual parent above the child to indicate context.)
                    if (pTask) {
                        // Check if we just added this virtual parent for the previous sibling? 
                        // To avoid duplicating "Virtual Parent A" "Child 1", "Virtual Parent A" "Child 2"...
                        // let's check the last added item.
                        const lastItem = renderItems[renderItems.length - 1];
                        if (!lastItem || lastItem.type !== 'virtual' || lastItem.task.id !== pTask.id) {
                             renderItems.push({ type: 'virtual', task: pTask });
                        }
                    }
                }
                
                renderItems.push({ type: 'real', task: root });
                processed.add(root.id);

                // 2. Render Children of this root (that ARE in this column)
                // Since 'root' is now here (real or orphan-as-root), its children should follow.
                const children = visible.filter(c => c.parentId === root.id);
                children.forEach(child => {
                    renderItems.push({ type: 'real', task: child });
                    processed.add(child.id);
                });
            });

            // 3. Fallback for any tasks missed by the above logic (safety net)
            visible.forEach(t => { 
                if(!processed.has(t.id)) {
                    // Treat as root if missed
                    renderItems.push({ type: 'real', task: t }); 
                }
            });

            renderItems.forEach(item => {
                const el = item.type === 'virtual' 
                    ? UI.createVirtualParent(item.task) 
                    : UI.createTaskCard(item.task, colId, visible); // Pass 'visible' as context for indentation check
                listEl.appendChild(el);
            });

            colEl.appendChild(listEl);
            board.appendChild(colEl);
        });

        lucide.createIcons();
        App.initDragAndDrop();
    },

    updateFilterDropdown: () => {
        const select = document.getElementById('label-filter');
        select.innerHTML = '<option value="all">すべてのラベル</option>';
        State.data.labels.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.id; opt.textContent = l.name;
            if(l.id === State.filter) opt.selected = true;
            select.appendChild(opt);
        });
    },

    initDragAndDrop: () => {
        if (State.filter !== 'all') return;
        document.querySelectorAll('.task-list').forEach(list => {
            new Sortable(list, {
                group: 'tasks', animation: 250, ghostClass: 'ghost-card',
                onEnd: (evt) => {
                    const { item, to, from, newIndex, oldIndex } = evt;
                    
                    // Check if Virtual Card (ignore drag, though usually filtered by class)
                    if (item.classList.contains('virtual-parent-card')) return;

                    const taskId = item.dataset.taskId;
                    const toCol = to.dataset.columnId;
                    const fromCol = from.dataset.columnId;

                    // Correctly calculate new index in DATA array by ignoring virtual elements in DOM
                    const getRealIndex = (container, domIndex) => {
                        const children = Array.from(container.children);
                        let realIdx = 0;
                        for (let i = 0; i < domIndex; i++) {
                            if (!children[i].classList.contains('virtual-parent-card')) {
                                realIdx++;
                            }
                        }
                        return realIdx;
                    };

                    // 1. Remove from Source Data
                    State.data.columns[fromCol].taskIds = State.data.columns[fromCol].taskIds.filter(id => id !== taskId);

                    // 2. Insert into Target Data based on new DOM order
                    // Iterate target DOM children, extract task IDs, ignore virtuals.
                    const newTaskIds = [];
                    Array.from(to.children).forEach(child => {
                        if (!child.classList.contains('virtual-parent-card') && child.dataset.taskId) {
                            newTaskIds.push(child.dataset.taskId);
                        }
                    });
                    
                    State.data.columns[toCol].taskIds = newTaskIds;

                    // 3. Update Task Metadata
                    const task = State.data.tasks[taskId];
                    
                    // Completed Logic
                    if (toCol === CONSTANTS.DONE_COLUMN_ID) {
                        if (!task.completedDate) {
                            const now = new Date();
                            const d = now.toLocaleDateString('ja-JP', {year:'numeric',month:'2-digit',day:'2-digit'}).replaceAll('/','-');
                            const t = now.toLocaleTimeString('ja-JP', {hour:'2-digit',minute:'2-digit'});
                            task.completedDate = `${d} ${t}`;
                        }
                    } else {
                        task.completedDate = null;
                    }

                    DataService.save();
                    App.render();
                }
            });
        });
    }
};

// Start App
App.init();
