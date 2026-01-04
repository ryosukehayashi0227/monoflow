/**
 * MonoFlow About Page Localization Logic
 */

function translateUI() {
    const t = (id, key) => Common.setT(id, key);
    const a = (id, attr, key) => Common.setAttr(id, attr, key);
    t('brand-title', 'about_title'); t('brand-subtitle', 'about_subtitle');
    t('nav-board', 'menu_board'); t('nav-metrics', 'menu_metrics'); t('nav-burndown', 'menu_burndown');
    t('about-link', 'about_link');
    t('footer-text', 'help_footer');
    a('help-btn', 'title', 'menu_help');
    a('lang-btn', 'title', 'switch_lang');
    a('theme-btn', 'title', 'toggle_theme');
    
    t('about-concept-title', 'about_concept_t'); t('about-concept-desc', 'about_concept_d');
    t('about-features-title', 'about_features_t');
    t('about-f1-title', 'about_f1_t'); t('about-f1-desc', 'about_f1_d');
    t('about-f2-title', 'about_f2_t'); t('about-f2-desc', 'about_f2_d');
    t('about-f3-title', 'about_f3_t'); t('about-f3-desc', 'about_f3_d');
}

document.addEventListener('DOMContentLoaded', () => { translateUI(); lucide.createIcons(); });
