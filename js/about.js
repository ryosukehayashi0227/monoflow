/**
 * MonoFlow - About Page Logic
 * Handles localization and static content rendering for the About page.
 */

const About = {
    // Initialize About Page: Set up translations
    init: () => {
        // Ensure data is loaded to respect language settings
        const data = DataService.load();
        if (data) State.data = data;

        // Set up "Back" link with icon if it exists
        const backLink = document.getElementById('back-link');
        if (backLink) backLink.innerHTML = `<i data-lucide="arrow-left" class="w-4 h-4"></i> ${Common.t('back_to_board')}`;

        // Translate page title and sections
        Common.setT('about-title', 'menu_about');
        Common.setT('about-desc', 'app_desc');
        Common.setT('about-author-title', 'about_author');
        Common.setT('about-stack-title', 'about_stack');
        Common.setT('about-license-title', 'about_license');

        // Translate privacy section
        Common.setT('about-privacy-title', 'about_privacy_title');
        Common.setT('about-privacy-content', 'about_privacy_content');

        // Translate external links
        Common.setT('about-repo-link', 'about_repo');

        // Initialize icons
        lucide.createIcons();
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', About.init);
