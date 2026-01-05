/**
 * MonoFlow - Unified Shared Logic (i18n, Theme, Data Management, Notifications)
 */

const CONSTANTS = {
    STORAGE_KEY: 'monoflow-v10-refactored',
    LANG_KEY: 'monoflow-lang',
    THEME_KEY: 'monoflow-theme',
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
    ]
};

const State = {
    data: null,
    filter: 'all',
    priorityFilter: 'all',
    searchQuery: '',
    language: 'ja',
    theme: 'light',
    tempLabels: [],
    lastAddedId: null
};

const Common = {
    I18N: {
        ja: {
            app_desc: 'Simple Personal Kanban',
            back_to_app: 'ボードに戻る',
            filter_label: 'ラベル',
            filter_all: 'すべてのラベル',
            filter_priority_all: 'すべての優先度',
            add_placeholder: '新しいタスクを入力...',
            add_btn: '追加',
            search_placeholder: '検索...',
            menu_board: 'ボード',
            menu_export: 'エクスポート (JSON)',
            menu_import: 'インポート',
            menu_metrics: 'Metrics',
            menu_burndown: 'Burndown',
            menu_archive: 'アーカイブ',
            menu_about: 'About',
            menu_help: 'User Guide',
            menu_reset: 'ボードのリセット',
            switch_lang: '言語を切り替える',
            toggle_theme: 'テーマを切り替える',
            modal_title: 'タスク詳細',
            modal_label_title: 'タイトル',
            modal_label_priority: '優先度',
            modal_label_tags: 'ラベル',
            modal_label_new_tag: '新しいラベル名',
            modal_btn_add_tag: '追加',
            modal_label_parent: '親タスク',
            modal_label_none: '(なし)',
            modal_parent_restricted: '子タスクを持つため親指定不可',
            modal_label_desc: '詳細メモ',
            modal_label_blocker: 'ブロッカー (依存タスク)',
            modal_btn_add_blocker: '追加',
            warn_blocker_incomplete: '以下のブロッカータスクが未完了です:\n\n{tasks}\n\nそれでも完了にしますか？',
            modal_label_date: '期限',
            modal_btn_cancel: 'キャンセル',
            modal_btn_save: '保存',
            modal_btn_archive: 'アーカイブする',
            modal_btn_unarchive: 'ボードに戻す',
            col_todo: '未着手',
            col_progress: '進行中',
            col_done: '完了',
            task_created: '作成',
            task_updated: '更新',
            task_completed: '完了',
            stale_task: '1週間以上未更新のタスク',
            confirm_delete: 'タスクを削除しますか？',
            confirm_reset_1: '【警告】すべてのタスクを完全に削除しますか？\nこの操作は取り消せません。',
            confirm_reset_2: '本当に削除しますか？\n削除前に「エクスポート」してバックアップを取っておくことをお勧めします。',
            reset_done: 'ボードをリセットしました。',
            import_done: 'インポートが完了しました。',
            import_fail: 'インポートに失敗しました。',
            welcome_title: 'Welcome to MonoFlow',
            welcome_desc: 'これはサンプルタスクです。',
            metrics_title: 'MonoFlow',
            metrics_subtitle: '分析と進捗',
            metrics_period: '期間',
            metrics_total: '全タスク数',
            metrics_rate: '完了率',
            metrics_avg: '平均完了日数',
            metrics_cycle_time: '平均滞留時間',
            metrics_est_finish: '予測完了日',
            metrics_done: '合計完了数',
            metrics_dist: 'ステータス分布',
            metrics_prio_dist: '優先度別の分布',
            metrics_throughput: '完了スピードの推移',
            metrics_tasks_left: '残タスク数',
            metrics_label_select: 'ラベルを選択',
            metrics_clear: 'クリア',
            unit_days: '日',
            unit_hours: '時間',
            burndown_title: 'MonoFlow',
            burndown_subtitle: '時間経過による残仕事量',
            burndown_period: '表示期間',
            burndown_deadline: '目標期日',
            burndown_trend: '残タスク数の推移',
            burndown_scope_add: '新規追加',
            burndown_scope_done: '完了',
            burndown_forecast: '予測線',
            burndown_current: '現在',
            help_title: 'MonoFlow',
            help_subtitle: '操作マニュアル',
            help_quick: 'クイックスタート',
            help_manual: '詳細マニュアル',
            help_q1_t: 'タスクの作成',
            help_q1_d: '上部の大きな入力欄に内容を書き込み Enter を押すだけ。瞬時にチケットが発行されます。',
            help_q2_t: '進捗の管理',
            help_q2_d: 'カードをドラッグしてレーン間を移動。Doneへ移動させると完了時刻が自動記録されます。',
            help_q3_t: '情報の詳細化',
            help_q3_d: 'カードをクリックして詳細パネルへ。優先度、詳細メモ、ラベル、期限の設定が行えます。',
            help_new_features_t: '新機能：依存関係と整理',
            help_nf_stale_h: '放置タスクの検知',
            help_nf_stale_d: '1週間以上「ToDo」レーンで更新がないタスクには、自動的に「風（埃）」アイコンが表示されます。不要ならアーカイブ、必要なら着手しましょう。',
            help_nf_blocker_h: 'ブロッカー (依存タスク)',
            help_nf_blocker_d: '「これが終わらないと着手できない」タスクを設定できます。リンクアイコンにマウスを乗せると、依存先から自分に向かって流れるアニメーションが表示され、作業の優先順位を直感的に示します。',
            help_m1_t: '1. タスクカードの構造',
            help_m1_d: 'MonoFlowのカードは、情報の優先順位を整理し、一目で状況を把握できるように設計されています。',
            help_m1_h1: '視覚的要素の詳細',
            help_m1_l1: '<strong>優先度アクセント:</strong> 左端のライン色は重要度を直感的に伝えます（赤：高、橙：中、青：低）。',
            help_m1_l2: '<strong>動的なタイムスタンプ:</strong> 作成日時に加え、編集すると「更新日時」が、完了すると「完了日時」が自動記録されます。',
            help_m1_l3: '<strong>メモプレビュー:</strong> 詳細メモの冒頭2行を表示。カードを広げずにコンテキストを維持できます。',
            help_m1_l4: '<strong>期限バッジ:</strong> 期限が今日または過去の場合、赤く強調され見落としを防ぎます。',
            help_m1_h2: 'ステータス管理',
            help_m1_l5: 'Doneレーンにあるタスクは、新しい未完了タスクへの集中を助けるため、自動的に「減光」処理されます。',
            help_m1_l6: 'タイトルには打ち消し線が適用され、心理的な達成感を高めます。',
            help_m1_l7: '完了データはISO形式で厳密に管理され、メトリクス画面での正確な分析ソースとなります。',
            help_m2_t: '2. 高度な親子関係と階層化',
            help_m2_d: 'MonoFlowは「Parent-Child」の2階層構造を厳格に維持することで、強力な整理機能を提供します。',
            help_m2_h1: '仮想親チケット (Context Ghost)',
            help_m2_l1: '子タスクが親と異なるカラムにある場合、親の「残像」が表示されます。これにより、作業中に「この作業は何のプロジェクトの一部か」という文脈を失わずに済みます。',
            help_m2_h2: '仮想子チケット (Subtask Preview)',
            help_m2_l2: '親タスクの下には、他レーンに散らばっている全子タスクの状況がコンパクトなリストとして集約されます。',
            help_m2_h3: 'ジャンプ＆フラッシュ',
            help_m2_l3: '仮想チケットをクリックすると、実体のある場所まで一瞬でスクロールし、青く「フラッシュ」して強調します。',
            help_m2_extra: '親タスクにはサブタスク全体の消化率とプログレスバーが表示され、プロジェクト全体の健康状態を可視化します。',
            help_m2_l4: '<strong>階層の制限:</strong> 管理の複雑化を防ぐため、ネストは2層までに制限しています。すでに子を持つタスクを親に指定することはできません。',
            help_m3_t: '3. 検索と動的フィルタリング',
            help_m3_d: '数千のタスクの中から、必要な情報だけを抽出するための複数のアプローチを用意しています。',
            help_m3_h1: '全文リアルタイム検索',
            help_m3_l1: 'タイトルだけでなく「詳細メモ」の内容も検索対象です。入力と同時にボードがフィルタリングされます。',
            help_m3_h2: 'マルチレイヤー・フィルタ',
            help_m3_l2: '特定のラベルかつ高優先度のみを表示するなど、複数の条件を組み合わせた詳細な絞り込みが可能です。',
            help_m3_extra: '注：フィルタ適用中はデータの安全性を守るため、ドラッグ＆ドロップが一時的に無効化されます。',
            help_m4_t: '4. 進捗分析とデータサイエンス',
            help_m4_d: '活動履歴を数値化し、自分の仕事のリズムやキャパシティを客観的に把握できます。',
            help_m4_h1: 'Metrics (指標分析)',
            help_m4_l1: '<strong>リードタイム:</strong> タスク作成から完了までにかかった時間の平均。自分の見積もり精度を高める指標になります。',
            help_m4_h2: 'Burndown (燃焼図)',
            help_m4_l2: '<strong>理想線と実績線:</strong> 点線の理想線に対し、青い実績線が上にある場合は遅延、下にある場合は計画より早く進んでいることを示します。',
            help_m4_h3: 'アーカイブ仕様',
            help_m4_l3: 'アーカイブは削除ではなく「整理棚」です。完了タスクを視界から消しつつ、統計データには実績を残します。復元時は元のカラムへ正確に戻ります。',
            help_m4_privacy_t: 'データプライバシー',
            help_m4_privacy_d: 'データは100%あなたのブラウザ（LocalStorage）にのみ保存されます。外部サーバーへの送信は一切行われないため、機密情報も安全に管理できます。',
            help_m5_t: '5. カスタマイズと効率化',
            help_m5_h1: 'ダークモード',
            help_m5_l1: '月アイコンをクリックして切り替え。夜間や長時間作業での目の疲労を軽減し、集中力を維持します。',
            help_m5_h2: '完全なバックアップ',
            help_m5_l2: 'エクスポート機能は、タスクだけでなくラベル設定や言語・テーマ設定もすべて含めたJSONを出力します。',
            help_shortcuts_t: 'キーボードショートカット',
            help_shortcuts_n: '新規タスク入力にフォーカス',
            help_shortcuts_search: '検索窓にフォーカス',
            help_shortcuts_esc: '閉じる / フォーカスを外す',
            help_shortcuts_help: 'ヘルプページを表示',
            help_shortcuts_metrics: 'Metrics ページへ移動 (Alt / ⌥)',
            help_shortcuts_burndown: 'Burndown ページへ移動 (Alt / ⌥)',
            help_shortcuts_board: 'ボード画面へ移動 (Alt / ⌥)',
            help_footer: 'MonoFlow Productivity System - Built for High-Performance Personal Kanban',
            notify_title: '通知センター',
            notify_overdue: '期限切れ',
            notify_due_today: '今日の期限',
            notify_none: '緊急のタスクはありません',
            about_title: 'MonoFlow',
            about_link: 'What is MonoFlow?',
            about_subtitle: 'ミニマルで強力な個人用カンバン',
            about_concept_t: 'コンセプト',
            about_concept_d: 'MonoFlowは、個人の生産性を最大化するために設計された、ブラウザ完結型のカンバンツールです。複雑な設定やサーバーは不要。開いた瞬間から、あなたの思考をフロー状態へと導きます。',
            about_features_t: '主な特徴',
            about_f1_t: 'プライバシー第一',
            about_f1_d: 'データは100%ローカル（あなたのブラウザ）に保存されます。外部サーバーへの送信は一切ありません。',
            about_f2_t: '高度な親子関係',
            about_f2_d: '仮想チケットシステムにより、レーンをまたいだ複雑なプロジェクト構造も直感的に把握できます。',
            about_f3_t: '分析機能',
            about_f3_d: 'メトリクスとバーンダウンチャートで、自分のパフォーマンスを客観的に評価できます。'
        },
        en: {
            app_desc: 'Simple Personal Kanban',
            back_to_app: 'Back to Board',
            filter_label: 'Label',
            filter_all: 'All Labels',
            filter_priority_all: 'All Priorities',
            add_placeholder: 'Add a new task...',
            add_btn: 'Add',
            search_placeholder: 'Search...',
            menu_board: 'Board',
            menu_export: 'Export (JSON)',
            menu_import: 'Import',
            menu_metrics: 'Metrics',
            menu_burndown: 'Burndown',
            menu_archive: 'Archive',
            menu_about: 'About',
            menu_help: 'User Guide',
            menu_reset: 'Reset Board',
            switch_lang: 'Switch Language',
            toggle_theme: 'Toggle Theme',
            modal_title: 'Task Details',
            modal_label_title: 'Title',
            modal_label_priority: 'Priority',
            modal_label_tags: 'Labels',
            modal_label_new_tag: 'New Label Name',
            modal_btn_add_tag: 'Add',
            modal_label_parent: 'Parent Task',
            modal_label_none: '(None)',
            modal_parent_restricted: 'Cannot set parent (has children)',
            modal_label_desc: 'Notes',
            modal_label_blocker: 'Blockers (Dependencies)',
            modal_btn_add_blocker: 'Add',
            warn_blocker_incomplete: 'The following blocking tasks are incomplete:\n\n{tasks}\n\nDo you still want to mark this as Done?',
            modal_label_date: 'Due Date',
            modal_btn_cancel: 'Cancel',
            modal_btn_save: 'Save',
            modal_btn_archive: 'Archive',
            modal_btn_unarchive: 'Restore to Board',
            col_todo: 'To Do',
            col_progress: 'In Progress',
            col_done: 'Done',
            task_created: 'Created',
            task_updated: 'Updated',
            task_completed: 'Done',
            stale_task: 'Stale task (no updates for 7+ days)',
            confirm_delete: 'Delete this task?',
            confirm_reset_1: '[WARNING] Are you sure you want to delete ALL tasks?\nThis cannot be undone.',
            confirm_reset_2: 'Are you absolutely sure?\nWe strongly recommend exporting a backup first.',
            reset_done: 'Board has been reset.',
            import_done: 'Import successful.',
            import_fail: 'Import failed.',
            welcome_title: 'Welcome to MonoFlow',
            welcome_desc: 'This is a sample task.',
            metrics_title: 'MonoFlow',
            metrics_subtitle: 'Analytics & Progress',
            metrics_period: 'Period',
            metrics_total: 'Total Tasks',
            metrics_rate: 'Comp. Rate',
            metrics_avg: 'Avg Lead Time',
            metrics_cycle_time: 'Avg. Cycle Time',
            metrics_est_finish: 'Est. Completion',
            metrics_done: 'Total Done',
            metrics_dist: 'Status Distribution',
            metrics_prio_dist: 'Priority Distribution',
            metrics_throughput: 'Throughput Trend',
            metrics_tasks_left: 'Tasks Remaining',
            metrics_label_select: 'Select Labels',
            metrics_clear: 'Clear',
            unit_days: 'days',
            unit_hours: 'hours',
            burndown_title: 'MonoFlow',
            burndown_subtitle: 'Work Remaining Over Time',
            burndown_period: 'Date Range',
            burndown_deadline: 'Target Deadline',
            burndown_trend: 'Work Remaining Trend',
            burndown_scope_add: 'New Tasks',
            burndown_scope_done: 'Completed',
            burndown_forecast: 'Forecast',
            burndown_current: 'Now',
            help_title: 'MonoFlow',
            help_subtitle: 'Operating Manual',
            help_quick: 'Quick Start',
            help_manual: 'Detailed Manual',
            help_q1_t: 'Create Task',
            help_q1_d: 'Type your task in the input field and press Enter. A ticket is created instantly.',
            help_q2_t: 'Manage Progress',
            help_q2_d: 'Drag cards between lanes. Moving to Done automatically adds a completion timestamp.',
            help_q3_t: 'Add Details',
            help_q3_d: 'Click a card to open the details panel. Set priority, notes, labels, and deadlines.',
            help_new_features_t: 'New: Dependencies & Stale Tasks',
            help_nf_stale_h: 'Stale Task Detection',
            help_nf_stale_d: 'Tasks inactive in the "To Do" lane for over a week will show a "Wind/Dust" icon. Archive them if not needed.',
            help_nf_blocker_h: 'Blockers (Dependencies)',
            help_nf_blocker_d: 'Set tasks that must be finished first. Hover over the link icon to see a flowing animation coming from the dependencies, clearly indicating the order of work.',
            help_m1_t: '1. Task Card Structure',
            help_m1_d: 'MonoFlow task cards are designed to prioritize information and provide an immediate overview.',
            help_m1_h1: 'Visual Indicators',
            help_m1_l1: '<strong>Priority Accents:</strong> Border colors represent High (Red), Med (Orange), and Low (Blue) importance.',
            help_m1_l2: '<strong>Dynamic Timestamps:</strong> Both created and last-updated times are automatically tracked.',
            help_m1_l3: '<strong>Note Preview:</strong> Shows the first two lines of your notes, providing context without cluttering.',
            help_m1_l4: '<strong>Status Badges:</strong> Overdue deadlines are highlighted in red to ensure visibility.',
            help_m1_h2: 'Completion Behavior',
            help_m1_l5: 'Tasks in the Done lane are dimmed. This intentional "gray-out" helps you focus on active, incomplete tasks.',
            help_m1_l6: 'Titles are struck through to provide a psychological sense of accomplishment.',
            help_m1_l7: 'Completion times are recorded in ISO format for accurate reporting in the Metrics dashboard.',
            help_m2_t: '2. Hierarchy & Smart Nesting',
            help_m2_d: 'MonoFlow uses a strict Parent-Child structure to keep your workflow simple yet effective.',
            help_m2_h1: 'Virtual Parent (Context Ghost)',
            help_m2_l1: 'If a subtask is moved to a different column than its parent, a placeholder of the parent is shown to maintain context.',
            help_m2_h2: 'Virtual Child (Subtask Preview)',
            help_m2_l2: 'Under a parent task, all subtasks located in other lanes are shown as a compact, aggregated list.',
            help_m2_h3: 'Jump & Flash Navigation',
            help_m2_l3: 'Click any virtual card to instantly scroll to and highlight the real task, preventing navigation friction.',
            help_m2_extra: 'Parents display a progress percentage and bar based on the completion of all their subtasks.',
            help_m2_l4: '<strong>Hierarchy Limit:</strong> To prevent over-complication, tasks are limited to 2 levels. Tasks with children cannot be assigned a parent.',
            help_m3_t: '3. Search & Advanced Filtering',
            help_m3_d: 'Quickly find what you need, even when managing thousands of tasks.',
            help_m3_h1: 'Full-text Search',
            help_m3_l1: 'Search queries check both "Titles" and "Notes" simultaneously as you type.',
            help_m3_h2: 'Multi-layer Filtering',
            help_m3_l2: 'Combine label selections and priority filters for focused work sessions.',
            help_m3_extra: 'Note: Drag & Drop is temporarily disabled while filters are active to prevent data corruption.',
            help_m4_t: '4. Analytics & Productivity Science',
            help_m4_d: 'MonoFlow turns your task history into actionable data to help you evaluate performance.',
            help_m4_h1: 'Key Metrics',
            help_m4_l1: '<strong>Average Lead Time:</strong> The average time from creation to completion. Essential for capacity planning.',
            help_m4_h2: 'Burndown Dynamics',
            help_m4_l2: 'Compare Actual work against the Ideal Line to detect project delays early.',
            help_m4_h3: 'Archive Logic',
            help_m4_l3: 'Archiving is a "storage shelf" rather than deletion. It hides tasks but preserves data for historical metrics.',
            help_m4_privacy_t: 'Data Privacy',
            help_m4_privacy_d: 'All data stays in your browser\'s LocalStorage. Privacy is guaranteed.',
            help_m5_t: '5. Customization & Efficiency',
            help_m5_h1: 'Dark Mode',
            help_m5_l1: 'Integrated support for a sleek dark theme, reducing eye strain.',
            help_m5_h2: 'Full Backups',
            help_m5_l2: 'Exports generate a JSON including tasks, labels, language settings, and theme preferences.',
            help_shortcuts_t: 'Keyboard Shortcuts',
            help_shortcuts_n: 'Focus New Task Input',
            help_shortcuts_search: 'Focus Search Bar',
            help_shortcuts_esc: 'Close / Blur Input',
            help_shortcuts_help: 'Show Help Page',
            help_shortcuts_metrics: 'Go to Metrics Page (Alt / ⌥)',
            help_shortcuts_burndown: 'Go to Burndown Page (Alt / ⌥)',
            help_shortcuts_board: 'Go to Board (Alt / ⌥)',
            help_footer: 'MonoFlow Productivity System - Built for High-Performance Personal Kanban',
            notify_title: 'Notification Center',
            notify_overdue: 'Overdue',
            notify_due_today: 'Due Today',
            notify_none: 'No urgent tasks found',
            about_title: 'MonoFlow',
            about_link: 'What is MonoFlow?',
            about_subtitle: 'Minimal yet Powerful Personal Kanban',
            about_concept_t: 'Concept',
            about_concept_d: 'MonoFlow is a browser-based Kanban tool designed to maximize individual productivity. No complex setup or servers required. From the moment you open it, it guides your thoughts into a flow state.',
            about_features_t: 'Key Features',
            about_f1_t: 'Privacy First',
            about_f1_d: '100% of your data is stored locally in your browser. No data is ever sent to external servers.',
            about_f2_t: 'Advanced Hierarchy',
            about_f2_d: 'The Virtual Ticket system allows you to intuitively grasp complex project structures across multiple lanes.',
            about_f3_t: 'Built-in Analytics',
            about_f3_d: 'Evaluate your performance objectively with integrated Metrics and Burndown charts.'
        }
    },

    t: (key) => (Common.I18N[State.language] && Common.I18N[State.language][key]) || key,

    parseDate: (dateStr) => {
        if (!dateStr) return null;
        const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(/-/g, '/');
        const d = new Date(normalized);
        return isNaN(d.getTime()) ? null : d;
    },

    toDateKey: (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    init: () => {
        State.language = localStorage.getItem(CONSTANTS.LANG_KEY) || (navigator.language.startsWith('ja') ? 'ja' : 'en');
        State.theme = localStorage.getItem(CONSTANTS.THEME_KEY) || 'light';
        Common.applyTheme();

        document.addEventListener('click', (e) => {
            const settingsMenu = document.getElementById('settings-menu');
            const notifyMenu = document.getElementById('notify-menu');
            if (settingsMenu && !settingsMenu.classList.contains('hidden')) {
                if (!e.target.closest('#settings-menu') && !e.target.closest('[onclick*="toggleMenu"]')) { settingsMenu.classList.add('hidden'); }
            }
            if (notifyMenu && !notifyMenu.classList.contains('hidden')) {
                if (!e.target.closest('#notify-menu') && !e.target.closest('[onclick*="toggleNotifications"]')) { notifyMenu.classList.add('hidden'); }
            }
        });
        NotificationService.updateBadge();
    },

    applyTheme: () => {
        const dark = State.theme === 'dark';
        document.documentElement.classList.toggle('dark', dark);
        const lIcon = document.getElementById('theme-icon-light');
        const dIcon = document.getElementById('theme-icon-dark');
        if (lIcon) lIcon.classList.toggle('hidden', !dark);
        if (dIcon) dIcon.classList.toggle('hidden', dark);
    },

    toggleTheme: () => { State.theme = State.theme === 'light' ? 'dark' : 'light'; localStorage.setItem(CONSTANTS.THEME_KEY, State.theme); Common.applyTheme(); },
    toggleMenu: (e) => { if (e) { e.preventDefault(); e.stopPropagation(); } const menu = document.getElementById('settings-menu'); if (menu) menu.classList.toggle('hidden'); },
    setLanguage: (lang) => { State.language = lang; localStorage.setItem(CONSTANTS.LANG_KEY, lang); location.reload(); },

    // Shared Trans Helper
    setT: (id, key) => { const el = document.getElementById(id); if (el) el.innerHTML = Common.t(key); },
    setAttr: (id, attr, key) => { const el = document.getElementById(id); if (el) el.setAttribute(attr, Common.t(key)); }
};

const DataService = {
    load: () => {
        const saved = localStorage.getItem(CONSTANTS.STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    },
    save: (data) => localStorage.setItem(CONSTANTS.STORAGE_KEY, JSON.stringify(data)),

    export: () => {
        const fullState = {
            data: DataService.load(),
            lang: localStorage.getItem(CONSTANTS.LANG_KEY),
            theme: localStorage.getItem(CONSTANTS.THEME_KEY),
            version: 'v10-unified'
        };
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(fullState, null, 2)], { type: "application/json" }));
        a.download = `monoflow-backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
    },

    import: (input) => {
        const file = input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                const data = imported.data || (imported.tasks ? imported : null);
                if (data) {
                    DataService.save(data);
                    if (imported.lang) localStorage.setItem(CONSTANTS.LANG_KEY, imported.lang);
                    if (imported.theme) localStorage.setItem(CONSTANTS.THEME_KEY, imported.theme);
                    location.reload();
                } else { throw new Error(); }
            } catch (err) { alert(Common.t('import_fail')); }
            input.value = '';
        };
        reader.readAsText(file);
    },

    resetAll: () => {
        if (!confirm(Common.t('confirm_reset_1')) || !confirm(Common.t('confirm_reset_2'))) return;
        localStorage.removeItem(CONSTANTS.STORAGE_KEY);
        location.reload();
    }
};

const NotificationService = {
    getUrgentTasks: () => {
        const data = DataService.load();
        if (!data) return { overdue: [], dueToday: [] };
        const tasks = Object.values(data.tasks);
        const todayStr = Common.toDateKey(new Date());
        const doneIds = new Set(data.columns[CONSTANTS.DONE_COLUMN_ID]?.taskIds || []);
        return {
            overdue: tasks.filter(t => !t.archived && !doneIds.has(t.id) && t.dueDate && t.dueDate < todayStr),
            dueToday: tasks.filter(t => !t.archived && !doneIds.has(t.id) && t.dueDate === todayStr)
        };
    },
    updateBadge: () => {
        const { overdue, dueToday } = NotificationService.getUrgentTasks();
        const total = overdue.length + dueToday.length;
        const badge = document.getElementById('notify-badge');
        if (badge) { badge.textContent = total; badge.classList.toggle('hidden', total === 0); }
    },
    toggleNotifications: (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const menu = document.getElementById('notify-menu'); if (!menu) return;
        if (menu.classList.contains('hidden')) { NotificationService.renderList(); menu.classList.remove('hidden'); } else { menu.classList.add('hidden'); }
    },
    renderList: () => {
        const { overdue, dueToday } = NotificationService.getUrgentTasks();
        const container = document.getElementById('notify-list'); if (!container) return;
        if (!overdue.length && !dueToday.length) { container.innerHTML = `<p class="text-center text-slate-400 py-8 text-sm">${Common.t('notify_none')}</p>`; return; }
        let html = '';
        const renderItem = (t, labelClass, labelText) => `<div onclick="NotificationService.jumpTo('${t.id}')" class="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 group"><div class="flex items-center gap-2 mb-1"><span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${labelClass}">${Common.t(labelText)}</span><span class="text-[10px] font-bold text-slate-400">${t.dueDate}</span></div><div class="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors truncate">${t.content}</div></div>`;
        overdue.forEach(t => html += renderItem(t, 'bg-red-100 text-red-600 dark:bg-red-900/30', 'notify_overdue'));
        dueToday.forEach(t => html += renderItem(t, 'bg-orange-100 text-orange-600 dark:bg-orange-900/30', 'notify_due_today'));
        container.innerHTML = html;
    },
    jumpTo: (taskId) => {
        const isBoard = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
        if (isBoard && typeof App !== 'undefined' && App.jumpToTask) { App.jumpToTask(taskId); const m = document.getElementById('notify-menu'); if (m) m.classList.add('hidden'); }
        else { window.location.href = `index.html?jumpTaskId=${taskId}`; }
    }
};

// Global Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') { if (e.key === 'Escape') e.target.blur(); return; }
    if (e.altKey) {
        if (e.code === 'KeyM') { e.preventDefault(); window.location.href = 'metrics.html'; }
        else if (e.code === 'KeyB') { e.preventDefault(); window.location.href = 'burndown.html'; }
        else if (e.code === 'KeyA') { e.preventDefault(); window.location.href = 'about.html'; }
        else if (e.code === 'KeyL') { e.preventDefault(); window.location.href = 'index.html'; }
    }
    if (e.key === '?') { window.location.href = 'help.html'; }
});

if (typeof module !== 'undefined') {
    module.exports = { DataService, Common, CONSTANTS, State, NotificationService };
} else {
    Common.init();
}
