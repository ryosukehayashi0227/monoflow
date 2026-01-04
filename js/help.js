/**
 * MonoFlow Help Page Localization Logic - Deep Manual Edition
 */

function translateUI() {
    const t = (id, key) => Common.setT(id, key);
    const a = (id, attr, key) => Common.setAttr(id, attr, key);
    t('brand-title', 'help_title'); t('brand-subtitle', 'help_subtitle');
    t('nav-board', 'menu_board'); t('nav-metrics', 'menu_metrics'); t('nav-burndown', 'menu_burndown');
    t('about-link', 'about_link');
    t('footer-text', 'help_footer');
    a('help-btn', 'title', 'menu_help');
    a('lang-btn', 'title', 'switch_lang');
    a('theme-btn', 'title', 'toggle_theme');
    
    const h2Quick = document.getElementById('help-quick-header');
    if (h2Quick) h2Quick.innerHTML = `<i data-lucide="zap" class="w-8 h-8 text-blue-600 fill-blue-600/20"></i> ${Common.t('help_quick')}`;
    
    const h2Manual = document.getElementById('help-manual-header');
    if (h2Manual) h2Manual.innerHTML = `<i data-lucide="book-open" class="w-8 h-8 text-blue-600 fill-blue-600/20"></i> ${Common.t('help_manual')}`;

    t('help-q1-title', 'help_q1_t'); t('help-q1-desc', 'help_q1_d');
    t('help-q2-title', 'help_q2_t'); t('help-q2-desc', 'help_q2_d');
    t('help-q3-title', 'help_q3_t'); t('help-q3-desc', 'help_q3_d');
    
    // New Features
    const nfHeader = document.getElementById('help-new-features-header');
    if (nfHeader) nfHeader.innerHTML = `<i data-lucide="sparkles" class="w-8 h-8 text-yellow-500 fill-yellow-500/20"></i> ${Common.t('help_new_features_t')}`;
    t('help-nf-blocker-title', 'help_nf_blocker_h'); t('help-nf-blocker-desc', 'help_nf_blocker_d');
    t('help-nf-stale-title', 'help_nf_stale_h'); t('help-nf-stale-desc', 'help_nf_stale_d');

    t('help-m1-title', 'help_m1_t'); t('help-m1-desc', 'help_m1_d');
    t('help-m1-h1', 'help_m1_h1'); t('help-m1-h2', 'help_m1_h2');
    t('help-m1-l1', 'help_m1_l1'); t('help-m1-l2', 'help_m1_l2'); t('help-m1-l3', 'help_m1_l3');
    t('help-m1-l4', 'help_m1_l4'); t('help-m1-l5', 'help_m1_l5'); t('help-m1-l6', 'help_m1_l6'); t('help-m1-l7', 'help_m1_l7');
    t('help-m2-title', 'help_m2_t'); t('help-m2-desc', 'help_m2_d');
    t('help-m2-h1', 'help_m2_h1'); t('help-m2-l1', 'help_m2_l1');
    t('help-m2-h2', 'help_m2_h2'); t('help-m2-l2', 'help_m2_l2');
    t('help-m2-h3', 'help_m2_h3'); t('help-m2-l3', 'help_m2_l3');
    t('help-m2-extra-title', 'metrics_rate'); t('help-m2-extra-desc', 'help_m2_extra');
    t('help-m2-l4', 'help_m2_l4');
    t('help-m3-title', 'help_m3_t'); t('help-m3-desc', 'help_m3_d');
    const m3h1 = document.getElementById('help-m3-h1'); if(m3h1) m3h1.innerHTML = `<i data-lucide="search" class="w-5 h-5"></i> ${Common.t('help_m3_h1')}`;
    const m3h2 = document.getElementById('help-m3-h2'); if(m3h2) m3h2.innerHTML = `<i data-lucide="filter" class="w-5 h-5"></i> ${Common.t('help_m3_h2')}`;
    t('help-m3-l1', 'help_m3_l1'); t('help-m3-l2', 'help_m3_l2'); t('help-m3-extra', 'help_m3_extra');
    t('help-m4-title', 'help_m4_t'); t('help-m4-desc', 'help_m4_d');
    t('help-m4-h1', 'help_m4_h1'); t('help-m4-l1', 'help_m4_l1');
    t('help-m4-h2', 'help_m4_h2'); t('help-m4-l2', 'help_m4_l2');
    t('help-m4-h3', 'help_m4_h3'); t('help-m4-l3', 'help_m4_l3');
    t('help-m4-privacy-title', 'help_m4_privacy_t'); t('help-m4-privacy-desc', 'help_m4_privacy_d');
    t('help-shortcuts-title', 'help_shortcuts_t');
    t('help-shortcuts-n', 'help_shortcuts_n'); t('help-shortcuts-search', 'help_shortcuts_search');
    t('help-shortcuts-esc', 'help_shortcuts_esc'); t('help-shortcuts-help', 'help_shortcuts_help');
    t('help-shortcuts-board', 'help_shortcuts_board'); t('help-shortcuts-metrics', 'help_shortcuts_metrics'); t('help-shortcuts-burndown', 'help_shortcuts_burndown');

    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
        document.querySelectorAll('.kbd').forEach(k => { if (k.textContent === 'Alt') k.textContent = '⌥ Option'; });
    }
    const suffix = State.language === 'en' ? '-en' : '';
    document.querySelectorAll('img.screenshot').forEach(img => {
        const src = img.getAttribute('src');
        img.setAttribute('src', `${src.replace('-en.svg', '').replace('.svg', '')}${suffix}.svg`);
    });
}

document.addEventListener('DOMContentLoaded', () => { translateUI(); lucide.createIcons(); });