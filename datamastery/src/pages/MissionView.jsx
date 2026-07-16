import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePyodideContext } from '../context/PyodideContext.jsx';
import { getSubLevel, getNextSubLevel } from '../data/levelRegistry.js';
import { level1Validators } from '../data/validators/level1.js';
import { DatasetEngine } from '../engine/DatasetEngine.js';
import {
  completeSubLevel,
  updateChallengeState,
  loadProgress,
} from '../stores/progressStore.js';
import { MENTORS, GUIDED_PHASE, CHALLENGE_PHASE, POINTS } from '../utils/constants.js';
import ChatPanel from '../components/chat/ChatPanel.jsx';
import CodeEditor from '../components/editor/CodeEditor.jsx';
import OutputPanel from '../components/editor/OutputPanel.jsx';
import HintDrawer from '../components/hints/HintDrawer.jsx';
import './MissionView.css';

// Typing animation delays
const TYPING_DELAY = 600;
const MESSAGE_DELAY = 900;

// All validators (add more registries as levels are built)
const ALL_VALIDATORS = { ...level1Validators };

function MissionView() {
  const { levelId, subLevelId } = useParams();
  const navigate = useNavigate();
  const pyodide = usePyodideContext();
  const editorRef = useRef(null);

  // Look up mission data
  const missionData = getSubLevel(levelId, subLevelId);
  const level = missionData?.level;
  const mission = missionData?.subLevel;
  const isGuided = mission?.type === 'guided';
  const isChallenge = mission?.type === 'challenge';

  // State
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState('loading');
  const [output, setOutput] = useState({ stdout: '', stderr: '', error: null });
  const [datasetsLoaded, setDatasetsLoaded] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [code, setCode] = useState('');
  const [challengeStatesReached, setChallengeStatesReached] = useState([]);

  const messageIdRef = useRef(0);
  const nextMsgId = () => `msg-${++messageIdRef.current}`;
  const phaseRunRef = useRef(false);

  // --- Add chat messages with typing animation ---
  const addMessages = useCallback(async (texts, sender = 'maya') => {
    for (const text of texts) {
      const typingId = `typing-${Date.now()}`;
      setMessages((prev) => [...prev, { id: typingId, sender, text: '', isTyping: true }]);
      await new Promise((r) => setTimeout(r, TYPING_DELAY));
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== typingId),
        { id: nextMsgId(), sender, text, isTyping: false },
      ]);
      await new Promise((r) => setTimeout(r, MESSAGE_DELAY));
    }
  }, []);

  // --- Interpolate template variables in mentor text ---
  const interpolate = useCallback((text, vars = {}) => {
    if (!text || !vars) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`;
    });
  }, []);

  // --- Generate and load datasets ---
  useEffect(() => {
    if (!mission || !pyodide.isReady || datasetsLoaded) return;

    const seed = DatasetEngine.getOrCreateSeed();
    const engine = new DatasetEngine(seed);
    const csvMap = engine.generateForMission(mission.datasets, `${levelId}-${subLevelId}`);

    // Convert csvMap to file entries for the worker
    const fileEntries = Object.entries(csvMap).map(([name, content]) => ({
      name,
      content,
    }));

    pyodide.loadDatasets(fileEntries).then(() => {
      setDatasetsLoaded(true);
    }).catch((err) => {
      console.error('Failed to load datasets:', err);
    });
  }, [mission, pyodide.isReady, datasetsLoaded, pyodide, levelId, subLevelId]);

  // --- Conversation flow based on mission type ---
  useEffect(() => {
    if (!mission || !datasetsLoaded || phaseRunRef.current) return;
    phaseRunRef.current = true;

    const mentor = mission.mentor || level.mentor;

    const runConversation = async () => {
      if (isGuided) {
        // Phase 1: Situation
        setPhase(GUIDED_PHASE.SITUATION);
        await addMessages(mission.conversation.situation, mentor);

        // Phase 2: Concept introduction
        setPhase(GUIDED_PHASE.CONCEPT);
        const concept = mission.conversation.concept;
        if (concept) {
          await addMessages([concept.explanation, concept.why], mentor);
        }

        // Phase 3: Task
        setPhase(GUIDED_PHASE.TASK);
        await addMessages([mission.conversation.task], mentor);

        // Editor becomes active
        setPhase(GUIDED_PHASE.ACTIVE);
      } else if (isChallenge) {
        // Challenges: just show situation
        setPhase(CHALLENGE_PHASE.SITUATION);
        await addMessages(mission.conversation.situation, mentor);
        setPhase(CHALLENGE_PHASE.ACTIVE);
      }
    };

    runConversation();
  }, [mission, datasetsLoaded, isGuided, isChallenge, addMessages, level]);

  // --- Handle code run ---
  const handleRun = useCallback(async () => {
    if (!pyodide.isReady) return;

    const codeToRun = editorRef.current?.getCode?.() || code;
    if (!codeToRun.trim()) return;

    setOutput({ stdout: '', stderr: '', error: null });
    const result = await pyodide.runCode(codeToRun);

    if (result.error) {
      setOutput({ stdout: result.stdout || '', stderr: result.stderr || '', error: result.error });
      return;
    }

    setOutput({ stdout: result.stdout, stderr: result.stderr, error: null });

    // Run validation
    const validatorFn = ALL_VALIDATORS[mission.validation.fn];
    if (!validatorFn) return;

    const validationResult = validatorFn({
      stdout: result.stdout,
      stderr: result.stderr,
      variables: result.variables,
    });

    const mentor = mission.mentor || level.mentor;

    if (isGuided) {
      // --- GUIDED FLOW ---
      if (validationResult.passed) {
        setPhase(GUIDED_PHASE.RESULT_REACTION);

        // Interpolate and show result reaction
        const reaction = interpolate(
          mission.conversation.resultReaction,
          validationResult.templateVars
        );
        await addMessages([reaction], mentor);

        // Show result explanation
        setPhase(GUIDED_PHASE.RESULT_EXPLANATION);
        const explanation = interpolate(
          mission.conversation.resultExplanation,
          validationResult.templateVars
        );
        await addMessages([explanation], mentor);

        // Complete
        setPhase(GUIDED_PHASE.COMPLETE);
        setMessages((prev) => [
          ...prev,
          { id: nextMsgId(), sender: 'system', text: '✅ Sub-level Complete!' },
        ]);

        // Save progress
        completeSubLevel(levelId, subLevelId, hintsUsed, codeToRun);
      } else {
        // Failure: show validator feedback
        await addMessages([validationResult.feedback], mentor);
      }
    } else if (isChallenge) {
      // --- CHALLENGE FLOW ---
      if (validationResult.passed) {
        // All states reached — show final response
        const finalState = validationResult.currentState;
        const finalResponse = mission.conversation.stateResponses?.[finalState];
        if (finalResponse) {
          await addMessages([finalResponse], mentor);
        }

        setPhase(CHALLENGE_PHASE.COMPLETE);
        setMessages((prev) => [
          ...prev,
          { id: nextMsgId(), sender: 'system', text: '🏆 Level Challenge Complete!' },
        ]);

        completeSubLevel(levelId, subLevelId, hintsUsed, codeToRun);
      } else if (validationResult.reachedStates) {
        // Multi-step: check for newly reached states
        const newStates = validationResult.reachedStates.filter(
          s => !challengeStatesReached.includes(s)
        );

        if (newStates.length > 0) {
          setChallengeStatesReached(prev => [...prev, ...newStates]);

          // Show response for the highest newly reached state
          for (const state of newStates) {
            updateChallengeState(levelId, subLevelId, state);
            const response = mission.conversation.stateResponses?.[state];
            if (response) {
              await addMessages([response], mentor);
            }
          }
        } else {
          // No progress
          await addMessages([validationResult.feedback], mentor);
        }
      } else {
        await addMessages([validationResult.feedback], mentor);
      }
    }
  }, [
    pyodide, code, mission, level, isGuided, isChallenge,
    addMessages, interpolate, hintsUsed, levelId, subLevelId,
    challengeStatesReached,
  ]);

  // --- Handle hint used ---
  const handleHintUsed = useCallback((count) => {
    setHintsUsed(count);
  }, []);

  // --- Handle code change ---
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  // --- Navigate to next ---
  const handleNext = useCallback(() => {
    const next = getNextSubLevel(levelId, subLevelId);
    if (next) {
      navigate(`/level/${next.level.id}/${next.subLevel.id}`);
    } else {
      navigate(`/level/${levelId}`);
    }
  }, [navigate, levelId, subLevelId]);

  // --- Error: not found ---
  if (!missionData) {
    return (
      <div className="mission-view mission-view--error">
        <p>Sub-level not found: {levelId}/{subLevelId}</p>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>
    );
  }

  // --- Pyodide loading ---
  if (pyodide.isLoading || !pyodide.isReady) {
    return (
      <div className="mission-view mission-view--loading" id="pyodide-loading">
        <div className="mission-view__loader">
          <div className="mission-view__loader-icon animate-pulse">🐍</div>
          <h3>Preparing Python Environment</h3>
          <p className="mission-view__loader-msg">
            {pyodide.loadingMessage || 'Initializing...'}
          </p>
          <div className="mission-view__loader-bar">
            <div
              className="mission-view__loader-fill"
              style={{
                width: pyodide.status === 'loading-packages' ? '60%' : '25%',
              }}
            />
          </div>
          <p className="mission-view__loader-note">
            First load takes 10–15 seconds. Subsequent loads are cached.
          </p>
        </div>
      </div>
    );
  }

  const mentor = mission.mentor || level.mentor;
  const mentorData = MENTORS[mentor];
  const isComplete = phase === GUIDED_PHASE.COMPLETE || phase === CHALLENGE_PHASE.COMPLETE;
  const isActive = phase === GUIDED_PHASE.ACTIVE || phase === CHALLENGE_PHASE.ACTIVE;

  // Calculate DP for display
  const baseDp = mission.points.base;
  const bonusDp = hintsUsed === 0 ? mission.points.bonus : 0;
  const penalty = hintsUsed * POINTS.HINT_PENALTY;
  const earnedDp = Math.max(0, baseDp + bonusDp - penalty);

  return (
    <div className="mission-view" id="mission-view-page">
      {/* Left panel: Chat + Hints */}
      <div className="mission-view__chat-panel">
        <div className="mission-view__chat-header">
          <Link to={`/level/${levelId}`} className="mission-view__back-btn">
            ← Level
          </Link>
          <div className="mission-view__chat-title">
            <span className="mission-view__mentor-avatar">
              {mentorData?.emoji || '👩‍💻'}
            </span>
            <div>
              <h3>{mentorData?.name || 'Maya'}</h3>
              <span className="mission-view__mentor-role">
                {mentorData?.role || 'Senior Data Analyst'}
              </span>
            </div>
          </div>
          <div className="mission-view__mission-title">
            <span className="mission-view__mission-type">
              {isChallenge ? '🏆 Challenge' : `${subLevelId}`}
            </span>
            {mission.title}
          </div>
        </div>

        <ChatPanel messages={messages} mentor={mentor} />

        {isActive && (
          <HintDrawer
            hints={mission.hints}
            missionType={mission.type}
            onHintUsed={handleHintUsed}
          />
        )}

        {isComplete && (
          <div className="mission-view__success-bar">
            <span className="mission-view__success-points">
              +{earnedDp} DP
            </span>
            <button
              className="mission-view__next-btn"
              onClick={handleNext}
              id="next-mission-btn"
            >
              Continue →
            </button>
          </div>
        )}
      </div>

      {/* Right panel: Code + Output */}
      <div className="mission-view__work-panel">
        <div className="mission-view__editor-section">
          <div className="mission-view__editor-header">
            <span className="mission-view__editor-tab">
              <span className="mission-view__editor-dot" />
              mission.py
            </span>
            <button
              className="mission-view__run-btn"
              onClick={handleRun}
              disabled={!pyodide.isReady || pyodide.isRunning || isComplete}
              id="run-code-btn"
            >
              {pyodide.isRunning ? '⏳ Running...' : '▶ Run'}
            </button>
          </div>
          <div className="mission-view__editor-body">
            <CodeEditor
              ref={editorRef}
              initialCode={mission.starterCode}
              onChange={handleCodeChange}
              readOnly={isComplete}
            />
          </div>
        </div>
        <div className="mission-view__output-section">
          <OutputPanel
            stdout={output.stdout}
            stderr={output.stderr}
            error={output.error}
            isRunning={pyodide.isRunning}
          />
        </div>
      </div>
    </div>
  );
}

export default MissionView;
