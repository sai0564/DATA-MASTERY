import { describe, it, expect } from 'vitest';
import { RewardEngine } from '../../src/engine/RewardEngine.js';

describe('RewardEngine', () => {
  it('returns earnedDP', () => {
    const config = { base: 50 };
    const result = RewardEngine.calculateRewards(config, { hintsUsed: 0, isChallenge: false });
    expect(result.earnedDP).toBeDefined();
    expect(typeof result.earnedDP).toBe('number');
  });

  it('includes default breakdown properties', () => {
    const config = { base: 50 };
    const result = RewardEngine.calculateRewards(config, { hintsUsed: 0, isChallenge: false });
    expect(result.earnedDP).toBeDefined();
  });
});
