/**
 * MonoFlow - Core Application Logic
 */

const BoardData = {
    init: () => {
        const saved = DataService.load();
        if (saved) { State.data = saved; } else {
            State.data = {
                tasks: { 't1': { id: 't1', content: Common.t('welcome_title'), description: Common.t('welcome_desc'), dueDate: '', parentId: null, labels: [], blockers: [], priority: 'high', updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(), archived: false } },
                columns: { 'c1': { id: 'c1', title: 'To Do', taskIds: ['t1'] }, 'c2': { id: 'c2', title: 'In Progress', taskIds: [] }, 'c3': { id: 'c3', title: 'Done', taskIds: [] } },
                columnOrder: ['c1', 'c2', 'c3'],
                labels: [{ id: 'l1', name: 'Priority', color: 'red' }, { id: 'l2', name: 'Work', color: 'blue' }]
            };
        }
        BoardData.ensureIntegrity();
    },
    save: () => DataService.save(State.data),
    ensureIntegrity: () => {
        const allInCols = new Set(Object.values(State.data.columns).flatMap(c => c.taskIds));
        Object.keys(State.data.tasks).forEach(id => { if (!State.data.tasks[id].archived && !allInCols.has(id)) State.data.columns['c1'].taskIds.push(id); });
        BoardData.save();
    },
    deleteTask: (taskId, colId) => {
        if(!confirm(Common.t('confirm_delete'))) return;
        if (colId) State.data.columns[colId].taskIds = State.data.columns[colId].taskIds.filter(id => id !== taskId);
        delete State.data.tasks[taskId];
        Object.values(State.data.tasks).forEach(t => { if(t.parentId === taskId) t.parentId = null; });
        BoardData.save(); App.render();
    },
    archiveTask: (taskId) => {
        const t = State.data.tasks[taskId];
        let currentCid = 'c1';
        for(const cid in State.data.columns) { if (State.data.columns[cid].taskIds.includes(taskId)) { currentCid = cid; State.data.columns[cid].taskIds = State.data.columns[cid].taskIds.filter(id => id !== taskId); break; } }
        t.archived = true; t.lastColumnId = currentCid;
        BoardData.save(); App.render(); Modal.close();
    },
    restoreTask: (taskId) => {
        const t = State.data.tasks[taskId];
        t.archived = false;
        const targetCid = t.lastColumnId && State.data.columns[t.lastColumnId] ? t.lastColumnId : 'c1';
        State.data.columns[targetCid].taskIds.unshift(taskId);
        BoardData.save(); App.render(); Archive.render();
    }
};

const LabelManager = {
    create: () => {
        const nameInput = document.getElementById('new-label-name');
        const name = nameInput.value.trim(); if(!name) return;
        const colorRadio = document.querySelector('input[name="label-color"]:checked');
        State.data.labels.push({ id: `l-${Date.now()}`, name, color: colorRadio ? colorRadio.value : 'blue' });
        BoardData.save(); nameInput.value = ''; Modal.renderLabels();
    },
    delete: (id) => {
        if(!confirm(Common.t('confirm_delete'))) return;
        State.data.labels = State.data.labels.filter(l => l.id !== id);
        Object.values(State.data.tasks).forEach(t => { if(t.labels) t.labels = t.labels.filter(lid => lid !== id); });
        State.tempLabels = State.tempLabels.filter(lid => lid !== id);
        BoardData.save(); Modal.renderLabels(); App.render();
    }
};

const Modal = {
    elements: {
        overlay: document.getElementById('task-modal'),
        content: document.querySelector('#task-modal .modal-content'),
        id: document.getElementById('edit-task-id'),
        title: document.getElementById('edit-task-content'),
        desc: document.getElementById('edit-task-desc'),
        date: document.getElementById('edit-task-date'),
        parent: document.getElementById('edit-task-parent'),
        labelsContainer: document.getElementById('edit-task-labels'),
        blockerSelect: document.getElementById('edit-task-blocker-select'),
        blockerList: document.getElementById('edit-task-blockers-list'),
        addBlockerBtn: document.getElementById('modal-add-blocker-btn')
    },
    init: () => {
        const cContainer = document.getElementById('label-color-picker');
        cContainer.innerHTML = ['red', 'blue', 'green', 'yellow', 'purple'].map((c, i) => `<input type="radio" name="label-color" value="${c}" id="c-${c}" class="hidden color-radio" ${i===0?'checked':''}><label for="c-${c}" class="w-5 h-5 rounded-full bg-${c}-500 cursor-pointer block color-label hover:scale-110"></label>`).join('');
    },
    renderStaticUI: () => {
        document.querySelector('#task-modal h3').textContent = Common.t('modal_title');
        Common.setT('display-created-at', 'task_created');
        const addTagBtn = document.getElementById('modal-add-tag-btn'); if (addTagBtn) addTagBtn.textContent = Common.t('modal_btn_add_tag');
        const cancelBtn = document.getElementById('modal-cancel-btn'); if (cancelBtn) cancelBtn.textContent = Common.t('modal_btn_cancel');
        const saveBtn = document.getElementById('modal-save-btn'); if (saveBtn) saveBtn.textContent = Common.t('modal_btn_save');
        let archBtn = document.getElementById('modal-archive-btn');
        if (!archBtn) { archBtn = document.createElement('button'); archBtn.id = 'modal-archive-btn'; archBtn.className = 'mr-auto px-4 py-2.5 text-slate-400 hover:text-orange-600 font-medium flex items-center gap-2 transition-colors'; Modal.elements.overlay.querySelector('.p-6.border-t').prepend(archBtn); }
        archBtn.innerHTML = `<i data-lucide="archive" class="w-4 h-4"></i> ${Common.t('modal_btn_archive')}`;
        archBtn.onclick = () => BoardData.archiveTask(Modal.elements.id.value);
        const pContainer = document.getElementById('priority-options-container');
        pContainer.innerHTML = CONSTANTS.PRIORITIES.map(p => `<label class="cursor-pointer"><input type="radio" name="priority" value="${p.value}" class="peer sr-only"><div class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 peer-checked:${p.style} text-sm font-bold flex items-center gap-1 transition-all hover:bg-slate-50">${p.icon ? `<i data-lucide="${p.icon}" class="w-4 h-4"></i>` : ''} ${p.label[State.language]}</div></label>`).join('');
        
        const labels = document.querySelectorAll('#task-modal label');
        if (labels.length > 0) labels[0].textContent = Common.t('modal_label_title');
        if (labels.length > 1) labels[1].textContent = Common.t('modal_label_priority');
        if (labels.length > 2) labels[2].textContent = Common.t('modal_label_tags');
        if (labels.length > 3) labels[3].textContent = Common.t('modal_label_parent');
        if (labels.length > 4) labels[4].textContent = Common.t('modal_label_blocker');
        if (labels.length > 5) labels[5].textContent = Common.t('modal_label_desc');
        if (labels.length > 6) labels[6].textContent = Common.t('modal_label_date');
        
        if (Modal.elements.addBlockerBtn) Modal.elements.addBlockerBtn.textContent = Common.t('modal_btn_add_blocker');
        lucide.createIcons();
    },
    open: (taskId) => {
        const task = State.data.tasks[taskId]; if (!task) return;
        Modal.renderStaticUI(); Modal.elements.id.value = taskId; Modal.elements.title.value = task.content; Modal.elements.desc.value = task.description || ''; Modal.elements.date.value = task.dueDate || '';
        document.getElementById('display-created-at').textContent = `${Common.t('task_created')}: ${task.createdAt ? UI.formatTime(task.createdAt) : '---'}`;
        document.getElementById('display-updated-at').textContent = `${Common.t('task_updated')}: ${task.updatedAt ? UI.formatTime(task.updatedAt) : '---'}`;
        const pRadio = Modal.elements.overlay.querySelector(`input[name="priority"][value="${task.priority || 'none'}"]`); if(pRadio) pRadio.checked = true;
        const hasChildren = Object.values(State.data.tasks).some(t => t.parentId === taskId);
        if (hasChildren) { Modal.elements.parent.disabled = true; Modal.elements.parent.classList.add('bg-slate-50', 'text-slate-400', 'cursor-not-allowed'); Modal.elements.parent.innerHTML = `<option value="" selected>${Common.t('modal_parent_restricted')}</option>`; } 
        else { Modal.elements.parent.disabled = false; Modal.elements.parent.classList.remove('bg-slate-50', 'text-slate-400', 'cursor-not-allowed'); Modal.elements.parent.innerHTML = `<option value="">${Common.t('modal_label_none')}</option>`; Object.values(State.data.tasks).forEach(t => { if (t.id !== taskId && !t.parentId && !t.archived) { const opt = document.createElement('option'); opt.value = t.id; opt.textContent = t.content.substring(0, 30); Modal.elements.parent.appendChild(opt); } }); Modal.elements.parent.value = task.parentId || ''; } 
        State.tempLabels = task.labels ? [...task.labels] : []; Modal.renderLabels();
        
        State.tempBlockers = task.blockers ? [...task.blockers] : [];
        Modal.renderBlockers(taskId);
        Modal.elements.addBlockerBtn.onclick = () => {
             const val = Modal.elements.blockerSelect.value;
             if(val && !State.tempBlockers.includes(val)) { State.tempBlockers.push(val); Modal.renderBlockers(taskId); }
        };

        Modal.elements.overlay.classList.remove('hidden'); void Modal.elements.overlay.offsetWidth; Modal.elements.overlay.classList.remove('opacity-0'); Modal.elements.content.classList.remove('scale-95', 'opacity-0'); Modal.elements.content.classList.add('scale-100', 'opacity-100'); document.body.classList.add('modal-open');
    },
    close: () => { Modal.elements.overlay.classList.add('opacity-0'); Modal.elements.content.classList.remove('scale-100', 'opacity-100'); Modal.elements.content.classList.add('scale-95', 'opacity-0'); setTimeout(() => { Modal.elements.overlay.classList.add('hidden'); document.body.classList.remove('modal-open'); }, 250); },
    save: () => {
        const id = Modal.elements.id.value; const content = Modal.elements.title.value.trim();
        if (content && State.data.tasks[id]) {
            const t = State.data.tasks[id]; t.content = content; t.description = Modal.elements.desc.value; t.dueDate = Modal.elements.date.value;
            t.parentId = Modal.elements.parent.value || null; t.priority = document.querySelector('input[name="priority"]:checked')?.value || 'none';
            t.labels = [...State.tempLabels]; t.blockers = [...State.tempBlockers]; t.updatedAt = new Date().toISOString();
            if (t.parentId) Object.values(State.data.tasks).forEach(child => { if (child.parentId === id) child.parentId = null; });
            BoardData.save(); App.render(); Modal.close();
        }
    },
    renderLabels: () => {
        const container = Modal.elements.labelsContainer; container.innerHTML = '';
        State.data.labels.forEach(label => {
            const isSelected = State.tempLabels.includes(label.id); const colorClass = CONSTANTS.COLORS[label.color] || CONSTANTS.COLORS.blue;
            const el = document.createElement('div'); el.className = `flex items-center gap-1 px-2 py-1 rounded-full border cursor-pointer transition-all ${colorClass} ${isSelected ? 'ring-2 ring-slate-400' : 'opacity-60 hover:opacity-100'}`;
            el.innerHTML = `<span class="text-xs font-bold mr-1 select-none">${label.name}</span><button type="button" class="hover:text-red-900"><i data-lucide="x" class="w-3 h-3"></i></button>`;
            el.onclick = (e) => { if (e.target.closest('button')) { e.stopPropagation(); LabelManager.delete(label.id); return; } if (isSelected) State.tempLabels = State.tempLabels.filter(id => id !== label.id); else State.tempLabels.push(label.id); Modal.renderLabels(); }; container.appendChild(el);
        });
        lucide.createIcons();
    },
    renderBlockers: (currentTaskId) => {
        Modal.elements.blockerSelect.innerHTML = `<option value="">${Common.t('modal_label_none')}</option>`;
        Object.values(State.data.tasks).filter(pt => pt.id !== currentTaskId && !pt.archived && !State.tempBlockers.includes(pt.id)).forEach(pt => {
             const opt = document.createElement('option'); opt.value = pt.id; opt.textContent = pt.content.substring(0, 40) + (pt.content.length>40?'...':'');
             Modal.elements.blockerSelect.appendChild(opt);
        });
        Modal.elements.blockerList.innerHTML = State.tempBlockers.map(bid => {
            const b = State.data.tasks[bid]; if (!b) return '';
            const isDone = State.data.columns[CONSTANTS.DONE_COLUMN_ID].taskIds.includes(bid) || (b.archived && b.completedDate);
            const statusIcon = isDone ? 'check-circle-2' : 'circle';
            const statusColor = isDone ? 'text-green-500' : 'text-slate-400';
            return `<div class="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700"><div class="flex items-center gap-2 overflow-hidden"><i data-lucide="${statusIcon}" class="w-4 h-4 ${statusColor} shrink-0"></i><span class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">${b.content}</span></div><button type="button" onclick="State.tempBlockers=State.tempBlockers.filter(id=>id!=='${bid}'); Modal.renderBlockers('${currentTaskId}')" class="text-slate-400 hover:text-red-500 p-1"><i data-lucide="x" class="w-3 h-3"></i></button></div>`;
        }).join('');
        lucide.createIcons();
    }
};

const UI = {
    formatTime: (iso) => { if (!iso) return ''; const d = Common.parseDate(iso); return d.toLocaleString(State.language === 'ja' ? 'ja-JP' : 'en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }); },
    createTaskCard: (task, columnId, visibleTasksContext) => {
        const isDone = columnId === CONSTANTS.DONE_COLUMN_ID; const el = document.createElement('div');
        const hasParent = !!task.parentId && !!State.data.tasks[task.parentId]; const indentClass = hasParent ? 'child-task scale-95 origin-left' : '';
        const isNewClass = task.id === State.lastAddedId ? 'is-new' : '';
        let pBorder = 'border-slate-200 dark:border-slate-700';
        if (task.priority === 'high') pBorder = 'border-l-4 border-l-red-500 border-slate-200 dark:border-slate-700';
        else if (task.priority === 'medium') pBorder = 'border-l-4 border-l-orange-400 border-slate-200 dark:border-slate-700';
        else if (task.priority === 'low') pBorder = 'border-l-4 border-l-blue-400 border-slate-200 dark:border-slate-700';

        let staleIcon = '';
        if (columnId === 'c1') {
            const lastActive = Common.parseDate(task.updatedAt || task.createdAt);
            if (lastActive && (new Date() - lastActive > 7 * 86400000)) {
                staleIcon = `<div class="absolute -right-1 -top-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse z-10" title="${Common.t('stale_task')}"><i data-lucide="wind" class="w-3 h-3"></i></div>`;
            }
        }

        el.className = `task-card bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm group relative cursor-pointer ${indentClass} ${isDone ? 'is-done' : ''} ${isNewClass} ${pBorder}`;
        el.dataset.taskId = task.id;
        const pConfig = CONSTANTS.PRIORITIES.find(p => p.value === task.priority);
        const pIcon = (pConfig && pConfig.value !== 'none') ? `<div class="flex items-center justify-center w-6 h-6 rounded-md border ${pConfig.style.replace('text-sm font-bold', '')}"><i data-lucide="${pConfig.icon}" class="w-4 h-4"></i></div>` : '';
        const lHtml = task.labels && task.labels.length > 0 ? `<div class="flex flex-wrap gap-1.5 mb-2">` + task.labels.map(lid => { const l = State.data.labels.find(x => x.id === lid); return l ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${CONSTANTS.COLORS[l.color] || CONSTANTS.COLORS.blue}">${l.name}</span>` : ''; }).join('') + `</div>` : '';
        let pInd = ''; if (task.parentId) { const p = State.data.tasks[task.parentId]; if (p) pInd = `<div class="text-[10px] text-blue-500 font-semibold mb-1 flex items-center gap-1"><i data-lucide="corner-down-right" class="w-3 h-3"></i>${p.content.substring(0,15)}...</div>`; } 
        let subCounter = ''; const children = Object.values(State.data.tasks).filter(t => t.parentId === task.id && !t.archived);
        if (children.length > 0) { const dCount = children.filter(c => { for(const cid in State.data.columns) if(State.data.columns[cid].taskIds.includes(c.id) && cid === CONSTANTS.DONE_COLUMN_ID) return true; return false; }).length; const progressPct = Math.round((dCount / children.length) * 100); subCounter = `<div class="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800"><div class="flex justify-between items-center mb-1.5"><div class="flex items-center gap-1 text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"><i data-lucide="git-merge" class="w-2.5 h-2.5"></i>${dCount}/${children.length}</div><span class="text-[9px] font-bold text-slate-400">${progressPct}%</span></div><div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-blue-500 transition-all duration-500" style="width: ${progressPct}%"></div></div></div>`; } 
        let metaHtml = `<div class="flex items-center gap-3 mt-3">`;
        if (task.blockers && task.blockers.length > 0) {
            const doneCount = task.blockers.filter(bid => {
                const b = State.data.tasks[bid];
                return b && (State.data.columns[CONSTANTS.DONE_COLUMN_ID].taskIds.includes(bid) || (b.archived && b.completedDate));
            }).length;
            const allDone = doneCount === task.blockers.length;
            const colorClass = allDone ? 'text-green-600 bg-green-50 border-green-100' : 'text-orange-600 bg-orange-50 border-orange-100';
            metaHtml += `<div class="flex items-center gap-1 text-[10px] font-bold border px-1.5 py-0.5 rounded-md ${colorClass}" title="${Common.t('modal_label_blocker')}"><i data-lucide="link-2" class="w-3 h-3"></i>${doneCount}/${task.blockers.length}</div>`;
        }
        if (isDone && task.completedDate) metaHtml += `<div class="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md"><i data-lucide="check-circle-2" class="w-3 h-3"></i>${Common.t('task_completed')}: ${UI.formatTime(task.completedDate)}</div>`;
        else if (task.dueDate) { const overdue = new Date(task.dueDate) < new Date().setHours(0,0,0,0); const style = overdue ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-500 bg-slate-50 border-slate-100'; metaHtml += `<div class="flex items-center gap-1 text-xs font-medium border px-2 py-1 rounded-md w-fit ${style}"><i data-lucide="clock" class="w-3 h-3"></i>${task.dueDate}</div>`; } 
        if (task.description) metaHtml += `<i data-lucide="align-left" class="w-3 h-3 text-slate-400"></i>`;
        if (task.updatedAt) { metaHtml += `<div class="ml-auto flex flex-col items-end gap-0.5"><div class="text-[9px] text-slate-300 font-medium">${Common.t('task_created')}: ${UI.formatTime(task.createdAt)}</div>`; if (task.updatedAt !== task.createdAt) metaHtml += `<div class="flex items-center gap-1 text-[9px] text-blue-400 font-bold"><i data-lucide="refresh-cw" class="w-2 h-2"></i>${Common.t('task_updated')}: ${UI.formatTime(task.updatedAt)}</div>`; metaHtml += `</div>`; } 
        metaHtml += `</div>`;
        el.innerHTML = `${staleIcon}${pInd}${lHtml}<div class="flex justify-between items-start gap-2"><div class="flex-grow min-w-0"><span class="task-title text-[15px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed block truncate">${task.content}</span>${task.description ? `<div class="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-1 leading-relaxed break-words">${task.description}</div>` : ''}</div><div class="flex flex-col gap-1 items-end">${pIcon}<button onclick="event.stopPropagation(); BoardData.deleteTask('${task.id}', '${columnId}')" class="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div></div>${metaHtml}${subCounter}`;
        el.addEventListener('click', () => Modal.open(task.id)); return el;
    },
    createVirtualParent: (parentTask) => {
        const el = document.createElement('div'); el.className = 'task-card virtual-parent-card rounded-lg flex items-center transition-all';
        el.innerHTML = `<span class="text-[11px] font-bold text-slate-500 dark:text-slate-300 truncate tracking-tight">${parentTask.content}</span>`;
        el.addEventListener('click', () => App.jumpToTask(parentTask.id)); return el;
    },
    createVirtualChild: (childTask) => {
        const el = document.createElement('div'); let laneName = '???';
        for(const cid in State.data.columns) if(State.data.columns[cid].taskIds.includes(childTask.id)) { laneName = Common.t(cid === 'c1' ? 'col_todo' : (cid === 'c2' ? 'col_progress' : 'col_done')); break; }
        el.className = 'task-card virtual-child-card rounded-lg p-2 flex items-center gap-2 justify-between cursor-pointer hover:border-blue-400 hover:opacity-100 transition-all';
        el.innerHTML = `<span class="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate flex-grow">${childTask.content}</span><div class="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 bg-slate-50/50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700"><i data-lucide="external-link" class="w-2.5 h-2.5"></i> ${laneName}</div>`;
        el.addEventListener('click', () => App.jumpToTask(childTask.id)); return el;
    }
};

const Archive = {
    open: () => { Archive.render(); const m = document.getElementById('archive-modal'); m.classList.remove('hidden'); void m.offsetWidth; m.classList.remove('opacity-0'); m.querySelector('.modal-content').classList.add('scale-100', 'opacity-100'); document.body.classList.add('modal-open'); },
    close: () => { const m = document.getElementById('archive-modal'); m.classList.add('opacity-0'); m.querySelector('.modal-content').classList.remove('scale-100', 'opacity-100'); setTimeout(() => { m.classList.add('hidden'); document.body.classList.remove('modal-open'); }, 250); },
    render: () => {
        const c = document.getElementById('archive-list'); c.innerHTML = ''; const arch = Object.values(State.data.tasks).filter(t => t.archived);
        if (!arch.length) { c.innerHTML = '<p class="text-center text-slate-400 py-10 font-medium">No archived tasks found.</p>'; return; }
        arch.forEach(t => {
            const el = document.createElement('div'); el.className = 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex justify-between items-center gap-4 group';
            el.innerHTML = `<div class="flex-grow min-w-0"><div class="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">${t.content}</div><div class="text-[10px] text-slate-400 mt-1">${UI.formatTime(t.updatedAt)}</div></div><div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onclick="BoardData.restoreTask('${t.id}')" class="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"><i data-lucide="rotate-ccw" class="w-4 h-4"></i></button><button onclick="BoardData.deleteTask('${t.id}')" class="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`;
            c.appendChild(el);
        }); lucide.createIcons();
    }
};

const App = {
    jumpToTask: (id) => {
        const j = () => { const t = document.querySelector(`.task-card[data-task-id="${id}"]`); if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.add('is-flash'); setTimeout(() => t.classList.remove('is-flash'), 3000); } };
        if (!document.querySelector(`.task-card[data-task-id="${id}"]`)) { State.filter = 'all'; State.priorityFilter = 'all'; State.searchQuery = ''; document.getElementById('search-input').value = ''; App.render(); setTimeout(j, 200); } else j();
    },
    init: () => {
        BoardData.init();
        Modal.renderStaticUI();
        App.translateUI();
        document.getElementById('add-task-form').addEventListener('submit', App.handleAddTask);
        document.getElementById('label-filter').addEventListener('change', (e) => { State.filter = e.target.value; App.render(); });
        document.getElementById('priority-filter').addEventListener('change', (e) => { State.priorityFilter = e.target.value; App.render(); });
        document.getElementById('search-input').addEventListener('input', (e) => { State.searchQuery = e.target.value.toLowerCase().trim(); App.render(); });
        document.getElementById('task-modal').addEventListener('click', (e) => { if (e.target.id === 'task-modal') Modal.close(); });
        App.render();
        const urlParams = new URLSearchParams(window.location.search);
        const jumpId = urlParams.get('jumpTaskId');
        if (jumpId) { setTimeout(() => App.jumpToTask(jumpId), 500); window.history.replaceState({}, document.title, window.location.pathname); }
    },
    translateUI: () => {
        const t = (id, key) => Common.setT(id, key);
        const a = (id, attr, key) => Common.setAttr(id, attr, key);
        t('brand-title', 'about_title'); t('brand-subtitle', 'app_desc');
        t('nav-board', 'menu_board'); t('nav-metrics', 'menu_metrics'); t('nav-burndown', 'menu_burndown');
        t('about-link', 'about_link');
        t('notify-title', 'notify_title');
        t('add-btn-text', 'add_btn');
        t('menu-board-text', 'menu_board'); t('menu-metrics-text', 'menu_metrics'); t('menu-burndown-text', 'menu_burndown'); t('menu-about-text', 'menu_about');
        t('menu-export', 'menu_export'); t('menu-import', 'menu_import'); t('menu-archive', 'menu_archive'); t('menu-reset', 'menu_reset');
        t('footer-text', 'help_footer');
        a('search-input', 'placeholder', 'search_placeholder');
        a('new-task-input', 'placeholder', 'add_placeholder');
        a('help-btn', 'title', 'menu_help');
        a('lang-btn', 'title', 'switch_lang');
        a('theme-btn', 'title', 'toggle_theme');
    },
    handleAddTask: (e) => {
        e.preventDefault(); const input = document.getElementById('new-task-input'); const content = input.value.trim();
        if (content) {
            const id = `task-${Date.now()}`; const now = new Date().toISOString();
            State.data.tasks[id] = { id, content, description: '', dueDate: '', parentId: null, labels: [], blockers: [], priority: 'none', createdAt: now, updatedAt: now, archived: false };
            State.data.columns['c1'].taskIds.unshift(id); State.lastAddedId = id; setTimeout(() => { State.lastAddedId = null; }, 3000);
            BoardData.save(); App.render(); input.value = '';
        }
    },
    render: () => {
        const board = document.getElementById('board'); board.innerHTML = '';
        const appDesc = document.querySelector('header p.text-slate-400'); if (appDesc) appDesc.textContent = Common.t('app_desc');
        const taskInput = document.getElementById('new-task-input'); if (taskInput) taskInput.placeholder = Common.t('add_placeholder');
        const searchInput = document.getElementById('search-input'); if (searchInput) searchInput.placeholder = Common.t('search_placeholder');
        const addBtnSpan = document.getElementById('add-btn-text'); if (addBtnSpan) addBtnSpan.textContent = Common.t('add_btn');
        const aboutLink = document.getElementById('about-link'); if (aboutLink) aboutLink.textContent = Common.t('about_link');
        const helpLink = document.querySelector('a[href="help.html"]'); if(helpLink) helpLink.title = Common.t('menu_help');
        App.updateFilterDropdown(); App.updatePriorityFilterDropdown();
        const mItems = { 'menu-board-text': Common.t('menu_board'), 'menu-metrics-text': Common.t('menu_metrics'), 'menu-burndown-text': Common.t('menu_burndown'), 'menu-about-text': Common.t('menu_about'), 'menu-export': Common.t('menu_export'), 'menu-import': Common.t('menu_import'), 'menu-archive': Common.t('menu_archive'), 'menu-reset': Common.t('menu_reset') };
        for (const id in mItems) { const el = document.getElementById(id); if (el) { if (el.tagName === 'SPAN') el.textContent = mItems[id]; else { const icon = el.querySelector('i'); el.innerHTML = `${icon ? icon.outerHTML : ''} ${mItems[id]}`; } } }
        State.data.columnOrder.forEach(colId => {
            const col = State.data.columns[colId]; const colTitle = colId === 'c1' ? Common.t('col_todo') : (colId === 'c2' ? Common.t('col_progress') : Common.t('col_done'));
            const colEl = document.createElement('div'); colEl.className = 'bg-slate-200/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-2.5 flex flex-col border border-white/20 dark:border-slate-700 shadow-inner h-full min-h-[500px]';
            colEl.innerHTML = `<div class="flex justify-between items-center mb-3 px-1"><h2 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">${colTitle}</h2><span class="bg-white/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-600">${col.taskIds.length}</span></div>`;
            const listEl = document.createElement('div'); listEl.className = 'task-list space-y-2 pb-20 flex-grow min-h-[200px]'; listEl.dataset.columnId = colId;
            const tasks = col.taskIds.map(id => State.data.tasks[id]).filter(Boolean);
            const visible = tasks.filter(t => { const lMatch = State.filter === 'all' || (t.labels && t.labels.includes(State.filter)); const pMatch = State.priorityFilter === 'all' || (t.priority === State.priorityFilter); const sMatch = !State.searchQuery || t.content.toLowerCase().includes(State.searchQuery) || (t.description && t.description.toLowerCase().includes(State.searchQuery)); return lMatch && pMatch && sMatch; });
            const renderItems = []; const processedIds = new Set();
            const roots = visible.filter(t => !t.parentId || !visible.some(pt => pt.id === t.parentId));
            roots.forEach(root => {
                if (processedIds.has(root.id)) return;
                if (root.parentId) { const pTask = State.data.tasks[root.parentId]; const last = renderItems[renderItems.length - 1]; if (pTask && (!last || last.type !== 'virtual' || last.task.id !== pTask.id)) renderItems.push({ type: 'virtual', task: pTask }); } 
                renderItems.push({ type: 'real', task: root }); processedIds.add(root.id); visible.filter(c => c.parentId === root.id).forEach(child => { renderItems.push({ type: 'real', task: child }); processedIds.add(child.id); });
                Object.values(State.data.tasks).filter(t => t.parentId === root.id && !t.archived).forEach(child => { if (!processedIds.has(child.id)) renderItems.push({ type: 'virtual_child', task: child }); });
            });
            visible.forEach(t => { if (!processedIds.has(t.id)) renderItems.push({ type: 'real', task: t }); });
            renderItems.forEach(item => listEl.appendChild(item.type === 'virtual' ? UI.createVirtualParent(item.task) : (item.type === 'virtual_child' ? UI.createVirtualChild(item.task) : UI.createTaskCard(item.task, colId, visible))));
            colEl.appendChild(listEl); board.appendChild(colEl);
        }); lucide.createIcons(); App.initDragAndDrop();
    },
    updateFilterDropdown: () => { const s = document.getElementById('label-filter'); if(!s) return; s.innerHTML = `<option value="all">${Common.t('filter_all')}</option>`; State.data.labels.forEach(l => { const opt = document.createElement('option'); opt.value = l.id; opt.textContent = l.name; if(l.id === State.filter) opt.selected = true; s.appendChild(opt); }); },
    updatePriorityFilterDropdown: () => { const s = document.getElementById('priority-filter'); if (!s) return; s.innerHTML = `<option value="all">${Common.t('filter_priority_all')}</option>`; CONSTANTS.PRIORITIES.forEach(p => { const opt = document.createElement('option'); opt.value = p.value; opt.textContent = p.label[State.language]; if (p.value === State.priorityFilter) opt.selected = true; s.appendChild(opt); }); },
    initDragAndDrop: () => {
        if (State.filter !== 'all' || State.priorityFilter !== 'all' || State.searchQuery) return;
        document.querySelectorAll('.task-list').forEach(list => {
            new Sortable(list, { group: 'tasks', animation: 200, ghostClass: 'ghost-card', forceFallback: true, fallbackOnBody: true, fallbackTolerance: 5, onEnd: (evt) => {
                const { item, to, from } = evt; if (item.classList.contains('virtual-parent-card') || item.classList.contains('virtual-child-card')) return;
                const taskId = item.dataset.taskId; const toCol = to.dataset.columnId; const fromCol = from.dataset.columnId;
                const task = State.data.tasks[taskId];

                // Blocker Check
                if (toCol === CONSTANTS.DONE_COLUMN_ID && task.blockers && task.blockers.length > 0) {
                    const incompleteBlockers = task.blockers.filter(bid => {
                        const b = State.data.tasks[bid];
                        if (!b) return false;
                        const isBDone = State.data.columns[CONSTANTS.DONE_COLUMN_ID].taskIds.includes(bid) || (b.archived && b.completedDate);
                        return !isBDone;
                    });
                    if (incompleteBlockers.length > 0) {
                        const names = incompleteBlockers.map(bid => `- ${State.data.tasks[bid].content}`).join('\n');
                        const msg = Common.t('warn_blocker_incomplete').replace('{tasks}', names);
                        if (!confirm(msg)) {
                            // Revert DOM (Experimental)
                            evt.from.insertBefore(item, evt.from.children[evt.oldIndex]);
                            return; 
                        }
                    }
                }

                State.data.columns[fromCol].taskIds = State.data.columns[fromCol].taskIds.filter(id => id !== taskId);
                const newTaskIds = []; Array.from(to.children).forEach(child => { if (!child.classList.contains('virtual-parent-card') && !child.classList.contains('virtual-child-card') && child.dataset.taskId) newTaskIds.push(child.dataset.taskId); });
                State.data.columns[toCol].taskIds = newTaskIds;
                if (toCol === CONSTANTS.DONE_COLUMN_ID) { if (!task.completedDate) task.completedDate = new Date().toISOString(); } else task.completedDate = null;
                task.updatedAt = new Date().toISOString(); BoardData.save(); App.render();
            }}); 
        });
    }
};
App.init();
