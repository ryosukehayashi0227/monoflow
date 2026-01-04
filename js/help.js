/**
 * MonoFlow Help Page Localization Logic - ID Based Edition
 */

function translateUI() {
    // Helper to set text by ID
    const setT = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.textContent = Common.t(key);
    };

    // 1. Header & Basics
    setT('help-page-title', 'help_title');
    setT('help-page-subtitle', 'help_subtitle');
    setT('back-to-app-text', 'back_to_app');
    
    const h2s = document.querySelectorAll('h2');
    if(h2s[0]) h2s[0].innerHTML = `<i data-lucide="zap" class="w-8 h-8 text-blue-600 fill-blue-600/20"></i> ${Common.t('help_quick')}`;
    if(h2s[1]) h2s[1].innerHTML = `<i data-lucide="book-open" class="w-8 h-8 text-blue-600 fill-blue-600/20"></i> ${Common.t('help_manual')}`;

    // 2. Quick Start
    setT('help-q1-title', 'help_q1_t');
    setT('help-q1-desc', 'help_q1_d');
    setT('help-q2-title', 'help_q2_t');
    setT('help-q2-desc', 'help_q2_d');
    setT('help-q3-title', 'help_q3_t');
    setT('help-q3-desc', 'help_q3_d');

    // 3. Detailed Manual - Structure
    setT('help-m1-title', 'help_m1_t');
    setT('help-m1-desc', 'help_m1_d');
    setT('help-m1-h1', 'help_m1_h1');
    setT('help-m1-h2', 'help_m1_h2');
    setT('help-m1-l1', 'help_m1_l1');
    setT('help-m1-l2', 'help_m1_l2');
    setT('help-m1-l3', 'help_m1_l3');
    setT('help-m1-l4', 'help_m1_l4');
    setT('help-m1-l5', 'help_m1_l5');
    setT('help-m1-l6', 'help_m1_l6');
    setT('help-m1-l7', 'help_m1_l7');

    // 4. Detailed Manual - Hierarchy
    setT('help-m2-title', 'help_m2_t');
    setT('help-m2-desc', 'help_m2_d');
    setT('help-m2-h1', 'help_m2_h1');
    setT('help-m2-l1', 'help_m2_l1');
    setT('help-m2-h2', 'help_m2_h2');
    setT('help-m2-l2', 'help_m2_l2');
    setT('help-m2-h3', 'help_m2_h3');
    setT('help-m2-l3', 'help_m2_l3');
    setT('help-m2-extra-title', 'metrics_rate'); 
    setT('help-m2-extra-desc', 'help_m2_extra');

    // 5. Detailed Manual - Search
    setT('help-m3-title', 'help_m3_t');
    setT('help-m3-desc', 'help_m3_d');
    const m3h1 = document.getElementById('help-m3-h1');
    if(m3h1) m3h1.innerHTML = `<i data-lucide="search" class="w-5 h-5"></i> ${Common.t('help_m3_h1')}`;
    const m3h2 = document.getElementById('help-m3-h2');
    if(m3h2) m3h2.innerHTML = `<i data-lucide="filter" class="w-5 h-5"></i> ${Common.t('help_m3_h2')}`;
    setT('help-m3-l1', 'help_m3_l1');
    setT('help-m3-l2', 'help_m3_l2');

    // 6. Detailed Manual - Analytics
    setT('help-m4-title', 'help_m4_t');
    setT('help-m4-desc', 'help_m4_d');
    setT('help-m4-h1', 'help_m4_h1');
    setT('help-m4-l1', 'help_m4_l1');
    setT('help-m4-h2', 'help_m4_h2');
    setT('help-m4-l2', 'help_m4_l2');
    setT('help-m4-h3', 'help_m4_h3');
    setT('help-m4-l3', 'help_m4_l3');
    setT('help-m4-privacy-title', 'help_m4_privacy_t');
    setT('help-m4-privacy-desc', 'help_m4_privacy_d');

    // 7. Detailed Manual - Settings
    setT('help-m5-title', 'help_m5_t');
    setT('help-m5-h1', 'help_m5_h1');
    setT('help-m5-l1', 'help_m5_l1');
    setT('help-m5-h2', 'help_m5_h2');
    setT('help-m5-l2', 'help_m5_l2');

    // Footer
    setT('help-footer-text', 'help_footer');

    // 8. Image Switcher
    const suffix = State.language === 'en' ? '-en' : '';
    document.querySelectorAll('img.screenshot').forEach(img => {
        const src = img.getAttribute('src');
        const base = src.replace('-en.svg', '').replace('.svg', '');
        img.setAttribute('src', `${base}${suffix}.svg`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    translateUI();
    lucide.createIcons();
});
