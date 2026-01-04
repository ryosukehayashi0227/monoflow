/**
 * MonoFlow Help Page Localization Logic
 */

function translateUI() {
    // Header
    document.querySelector('h1').textContent = Common.t('help_title');
    document.querySelector('h1 + p').textContent = Common.t('help_subtitle');
    document.querySelector('a[href="index.html"] span').textContent = Common.t('back_to_app');

    // Sections
    const h2s = document.querySelectorAll('h2');
    h2s[0].innerHTML = `<i data-lucide="zap" class="w-8 h-8 text-blue-600 fill-blue-600/20"></i> ${Common.t('help_quick')}`;
    h2s[1].innerHTML = `<i data-lucide="book-open" class="w-8 h-8 text-blue-600 fill-blue-600/20"></i> ${Common.t('help_manual')}`;

    // Quick Start Cards
    const quickCards = document.querySelectorAll('.grid > div.bg-white');
    const qTitles = ['help_q1_t', 'help_q2_t', 'help_q3_t'];
    const qDescs = ['help_q1_d', 'help_q2_d', 'help_q3_d'];
    
    quickCards.forEach((card, i) => {
        card.querySelector('h3').textContent = Common.t(qTitles[i]);
        card.querySelector('p').textContent = Common.t(qDescs[i]);
    });

    // Detailed Manual Sections
    const manualCards = document.querySelectorAll('.feature-card');
    manualCards[0].querySelector('h3').textContent = Common.t('help_m1_t');
    manualCards[0].querySelector('p').textContent = Common.t('help_m1_d');
    
    const listItems = manualCards[0].querySelectorAll('li');
    listItems[0].innerHTML = `<strong>${Common.t('modal_label_priority')}:</strong> ${Common.t('help_m1_l1')}`;
    listItems[1].innerHTML = `<strong>${Common.t('task_created')}/${Common.t('task_updated')}:</strong> ${Common.t('help_m1_l2')}`;
    listItems[2].innerHTML = `<strong>${Common.t('modal_label_desc')}:</strong> ${Common.t('help_m1_l3')}`;

    manualCards[1].querySelector('h3').textContent = Common.t('help_m2_t');
    manualCards[1].querySelector('p').textContent = Common.t('help_m2_d');
    
    const m2ListItems = manualCards[1].querySelectorAll('.p-6 p');
    m2ListItems[0].textContent = Common.t('help_m2_l1');
    m2ListItems[1].textContent = Common.t('help_m2_l2');
    m2ListItems[2].textContent = Common.t('help_m2_l3');

    manualCards[2].querySelector('h3').textContent = Common.t('help_m3_t');
    manualCards[2].querySelector('p').textContent = Common.t('help_m3_d');

    manualCards[3].querySelector('h3').textContent = Common.t('help_m4_t');
    manualCards[3].querySelector('p').textContent = Common.t('help_m4_d');

    manualCards[4].querySelector('h3').textContent = Common.t('help_m5_t');
    manualCards[4].querySelector('p').textContent = Common.t('help_m5_d');
}

document.addEventListener('DOMContentLoaded', () => {
    translateUI();
    lucide.createIcons();
});
