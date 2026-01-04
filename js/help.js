/**
 * MonoFlow Help Page Localization Logic - Exhaustive Edition
 */

function translateUI() {
    // 1. Header
    document.querySelector('h1').textContent = Common.t('help_title');
    const subtitle = document.querySelector('h1 + p');
    if (subtitle) subtitle.textContent = Common.t('help_subtitle');
    const backBtn = document.querySelector('a[href="index.html"] span');
    if (backBtn) backBtn.textContent = Common.t('back_to_app');

    // 2. Section Headers (h2)
    const h2s = document.querySelectorAll('h2');
    if (h2s.length >= 2) {
        h2s[0].innerHTML = `<i data-lucide="zap" class="w-8 h-8 text-blue-600 fill-blue-600/20"></i> ${Common.t('help_quick')}`;
        h2s[1].innerHTML = `<i data-lucide="book-open" class="w-8 h-8 text-blue-600 fill-blue-600/20"></i> ${Common.t('help_manual')}`;
    }

    // 3. Quick Start Cards
    const quickCards = document.querySelectorAll('.grid > div.bg-white');
    const qKeys = [
        { t: 'help_q1_t', d: 'help_q1_d' },
        { t: 'help_q2_t', d: 'help_q2_d' },
        { t: 'help_q3_t', d: 'help_q3_d' }
    ];
    quickCards.forEach((card, i) => {
        if (qKeys[i]) {
            card.querySelector('h3').textContent = Common.t(qKeys[i].t);
            card.querySelector('p').textContent = Common.t(qKeys[i].d);
        }
    });

    // 4. Detailed Manual Cards
    const manualCards = document.querySelectorAll('.feature-card');
    
    // Card 1: Task Card Structure
    if (manualCards[0]) {
        manualCards[0].querySelector('h3').textContent = Common.t('help_m1_t');
        manualCards[0].querySelector('p').textContent = Common.t('help_m1_d');
        const h4s = manualCards[0].querySelectorAll('h4');
        h4s[0].textContent = Common.t('help_m1_h1');
        h4s[1].textContent = Common.t('help_m1_h2');
        const lis = manualCards[0].querySelectorAll('li');
        const lKeys = ['help_m1_l1', 'help_m1_l2', 'help_m1_l3', 'help_m1_l4', 'help_m1_l5', 'help_m1_l6', 'help_m1_l7'];
        lis.forEach((li, i) => { if(lKeys[i]) li.innerHTML = Common.t(lKeys[i]); });
    }

    // Card 2: Hierarchy
    if (manualCards[1]) {
        manualCards[1].querySelector('h3').textContent = Common.t('help_m2_t');
        manualCards[1].querySelector('p').textContent = Common.t('help_m2_d');
        const h4s = manualCards[1].querySelectorAll('h4');
        h4s[0].textContent = Common.t('help_m2_h1');
        h4s[1].textContent = Common.t('help_m2_h2');
        h4s[2].textContent = Common.t('help_m2_h3');
        h4s[3].textContent = Common.t('metrics_rate'); // Reusing existing key
        const ps = manualCards[1].querySelectorAll('.flex-grow p, div p');
        // Select specific descriptions
        ps[1].textContent = Common.t('help_m2_l1');
        ps[2].textContent = Common.t('help_m2_l2');
        ps[3].textContent = Common.t('help_m2_l3');
        ps[4].textContent = Common.t('help_m2_extra');
    }

    // Card 3: Search
    if (manualCards[2]) {
        manualCards[2].querySelector('h3').textContent = Common.t('help_m3_t');
        manualCards[2].querySelector('p').textContent = Common.t('help_m3_d');
        const h4s = manualCards[2].querySelectorAll('h4');
        h4s[0].innerHTML = `<i data-lucide="search" class="w-5 h-5"></i> ${Common.t('help_m3_h1')}`;
        h4s[1].innerHTML = `<i data-lucide="filter" class="w-5 h-5"></i> ${Common.t('help_m3_h2')}`;
        const ps = manualCards[2].querySelectorAll('p');
        ps[1].textContent = Common.t('help_m3_l1');
        ps[2].textContent = Common.t('help_m3_l2');
    }

    // Card 4: Analytics
    if (manualCards[3]) {
        manualCards[3].querySelector('h3').textContent = Common.t('help_m4_t');
        manualCards[3].querySelector('p').textContent = Common.t('help_m4_d');
        const h4s = manualCards[3].querySelectorAll('h4');
        h4s[0].textContent = Common.t('help_m4_h1');
        h4s[1].textContent = 'Data Privacy'; // Special styled one
        h4s[2].textContent = Common.t('help_m4_h2');
        h4s[3].textContent = Common.t('help_m4_h3');
        const ps = manualCards[3].querySelectorAll('p');
        ps[1].textContent = Common.t('help_m4_l1');
        ps[3].textContent = Common.t('help_m4_l2');
        ps[4].textContent = Common.t('help_m4_l3');
    }

    // Card 5: Settings
    if (manualCards[4]) {
        manualCards[4].querySelector('h3').textContent = Common.t('help_m5_t');
        const h4s = manualCards[4].querySelectorAll('h4');
        h4s[0].textContent = Common.t('help_m5_h1');
        h4s[1].textContent = Common.t('help_m5_h2');
        const ps = manualCards[4].querySelectorAll('p');
        ps[0].textContent = Common.t('help_m5_l1');
        ps[1].textContent = Common.t('help_m5_l2');
    }

    // 5. Footer
    const footerP = document.querySelector('footer p');
    if (footerP) footerP.textContent = Common.t('help_footer');
}

document.addEventListener('DOMContentLoaded', () => {
    translateUI();
    lucide.createIcons();
});