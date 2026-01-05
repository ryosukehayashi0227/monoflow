import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataService, State, Common, CONSTANTS } from '../../js/common.js';

// Mock DOM elements required by metrics.js
const domMock = {
    textContent: '',
    value: '',
    innerHTML: '',
    addEventListener: vi.fn(),
    querySelector: vi.fn(() => ({ textContent: '' })),
    querySelectorAll: vi.fn(() => []),
    getContext: vi.fn(() => ({})),
    setAttribute: vi.fn(),
    classList: { toggle: vi.fn(), add: vi.fn(), remove: vi.fn() },
};

const documentMock = {
    getElementById: vi.fn((id) => {
        // Return a mock element that can store value
        if (!domMock[id]) domMock[id] = { ...domMock, value: '' };
        return domMock[id];
    }),
    querySelectorAll: vi.fn(() => []),
};
global.document = documentMock;
global.Chart = vi.fn(); // Mock Chart.js

// Mock Common and DataService for metrics.js
// We need to inject these mocks or rely on the fact that metrics.js uses global objects if not imported.
// Since metrics.js is not a module, it relies on globals.
// But common.js IS a module in test environment. 
// We need to expose common.js exports to global scope for metrics.js to find them.

global.DataService = DataService;
global.State = State;
global.Common = Common;
global.CONSTANTS = CONSTANTS;
global.lucide = { createIcons: vi.fn() };

// Now import metrics.js - it will execute and look for globals
import { initMetrics } from '../../js/metrics.js';

describe('Metrics Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock data
        vi.spyOn(DataService, 'load').mockReturnValue({
            tasks: {
                't1': { id: 't1', createdAt: '2023-01-01', completedDate: '2023-01-05', priority: 'high' }, // Lead time 4 days
                't2': { id: 't2', createdAt: '2023-01-02', completedDate: '2023-01-03', priority: 'low' }  // Lead time 1 day
            },
            columns: {
                'c1': { taskIds: [] },
                'c2': { taskIds: [] },
                'c3': { taskIds: ['t1', 't2'] } // Done column
            },
            labels: []
        });

        // Mock date inputs to cover the range
        domMock['start-date'] = { value: '2023-01-01' };
        domMock['end-date'] = { value: '2023-01-31' };
    });

    it('should calculate average lead time correctly', () => {
        initMetrics();
        // t1: 4 days, t2: 1 day -> Avg: 2.5 days
        expect(document.getElementById('avg-days').textContent).toContain('2.5');
    });

    it('should calculate completion rate correctly', () => {
        initMetrics();
        // 2 tasks, both done -> 100%
        expect(document.getElementById('completion-rate').textContent).toBe('100%');
    });

    it('should handle zero tasks gracefully', () => {
        vi.spyOn(DataService, 'load').mockReturnValue({ tasks: {}, columns: {}, labels: [] });
        initMetrics();
        expect(document.getElementById('completion-rate').textContent).toBe('0%');
        expect(document.getElementById('avg-days').textContent).toContain('0.0');
    });
});
