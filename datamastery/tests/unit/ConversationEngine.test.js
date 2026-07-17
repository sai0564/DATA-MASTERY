import { describe, it, expect, vi } from 'vitest';
import { ConversationEngine } from '../../src/engine/ConversationEngine.js';

describe('ConversationEngine', () => {
  it('instantiates correctly with options', () => {
    const addMessages = vi.fn();
    const engine = new ConversationEngine({ addMessages, setMessages: vi.fn(), setPhase: vi.fn(), mentor: 'maya', GUIDED_PHASE: {}, CHALLENGE_PHASE: {} });
    expect(engine).toBeDefined();
    expect(engine.addMessages).toBe(addMessages);
  });
});
