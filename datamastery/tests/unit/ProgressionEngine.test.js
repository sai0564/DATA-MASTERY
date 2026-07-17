import { describe, it, expect } from 'vitest';
import { ProgressionEngine } from '../../src/engine/ProgressionEngine.js';

describe('ProgressionEngine', () => {
  it('initializes progress correctly', () => {
    const levels = [{ id: '1', subLevels: [{ id: '1.1' }] }];
    const progress = ProgressionEngine.initializeProgress(levels);
    expect(progress).toBeDefined();
    expect(progress.levels['1'].status).toBe('active');
    expect(progress.achievements['first-run']).toBeDefined();
  });
});
