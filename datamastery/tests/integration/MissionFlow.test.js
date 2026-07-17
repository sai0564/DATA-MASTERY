import { describe, it, expect, vi } from 'vitest';
import { MissionEngine } from '../../src/engine/MissionEngine.js';

describe('Integration: Mission Flow', () => {
  it('instantiates and triggers startIntro successfully', async () => {
    const mockPyodide = { isReady: true };
    const addMessages = vi.fn().mockResolvedValue(true);
    const setMessages = vi.fn();
    const onStateUpdate = vi.fn();
    
    const missionData = {
      level: { id: 'level-1', title: 'Test Level' },
      subLevel: {
        id: '1.1',
        type: 'guided',
        conversation: {
          situation: ['Hello'],
          concept: { name: 'X', explanation: 'Y' },
          task: 'Z'
        }
      }
    };

    const engine = new MissionEngine({
      levelId: 'level-1',
      subLevelId: '1.1',
      missionData,
      pyodide: mockPyodide,
      levelsList: [],
      onStateUpdate,
      addMessages,
      setMessages,
      GUIDED_PHASE: { ACTIVE: 'guided_active', COMPLETE: 'guided_complete' },
      CHALLENGE_PHASE: { ACTIVE: 'challenge_active', COMPLETE: 'challenge_complete' },
    });

    await engine.startIntro();
    expect(addMessages).toHaveBeenCalled();
    expect(onStateUpdate).toHaveBeenCalledWith({ phase: 'guided_active' });
  });
});
