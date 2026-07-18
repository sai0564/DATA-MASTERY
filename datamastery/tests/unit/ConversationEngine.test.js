import { describe, it, expect, vi } from 'vitest';
import { ConversationEngine } from '../../src/engine/ConversationEngine.js';

const createEngine = (overrides = {}) => {
  const addMessages = vi.fn().mockResolvedValue(true);
  const setMessages = vi.fn();
  const setPhase = vi.fn();
  const engine = new ConversationEngine({
    addMessages,
    setMessages,
    setPhase,
    mentor: 'maya',
    GUIDED_PHASE: {
      SITUATION: 'situation',
      TASK: 'task',
      ACTIVE: 'active',
      RESULT_REACTION: 'reaction',
      RESULT_EXPLANATION: 'explanation',
      COMPLETE: 'complete',
    },
    CHALLENGE_PHASE: {
      SITUATION: 'challenge-situation',
      ACTIVE: 'challenge-active',
      COMPLETE: 'challenge-complete',
    },
    ...overrides,
  });

  return { engine, addMessages, setMessages, setPhase };
};

describe('ConversationEngine', () => {
  it('instantiates correctly with options', () => {
    const addMessages = vi.fn();
    const engine = new ConversationEngine({ addMessages, setMessages: vi.fn(), setPhase: vi.fn(), mentor: 'maya', GUIDED_PHASE: {}, CHALLENGE_PHASE: {} });
    expect(engine).toBeDefined();
    expect(engine.addMessages).toBe(addMessages);
  });

  it('reveals only the first guided step during mission intro', async () => {
    const { engine, addMessages, setPhase } = createEngine();
    const mission = {
      type: 'guided',
      title: 'Your First Dataset',
      subtitle: 'Loading and previewing',
      learningObjective: 'Load and preview data',
      estDuration: '3m',
      datasetCard: { filename: 'customers.csv' },
      conversation: {
        situation: ['Morning! 👋 Welcome to NovaMetrics.'],
        concept: { explanation: 'Use head().', why: 'It previews rows.' },
        task: 'Load and preview the file.',
        resultReaction: 'Perfect.',
        resultExplanation: 'Now we know what it looks like.',
      },
      validator: {
        fn: 'validateDataFrame',
        config: { checkLoaded: true, checkHead: true },
      },
    };

    await engine.startMissionIntro(mission, {}, '1.1', 'level-1', []);

    expect(setPhase).toHaveBeenLastCalledWith('active');
    expect(addMessages).toHaveBeenCalledWith(
      ['Morning! 👋 Welcome to NovaMetrics.', 'Your first task:\nLoad customers.csv using pandas.'],
      'maya'
    );
    expect(addMessages.mock.calls.flat()).not.toContain('Use head().');
    expect(addMessages.mock.calls.flat()).not.toContain('Perfect.');
  });

  it('reveals the next guided step only after the active validator passes', async () => {
    const { engine, addMessages, setPhase } = createEngine();
    const mission = {
      type: 'guided',
      datasetCard: { filename: 'customers.csv' },
      conversation: {
        situation: ['Morning!'],
        concept: { explanation: 'Use head().', why: 'It previews rows.' },
        resultReaction: 'Perfect.',
        resultExplanation: 'Now we know what it looks like.',
      },
      validator: {
        fn: 'validateDataFrame',
        config: { checkLoaded: true, checkHead: true },
      },
    };

    const result = await engine.handleValidation(
      mission,
      { passed: true, templateVars: {} },
      (text) => text,
      0
    );

    expect(result).toEqual({ stepPassed: true, missionComplete: false });
    expect(addMessages).toHaveBeenCalledWith(['Great — the dataset loaded successfully.'], 'maya');
    expect(addMessages).toHaveBeenCalledWith(
      ["Let's look inside.", 'Your next task:\nShow the first five rows with `df.head()`.'],
      'maya'
    );
    expect(setPhase).toHaveBeenLastCalledWith('active');
  });
});
