/**
 * MonoFlow About Page Localization Logic
 */

function translateUI() {
    const setT = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.textContent = Common.t(key);
    };

    setT('about-page-title', 'about_title');
    setT('about-page-subtitle', 'about_subtitle');
    setT('about-link', 'about_link');
    setT('back-to-app-text', 'back_to_app');

    setT('about-concept-title', 'about_concept_t');
    setT('about-concept-desc', 'about_concept_d');

    setT('about-features-title', 'about_features_t');
    setT('about-f1-title', 'about_f1_t');
    setT('about-f1-desc', 'about_f1_d');
    setT('about-f2-title', 'about_f2_t');
    setT('about-f2-desc', 'about_f2_d');
    setT('about-f3-title', 'about_f3_t');
    setT('about-f3-desc', 'about_f3_d');

    setT('help-footer-text', 'help_footer');
}

document.addEventListener('DOMContentLoaded', () => {
    translateUI();
    lucide.createIcons();
});
