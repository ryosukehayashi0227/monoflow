import { describe, it, expect } from 'vitest';
import { Common } from '../../js/common.js';

describe('I18N Consistency', () => {
    it('should have matching keys for all languages', () => {
        const languages = Object.keys(Common.I18N);
        const baseLang = 'en'; // Use English as the source of truth
        const baseKeys = Object.keys(Common.I18N[baseLang]).sort();

        languages.forEach(lang => {
            if (lang === baseLang) return;

            const targetKeys = Object.keys(Common.I18N[lang]).sort();

            // Check for missing keys in target language
            const missingKeys = baseKeys.filter(key => !targetKeys.includes(key));
            if (missingKeys.length > 0) {
                console.error(`Missing keys in ${lang}:`, missingKeys);
            }
            expect(missingKeys, `Language '${lang}' is missing keys: ${missingKeys.join(', ')}`).toEqual([]);

            // Check for extra keys in target language (optional, but good for cleanup)
            const extraKeys = targetKeys.filter(key => !baseKeys.includes(key));
            if (extraKeys.length > 0) {
                console.warn(`Extra keys in ${lang}:`, extraKeys);
            }
        });
    });
});
