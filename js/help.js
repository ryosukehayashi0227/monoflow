/**
 * MonoFlow - Help Page Logic
 * Handles detailed manual rendering, dynamic screenshots, and localization.
 */

const Help = {
    // Initialize Help Page
    init: () => {
        const data = DataService.load();
        if (data) State.data = data;

        // "Back" link setup
        const backLink = document.getElementById('back-link');
        if (backLink) backLink.innerHTML = `<i data-lucide="arrow-left" class="w-4 h-4"></i> ${Common.t('back_to_board')}`;

        // Translate Main Headers and Sections
        Common.setT('help-title', 'menu_help');
        Common.setT('help-intro-title', 'help_intro_title');
        Common.setT('help-intro-content', 'help_intro_content');
        Common.setT('help-quick-title', 'help_quick_title');
        Common.setT('help-new-title', 'help_new_title');

        // Translate Manual Steps (Step 1 - Step 5)
        Common.setT('help-step-1', 'help_step_1');
        Common.setT('help-step-2', 'help_step_2');
        Common.setT('help-step-3', 'help_step_3');
        Common.setT('help-step-4', 'help_step_4');
        Common.setT('help-step-5', 'help_step_5');

        // Translate Features List (New Features v1.0)
        Common.setT('help-feature-1', 'help_feature_1');
        Common.setT('help-feature-2', 'help_feature_2');
        Common.setT('help-feature-3', 'help_feature_3');
        Common.setT('help-feature-4', 'help_feature_4');

        // Translate Detailed Manual Content
        const manualKeys = [
            'help_manual_1_title', 'help_manual_1_desc',
            'help_manual_2_title', 'help_manual_2_desc',
            'help_manual_3_title', 'help_manual_3_desc',
            'help_manual_4_title', 'help_manual_4_desc',
            'help_manual_5_title', 'help_manual_5_desc'
        ];
        manualKeys.forEach(k => Common.setT(k.replace(/_/g, '-'), k));

        // Keyboard Shortcuts Section
        Common.setT('help-shortcuts-title', 'help_shortcuts_title');
        Common.setT('help-shortcut-add', 'help_shortcut_add');
        Common.setT('help-shortcut-search', 'help_shortcut_search');
        Common.setT('help-shortcut-esc', 'help_shortcut_esc');

        // Update Screenshots based on Language (Localized screenshots)
        // Checks if current language is 'ja', otherwise defaults to standard images
        const screenshots = document.querySelectorAll('img[data-en-src]');
        screenshots.forEach(img => {
            const isJa = State.language === 'ja';
            const src = isJa ? img.dataset.jaSrc : img.dataset.enSrc;
            if (src) img.src = src;
        });

        lucide.createIcons();
    }
};

document.addEventListener('DOMContentLoaded', Help.init);