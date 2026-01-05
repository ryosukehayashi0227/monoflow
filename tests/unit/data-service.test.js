import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataService, CONSTANTS } from '../../js/common.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('DataService', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('should save data to localStorage', () => {
        const testData = { tasks: { t1: { id: 't1' } } };
        DataService.save(testData);
        expect(window.localStorage.setItem).toHaveBeenCalledWith(CONSTANTS.STORAGE_KEY, JSON.stringify(testData));
    });

    it('should load data from localStorage', () => {
        const testData = { tasks: { t1: { id: 't1' } } };
        window.localStorage.setItem(CONSTANTS.STORAGE_KEY, JSON.stringify(testData));

        const loaded = DataService.load();
        expect(loaded).toEqual(testData);
    });

    it('should return null if no data in localStorage', () => {
        const loaded = DataService.load();
        expect(loaded).toBeNull();
    });
});
