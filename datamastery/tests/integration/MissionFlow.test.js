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

  it('executes code, captures state delta, and passes feedback to UI state', async () => {
    const mockPyodide = {
      isReady: true,
      runCode: vi.fn().mockResolvedValue({
        stdout: '',
        stderr: '',
        error: null,
        variables: {
          df: { type: 'DataFrame', shape: [1000, 8] },
        },
        lastExpressionResult: null,
        stateDelta: {
          created: [{ name: 'df', type: 'DataFrame', action: 'created', rows: 1000, cols: 8 }],
          updated: [],
          imports: ['pd'],
        },
      }),
    };

    const addMessages = vi.fn().mockResolvedValue(true);
    const setMessages = vi.fn();
    const onStateUpdate = vi.fn();

    const missionData = {
      level: { id: 'level-1', title: 'Test Level', subLevels: [{ id: '1.1', type: 'guided' }] },
      subLevel: {
        id: '1.1',
        type: 'guided',
        conversation: {
          situation: ['Hello'],
          task: 'Load data',
        },
        validator: {
          fn: 'validateDataFrame',
          config: { checkLoaded: true },
        },
      },
    };

    const engine = new MissionEngine({
      levelId: 'level-1',
      subLevelId: '1.1',
      missionData,
      pyodide: mockPyodide,
      levelsList: [{ id: 'level-1', title: 'Test Level', subLevels: [{ id: '1.1' }] }],
      onStateUpdate,
      addMessages,
      setMessages,
      GUIDED_PHASE: { ACTIVE: 'guided_active', COMPLETE: 'guided_complete' },
      CHALLENGE_PHASE: { ACTIVE: 'challenge_active', COMPLETE: 'challenge_complete' },
    });

    const result = await engine.runAndValidate("import pandas as pd\ndf = pd.read_csv('test.csv')", 0, (t) => t);

    expect(mockPyodide.runCode).toHaveBeenCalledTimes(1);
    expect(onStateUpdate).toHaveBeenCalledWith({
      output: {
        stdout: '',
        stderr: '',
        error: null,
        stateDelta: {
          created: [{ name: 'df', type: 'DataFrame', action: 'created', rows: 1000, cols: 8 }],
          updated: [],
          imports: ['pd'],
        },
      },
    });
    expect(result.stateDelta.created[0].name).toBe('df');
  });
});
