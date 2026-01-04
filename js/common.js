/**
 * MonoFlow - Common Shared Logic (i18n, Theme, Data)
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
    ],
    I18N: {
        ja: {
            app_desc: 'Simple Personal Kanban',
            back_to_app: 'アプリに戻る',
            filter_label: 'ラベル',
            filter_all: 'すべてのラベル',
            filter_priority_all: 'すべての優先度',
            add_placeholder: '新しいタスクを入力...', 
            add_btn: '追加',
            search_placeholder: '検索...',
            menu_export: 'エクスポート (JSON)',
            menu_import: 'インポート',
            menu_metrics: 'Metrics',
            menu_burndown: 'Burndown',
            menu_archive: 'アーカイブ',
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
            modal_btn_archive: 'アーカイブする',
            modal_btn_unarchive: 'ボードに戻す',
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
            welcome_title: 'Welcome to MonoFlow',
            welcome_desc: 'これはサンプルタスクです。',
            // Metrics Page
            metrics_title: 'Metrics',
            metrics_subtitle: '分析と進捗',
            metrics_period: '期間',
            metrics_total: '全タスク数',
            metrics_rate: '完了率',
            metrics_avg: '平均完了日数',
            metrics_done: '合計完了数',
            metrics_dist: 'ステータス分布',
            metrics_prio_dist: '優先度別の分布',
            metrics_label_select: 'ラベルを選択',
            metrics_clear: 'クリア',
            // Burndown Page
            burndown_title: 'Burndown Chart',
            burndown_subtitle: '時間経過による残仕事量',
            burndown_period: '表示期間',
            burndown_trend: '残タスク数の推移',
            burndown_current: '現在',
            burndown_actual: '実際の残りタスク',
            burndown_ideal: '理想的な進捗',
            // Help Page
            help_title: 'User Guide',
            help_subtitle: '操作マニュアル',
            help_quick: 'クイックスタート',
            help_manual: '詳細マニュアル',
            help_q1_t: 'タスクの作成',
            help_q1_d: '上部の大きな入力欄に内容を書き込み Enter を押すだけ。瞬時にチケットが発行されます。',
            help_q2_t: '進捗の管理',
            help_q2_d: 'カードをドラッグしてレーン間を移動。Doneへ移動させると「完了スタンプ」が自動で押されます。',
            help_q3_t: '情報の詳細化',
            help_q3_d: 'カードをクリックして詳細パネルへ。優先度の設定、メモの追記、ラベルでの分類が行えます。',
            help_m1_t: '1. タスクカードの構造',
            help_m1_d: 'MonoFlowのタスクカードは、限られたスペースに多くの情報を凝縮して表示するように設計されています。',
            help_m1_l1: '優先度アクセント: カード左端の太いラインで重要度を表現。',
            help_m1_l2: 'タイムスタンプ: 右下に作成日時と最終更新日時を自動表示。',
            help_m1_l3: 'メモプレビュー: タイトルの下に詳細メモの冒頭2行を自動でプレビュー。',
            help_m2_t: '2. 高度な親子関係と「仮想チケット」',
            help_m2_d: '複雑なタスクをサブタスクに分割して管理できます。MonoFlow独自の「仮想チケット」システムが情報の断絶を防ぎます。',
            help_m2_l1: '仮想親チケット: 子タスクが親と別のレーンにあるとき、親の「残像」が表示されます。',
            help_m2_l2: '仮想子チケット: 親の下には、他レーンに散らばった子タスクの状況が一覧表示されます。',
            help_m2_l3: 'ジャンプ機能: 仮想チケットをクリックすると、実体のある場所まで自動スクロールします。',
            help_m3_t: '3. 検索とフィルタリング',
            help_m3_d: '全文検索とマルチフィルタを組み合わせて、目的のタスクを瞬時に見つけ出せます。',
            help_m4_t: '4. 分析とデータ管理',
            help_m4_d: 'データはすべてローカルに保存されます。MetricsやBurndownで進捗を分析可能です。',
            help_m5_t: '5. カスタマイズ',
            help_m5_d: 'ダークモードや多言語表示に対応。自分に最適な環境で作業できます。'
        },
        en: {
            app_desc: 'Simple Personal Kanban',
            back_to_app: 'Back to App',
            filter_label: 'Label',
            filter_all: 'All Labels',
            filter_priority_all: 'All Priorities',
            add_placeholder: 'Add a new task...', 
            add_btn: 'Add',
            search_placeholder: 'Search...',
            menu_export: 'Export (JSON)',
            menu_import: 'Import',
            menu_metrics: 'Metrics',
            menu_burndown: 'Burndown',
            menu_archive: 'Archive',
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
            modal_btn_archive: 'Archive',
            modal_btn_unarchive: 'Restore to Board',
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
            welcome_desc: 'This is a sample task.',
            // Metrics Page
            metrics_title: 'Metrics',
            metrics_subtitle: 'Analytics & Progress',
            metrics_period: 'Period',
            metrics_total: 'Total Tasks',
            metrics_rate: 'Comp. Rate',
            metrics_avg: 'Avg Lead Time',
            metrics_done: 'Total Done',
            metrics_dist: 'Status Distribution',
            metrics_prio_dist: 'Priority Distribution',
            metrics_label_select: 'Select Labels',
            metrics_clear: 'Clear',
            // Burndown Page
            burndown_title: 'Burndown Chart',
            burndown_subtitle: 'Work Remaining Over Time',
            burndown_period: 'Date Range',
            burndown_trend: 'Work Remaining Trend',
            burndown_current: 'Now',
            burndown_actual: 'Actual Remaining',
            burndown_ideal: 'Ideal Progress',
            // Help Page
            help_title: 'User Guide',
            help_subtitle: 'Operating Manual',
            help_quick: 'Quick Start',
            help_manual: 'Detailed Manual',
            help_q1_t: 'Create Task',
            help_q1_d: 'Simply type in the large input field at the top and press Enter. A ticket is created instantly.',
            help_q2_t: 'Manage Progress',
            help_q2_d: 'Drag and drop cards between lanes. Moving to Done automatically adds a completion timestamp.',
            help_q3_t: 'Add Details',
            help_q3_d: 'Click a card to open the details panel. Set priority, add notes, and categorize with labels.',
            help_m1_t: '1. Task Card Structure',
            help_m1_d: 'MonoFlow task cards are designed to condense a lot of information into a limited space.',
            help_m1_l1: 'Priority Accent: Colored left border indicates importance level.',
            help_m1_l2: 'Timestamps: Created and updated times are automatically displayed.',
            help_m1_l3: 'Note Preview: First two lines of notes are shown below the title.',
            help_m2_t: '2. Hierarchy & Virtual Tasks',
            help_m2_d: 'Divide complex tasks into subtasks. MonoFlow\'s unique "Virtual Ticket" system prevents information loss.',
            help_m2_l1: 'Virtual Parent: Shows a placeholder of the parent when it\'s in a different lane.',
            help_m2_l2: 'Virtual Child: Shows a compact list of subtasks located in other lanes.',
            help_m2_l3: 'Jump Feature: Click any virtual ticket to instantly scroll to the real one.',
            help_m3_t: '3. Search & Filtering',
            help_m3_d: 'Combine full-text search and multi-filters to find any task instantly.',
            help_m4_t: '4. Analytics & Data Management',
            help_m4_d: 'All data is stored locally. Analyze progress with Metrics and Burndown charts.',
            help_m5_t: '5. Customization',
            help_m5_d: 'Support for dark mode and multiple languages. Work in your preferred environment.'
        }
    }
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
    t: (key) => (CONSTANTS.I18N[State.language] && CONSTANTS.I18N[State.language][key]) || key,
    
    init: () => {
        State.language = localStorage.getItem(CONSTANTS.LANG_KEY) || (navigator.language.startsWith('ja') ? 'ja' : 'en');
        State.theme = localStorage.getItem(CONSTANTS.THEME_KEY) || 'light';
        Common.applyTheme();
    },

    applyTheme: () => {
        const dark = State.theme === 'dark';
        document.documentElement.classList.toggle('dark', dark);
        const lightIcon = document.getElementById('theme-icon-light');
        const darkIcon = document.getElementById('theme-icon-dark');
        if (lightIcon) lightIcon.classList.toggle('hidden', !dark);
        if (darkIcon) darkIcon.classList.toggle('hidden', dark);
    },

    toggleTheme: () => {
        State.theme = State.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem(CONSTANTS.THEME_KEY, State.theme);
        Common.applyTheme();
    },

    setLanguage: (lang) => {
        State.language = lang;
        localStorage.setItem(CONSTANTS.LANG_KEY, lang);
        location.reload(); 
    }
};

// Auto-init common logic
Common.init();