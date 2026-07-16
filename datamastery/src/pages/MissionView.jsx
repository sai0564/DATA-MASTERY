import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePyodideContext } from '../context/PyodideContext.jsx';
import { getSubLevel, getNextSubLevel, levels } from '../content/levelRegistry.js';
import { DatasetEngine } from '../engine/DatasetEngine.js';
import { MissionEngine } from '../engine/MissionEngine.js';
import { RewardEngine } from '../engine/RewardEngine.js';
import { MENTORS, GUIDED_PHASE, CHALLENGE_PHASE, POINTS } from '../utils/constants.js';
import ChatPanel from '../components/chat/ChatPanel.jsx';
import CodeEditor from '../components/editor/CodeEditor.jsx';
import OutputPanel from '../components/editor/OutputPanel.jsx';
import HintDrawer from '../components/hints/HintDrawer.jsx';
import './MissionView.css';

// Typing animation delays
const TYPING_DELAY = 600;
const MESSAGE_DELAY = 900;

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
  const [earnedDPState, setEarnedDPState] = useState(null);

  const messageIdRef = useRef(0);
  const nextMsgId = () => `msg-${++messageIdRef.current}`;
  const phaseRunRef = useRef(false);
  
  // Mission engine reference
  const engineRef = useRef(null);

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

  // --- Initialize Mission Engine ---
  useEffect(() => {
    if (!missionData) return;

    engineRef.current = new MissionEngine({
      levelId,
      subLevelId,
      missionData,
      pyodide,
      levelsList: levels,
      onStateUpdate: (updates) => {
        if (updates.phase !== undefined) setPhase(updates.phase);
        if (updates.output !== undefined) setOutput(updates.output);
        if (updates.datasetsLoaded !== undefined) setDatasetsLoaded(updates.datasetsLoaded);
        if (updates.earnedDP !== undefined) setEarnedDPState(updates.earnedDP);
        if (updates.challengeStatesReached !== undefined) {
          setChallengeStatesReached(updates.challengeStatesReached);
        }
      },
      addMessages,
      GUIDED_PHASE,
      CHALLENGE_PHASE,
    });

    // Reset initialization guard on mount
    phaseRunRef.current = false;
  }, [levelId, subLevelId, missionData, pyodide, addMessages]);

  // --- Generate and load datasets ---
  useEffect(() => {
    if (!mission || !pyodide.isReady || datasetsLoaded || !engineRef.current) return;

    const seed = DatasetEngine.getOrCreateSeed();
    const datasetEngineInstance = new DatasetEngine(seed);
    engineRef.current.loadDatasets(datasetEngineInstance);
  }, [mission, pyodide.isReady, datasetsLoaded, engineRef.current]);

  // --- Conversation flow ---
  useEffect(() => {
    if (!mission || !datasetsLoaded || phaseRunRef.current || !engineRef.current) return;
    phaseRunRef.current = true;

    engineRef.current.startIntro();
  }, [mission, datasetsLoaded, engineRef.current]);

  // --- Handle code run ---
  const handleRun = useCallback(async () => {
    if (!pyodide.isReady || !engineRef.current) return;

    const codeToRun = editorRef.current?.getCode?.() || code;
    if (!codeToRun.trim()) return;

    await engineRef.current.runAndValidate(codeToRun, hintsUsed, interpolate);
  }, [pyodide, code, hintsUsed, interpolate]);

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

  // Calculate dynamic rewards using RewardEngine
  const rewards = RewardEngine.calculateRewards(mission.points, {
    hintsUsed,
    isChallenge,
  });
  const earnedDp = earnedDPState !== null ? earnedDPState : rewards.earnedDP;

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
