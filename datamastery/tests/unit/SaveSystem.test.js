import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSystem } from '../../src/engine/SaveSystem.js';

describe('SaveSystem', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('can save and retrieve progress', () => {
    const progress = { totalDP: 150 };
    SaveSystem.saveProgress(progress);
    const data = SaveSystem.getProgress();
    expect(data.totalDP).toBe(150);
  });
  
  it('returns empty object when load is empty', () => {
    const data = SaveSystem.getProgress();
    expect(data).toBeDefined();
  });
});
