import { useState } from 'react';
import { POINTS } from '../../utils/constants.js';
import './HintDrawer.css';

/**
 * Progressive hint reveal system — supports both mission types.
 *
 * Props:
 *   hints: object — structured hints per mission type
 *     Guided: { taskReminder, conceptReminder, syntaxClue }
 *     Challenge: { workplaceThinking, analyticalDirection, methodClue }
 *   missionType: 'guided' | 'challenge'
 *   onHintUsed: (hintCount: number) => void
 */

const GUIDED_HINT_ORDER = ['taskReminder', 'conceptReminder', 'syntaxClue'];
const GUIDED_HINT_LABELS = {
  taskReminder: 'Task Reminder',
  conceptReminder: 'Concept Reminder',
  syntaxClue: 'Syntax Clue',
};

const CHALLENGE_HINT_ORDER = ['workplaceThinking', 'analyticalDirection', 'methodClue'];
const CHALLENGE_HINT_LABELS = {
  workplaceThinking: 'Workplace Thinking',
  analyticalDirection: 'Analytical Direction',
  methodClue: 'Method Clue',
};

function HintDrawer({ hints = {}, missionType = 'guided', onHintUsed }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const isChallenge = missionType === 'challenge';
  const hintOrder = isChallenge ? CHALLENGE_HINT_ORDER : GUIDED_HINT_ORDER;
  const hintLabels = isChallenge ? CHALLENGE_HINT_LABELS : GUIDED_HINT_LABELS;

  // Filter to only hints that exist
  const availableHints = hintOrder.filter((key) => hints[key]);
  const totalHints = availableHints.length;

  const handleRevealNext = () => {
    if (revealedCount < totalHints) {
      const next = revealedCount + 1;
      setRevealedCount(next);
      if (onHintUsed) onHintUsed(next);
    }
  };

  if (totalHints === 0) return null;

  const penalty = POINTS.HINT_PENALTY;

  return (
    <div className="hint-drawer" id="hint-drawer">
      <button
        className="hint-drawer__toggle"
        onClick={() => setIsOpen(!isOpen)}
        id="hint-toggle-btn"
      >
        <span className="hint-drawer__toggle-icon">💡</span>
        <span>
          {isOpen ? 'Hide Hints' : 'Need a hint?'}
        </span>
        {revealedCount > 0 && (
          <span className="hint-drawer__count">{revealedCount}/{totalHints}</span>
        )}
      </button>

      {isOpen && (
        <div className="hint-drawer__body animate-fade-in-scale">
          {revealedCount === 0 && (
            <div className="hint-drawer__intro">
              <p>Hints reduce your Data Points for this {isChallenge ? 'challenge' : 'sub-level'}.</p>
              <p className="hint-drawer__points-note">
                Each hint costs {penalty} DP
              </p>
            </div>
          )}

          {availableHints.slice(0, revealedCount).map((key, i) => (
            <div key={key} className="hint-drawer__hint animate-fade-in-up">
              <div className="hint-drawer__hint-header">
                <span className="hint-drawer__hint-label">Hint {i + 1}</span>
                <span className="hint-drawer__hint-type">
                  {hintLabels[key]}
                </span>
              </div>
              <p className="hint-drawer__hint-text">{hints[key]}</p>
            </div>
          ))}

          {revealedCount < totalHints && (
            <button
              className="hint-drawer__reveal-btn"
              onClick={handleRevealNext}
              id="reveal-hint-btn"
            >
              Reveal Hint {revealedCount + 1}
              <span className="hint-drawer__cost">
                (−{penalty} DP)
              </span>
            </button>
          )}

          {revealedCount === totalHints && (
            <p className="hint-drawer__all-shown">All hints revealed</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HintDrawer;
