import { describe, it, expect, vi } from 'vitest';
import { ValidationEngine } from '../../src/engine/ValidationEngine.js';

describe('ValidationEngine', () => {
  it('registers generic validators on construct', () => {
    expect(ValidationEngine.validators).toBeDefined();
    expect(ValidationEngine.validators['validateDataFrame']).toBeDefined();
  });

  it('handles missing validation function', async () => {
    const context = {
      missionData: {
        validator: { fn: 'nonExistent' }
      }
    };
    
    const result = await ValidationEngine.validate('code', context);
    expect(result.passed).toBe(false);
  });
});
