import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePyodideContext } from '../context/PyodideContext.jsx';
import { getSubLevel, getNextSubLevel, levels } from '../content/levelRegistry.js';
import { DatasetEngine } from '../engine/DatasetEngine.js';
import { MissionEngine } from '../engine/MissionEngine.js';
import { RewardEngine } from '../engine/RewardEngine.js';
import { saveCurrentMission } from '../stores/progressStore.js';
import { SaveSystem } from '../engine/SaveSystem.js';
import { MENTORS, GUIDED_PHASE, CHALLENGE_PHASE, ACHIEVEMENT_REGISTRY } from '../utils/constants.js';
import ChatPanel from '../components/chat/ChatPanel.jsx';
import CodeEditor from '../components/editor/CodeEditor.jsx';
import OutputPanel from '../components/editor/OutputPanel.jsx';
import HintDrawer from '../components/hints/HintDrawer.jsx';
import './MissionView.css';

// Typing animation defaults
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
  const isChallenge = mission?.type === 'challenge';

  // --- States ---
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState('loading');
  const [output, setOutput] = useState({ stdout: '', stderr: '', error: null });
  const [lastExpressionResult, setLastExpressionResult] = useState(null);
  const [datasetsLoaded, setDatasetsLoaded] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [code, setCode] = useState('');
  const [, setChallengeStatesReached] = useState(new Set());
  const [earnedDPState, setEarnedDPState] = useState(null);
  const [levelCompleted, setLevelCompleted] = useState(false);
  
  // Experience Engine States
  const [briefingAccepted, setBriefingAccepted] = useState(false);
  const [inspectDataset, setInspectDataset] = useState(null);
  const [activeToasts, setActiveToasts] = useState([]);

  const messageIdRef = useRef(0);
  const nextMsgId = () => `msg-${++messageIdRef.current}`;
  const phaseRunRef = useRef(false);
  const engineRef = useRef(null);

  // Reset briefing overlay and states on sub-level path navigation changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBriefingAccepted(false);
    setMessages([]);
    setLastExpressionResult(null);
    setOutput({ stdout: '', stderr: '', error: null, stateDelta: null });
    setEarnedDPState(null);
    setLevelCompleted(false);

    if (pyodide && pyodide.isReady) {
      pyodide.resetNamespace().catch(() => {});
    }
    
    // Save current mission status to progress store
    if (levelId && subLevelId) {
      saveCurrentMission(levelId, subLevelId);
    }
  }, [levelId, subLevelId, pyodide]);

  // --- Floating Toast Unlocks ---
  const triggerAchievementToast = useCallback((achievementId) => {
    const details = ACHIEVEMENT_REGISTRY[achievementId];
    if (!details) return;

    const toastId = `toast-${Date.now()}-${achievementId}`;
    setActiveToasts((prev) => [...prev, { id: toastId, ...details }]);

    // Fade out after 4.5 seconds
    setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4500);
  }, []);

  // --- Add chat messages with typing animation and timestamps ---
  const addMessages = useCallback(async (texts, sender = 'maya') => {
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    for (const item of texts) {
      const text = typeof item === 'string' ? item : item.text;
      const customTyping = typeof item === 'object' && item.typing !== undefined ? item.typing : TYPING_DELAY;
      const customDelay = typeof item === 'object' && item.delay !== undefined ? item.delay : MESSAGE_DELAY;

      const typingId = `typing-${Date.now()}`;
      setMessages((prev) => [...prev, { id: typingId, sender, text: '', isTyping: true }]);
      await new Promise((r) => setTimeout(r, customTyping));
      
      const timestamp = new Date().toLocaleTimeString([], timeOptions);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== typingId),
        { id: nextMsgId(), sender, text, timestamp, isTyping: false },
      ]);
      await new Promise((r) => setTimeout(r, customDelay));
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
        
        // Pass stdout, stderr, and error to OutputPanel state
        if (updates.output !== undefined) {
          setOutput(updates.output);
          // Set notebook evaluated last expression result
          if (updates.output.error) {
            setLastExpressionResult(null);
          }
        }
        
        if (updates.datasetsLoaded !== undefined) setDatasetsLoaded(updates.datasetsLoaded);
        if (updates.earnedDP !== undefined) setEarnedDPState(updates.earnedDP);
        if (updates.challengeStatesReached !== undefined) {
          setChallengeStatesReached(updates.challengeStatesReached);
        }
        if (updates.levelCompleted !== undefined) {
          setTimeout(() => {
            setLevelCompleted(updates.levelCompleted);
          }, 3500);
        }
        
        // Trigger achievements toasts on state update unlock signals
        if (updates.newlyUnlocked !== undefined && updates.newlyUnlocked.length > 0) {
          updates.newlyUnlocked.forEach((id) => {
            triggerAchievementToast(id);
          });
        }
      },
      addMessages,
      setMessages,
      GUIDED_PHASE,
      CHALLENGE_PHASE,
    });
  }, [levelId, subLevelId, missionData, pyodide, addMessages, triggerAchievementToast]);

  // Load previously saved code for this mission (improves editor sync)
  useEffect(() => {
    if (!mission || !levelId || !subLevelId) return;
    
    const savedCode = SaveSystem.getCode(levelId, subLevelId);
    if (savedCode && editorRef.current?.setCode) {
      // Use the new setCode method exposed by CodeEditor ref
      editorRef.current.setCode(savedCode);
      setCode(savedCode);
    }
  }, [levelId, subLevelId, mission]);

  // --- Generate and load datasets ---
  useEffect(() => {
    if (!mission || !pyodide.isReady || datasetsLoaded || !engineRef.current) return;

    const seed = DatasetEngine.getOrCreateSeed();
    const datasetEngineInstance = new DatasetEngine(seed);
    engineRef.current.loadDatasets(datasetEngineInstance);
  }, [mission, pyodide.isReady, datasetsLoaded]);

  // --- Conversation flow (triggered AFTER briefing accepted) ---
  useEffect(() => {
    if (!mission || !datasetsLoaded || phaseRunRef.current || !engineRef.current || !briefingAccepted) return;
    phaseRunRef.current = true;

    engineRef.current.startIntro();
  }, [mission, datasetsLoaded, briefingAccepted]);

  // --- Handle code run ---
  const handleRun = useCallback(async () => {
    if (!pyodide.isReady || !engineRef.current) return;

    const codeToRun = editorRef.current?.getCode?.() || code;
    if (!codeToRun.trim()) return;

    // Reset old result before executing
    setLastExpressionResult(null);

    // Run + validate in a single execution. MissionEngine.runAndValidate is the
    // sole owner of code execution, so the learner's code runs exactly once and
    // the conversation always advances when the active step is satisfied.
    const result = await engineRef.current.runAndValidate(codeToRun, hintsUsed, interpolate);

    // Save evaluated expression result (if any) to notebook state
    if (result && result.lastExpressionResult) {
      setLastExpressionResult(result.lastExpressionResult);
    }
  }, [pyodide, code, hintsUsed, interpolate]);

  // --- Handle hint used ---
  const handleHintUsed = useCallback((count) => {
    setHintsUsed(count);
  }, []);

  // --- Handle code change ---
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  // --- Handle dataset inspect trigger from chat bubble link ---
  const handleDatasetPreview = useCallback((filename) => {
    setInspectDataset(filename);
  }, []);

  // --- Navigate to next sub-level ---
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

  // --- Pyodide initialization error ---
  if (pyodide.status === 'error') {
    return (
      <div className="mission-view mission-view--error" id="pyodide-error">
        <div className="mission-view__loader">
          <div className="mission-view__loader-icon">⚠️</div>
          <h3>Python Environment Failed to Start</h3>
          <p className="mission-view__loader-msg">
            {pyodide.error || 'The Python worker failed to initialize.'}
          </p>
          <p className="mission-view__loader-note">
            Check the browser console for details, then reload the page and try again.
          </p>
        </div>
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
  const rewards = RewardEngine.calculateRewards(mission.rewards || mission.points, {
    hintsUsed,
    isChallenge,
  });
  const earnedDp = earnedDPState !== null ? earnedDPState : rewards.earnedDP;

  // Find next level promotion details dynamically
  const currentLevelIdx = levels.findIndex(l => l.id === levelId);
  const nextLevel = currentLevelIdx !== -1 && currentLevelIdx < levels.length - 1 ? levels[currentLevelIdx + 1] : null;
  const promotionTitle = nextLevel ? nextLevel.title : 'Data Mastery Legend';

  return (
    <div className="mission-view" id="mission-view-page">
      
      {/* 1. Dataset Card Briefing Overlay */}
      {!briefingAccepted && (
        <div className="briefing-overlay" id="briefing-overlay">
          <div className="briefing-card animate-fade-in-scale">
            <div className="briefing-card__header">
              <span className="briefing-card__badge">📁 Assignment Briefing</span>
              <h2>Accept Task: {mission.title}</h2>
              <p className="briefing-card__subtitle">{mission.subtitle}</p>
            </div>
            
            <div className="briefing-card__dataset">
              <h3 className="briefing-card__section-title">Attached Database Profile</h3>
              <div className="briefing-card__profile">
                <div className="briefing-card__profile-row">
                  <span className="profile-label">Filename:</span>
                  <span className="profile-value profile-value--filename">📄 {mission.datasetCard?.filename || 'customers.csv'}</span>
                </div>
                <div className="briefing-card__profile-grid">
                  <div className="briefing-card__profile-item">
                    <span className="profile-label">Rows</span>
                    <span className="profile-value">{mission.datasetCard?.rows || '1,247'}</span>
                  </div>
                  <div className="briefing-card__profile-item">
                    <span className="profile-label">Columns</span>
                    <span className="profile-value">{mission.datasetCard?.columns || '9'}</span>
                  </div>
                  <div className="briefing-card__profile-item">
                    <span className="profile-label">Difficulty</span>
                    <span className="profile-value profile-value--diff">{mission.datasetCard?.difficulty || 'Beginner'}</span>
                  </div>
                </div>
                <div className="briefing-card__profile-row">
                  <span className="profile-label">Department:</span>
                  <span className="profile-value">{mission.datasetCard?.department || 'Marketing Analytics'}</span>
                </div>
                <div className="briefing-card__profile-row">
                  <span className="profile-label">Description:</span>
                  <span className="profile-value profile-value--desc">{mission.datasetCard?.description || 'CRM customer record file.'}</span>
                </div>
              </div>
            </div>

            <div className="briefing-card__footer">
              <button 
                className="briefing-card__btn" 
                onClick={() => setBriefingAccepted(true)}
                id="accept-briefing-btn"
              >
                Accept Assignment & Load File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Achievement Unlock Notifications */}
      <div className="achievement-toasts-container">
        {activeToasts.map((toast) => (
          <div key={toast.id} className="achievement-toast animate-slide-in-right">
            <div className="achievement-toast__icon">{toast.icon}</div>
            <div className="achievement-toast__content">
              <span className="achievement-toast__label">Achievement Unlocked!</span>
              <h4 className="achievement-toast__title">{toast.title}</h4>
              <p className="achievement-toast__desc">{toast.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Dataset Attachment Inspector Overlay */}
      {inspectDataset && (
        <div className="preview-modal-overlay" onClick={() => setInspectDataset(null)} id="preview-modal">
          <div className="preview-modal-card animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h3>inspect: {inspectDataset}</h3>
              <button className="preview-modal-close" onClick={() => setInspectDataset(null)}>×</button>
            </div>
            <div className="preview-modal-body">
              <div className="briefing-card__profile">
                <div className="briefing-card__profile-row">
                  <span className="profile-label">Filename:</span>
                  <span className="profile-value">📄 {inspectDataset}</span>
                </div>
                <div className="briefing-card__profile-grid">
                  <div className="briefing-card__profile-item">
                    <span className="profile-label">Rows</span>
                    <span className="profile-value">{mission.datasetCard?.rows || '1,247'}</span>
                  </div>
                  <div className="briefing-card__profile-item">
                    <span className="profile-label">Columns</span>
                    <span className="profile-value">{mission.datasetCard?.columns || '9'}</span>
                  </div>
                  <div className="briefing-card__profile-item">
                    <span className="profile-label">Difficulty</span>
                    <span className="profile-value">{mission.datasetCard?.difficulty || 'Beginner'}</span>
                  </div>
                </div>
                <div className="briefing-card__profile-row">
                  <span className="profile-label">Owner Department:</span>
                  <span className="profile-value">{mission.datasetCard?.department || 'Marketing Analytics'}</span>
                </div>
                <div className="briefing-card__profile-row">
                  <span className="profile-label">Description:</span>
                  <span className="profile-value">{mission.datasetCard?.description || 'CRM profiles.'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

        <ChatPanel 
          messages={messages} 
          mentor={mentor} 
          onDatasetPreview={handleDatasetPreview} 
        />

        {isActive && (
          <HintDrawer
            hints={mission.hints}
            missionType={mission.type}
            onHintUsed={handleHintUsed}
          />
        )}

        {isComplete && (
          <div className="mission-view__success-bar animate-fade-in-up">
            <div className="mission-view__success-content">
              <span className="mission-view__success-icon">🎉</span>
              <div>
                <h4 className="mission-view__success-title">Mission Complete!</h4>
                <p className="mission-view__success-subtitle">
                  {mentorData?.name} is impressed. Earned <span className="mission-view__success-points">+{earnedDp} DP</span>
                </p>
              </div>
            </div>
            <button
              className="mission-view__next-btn mission-view__next-btn--pulse"
              onClick={handleNext}
              id="next-mission-btn"
            >
              Next Mission →
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
              disabled={!pyodide.isReady || pyodide.isRunning || isComplete || !briefingAccepted}
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
              readOnly={isComplete || !briefingAccepted}
            />
          </div>
        </div>
        
        {/* Notebook-like Output Console Panel */}
        <div className="mission-view__output-section">
          <OutputPanel
            stdout={output.stdout}
            stderr={output.stderr}
            error={output.error}
            stateDelta={output.stateDelta}
            isRunning={pyodide.isRunning}
            lastExpressionResult={lastExpressionResult}
            isComplete={isComplete}
            summary={mission.summary}
          />
        </div>
      </div>

      {levelCompleted && (
        <div className="level-complete-overlay" id="level-complete-modal">
          <div className="level-complete-card">
            <div className="level-complete-card__badge">🏆</div>
            <h2 className="level-complete-card__title">Level Complete!</h2>
            <p className="level-complete-card__subtitle">{level.completionSubtitle || 'You survived your first week at NovaMetrics.'}</p>
            <div className="level-complete-card__divider" />
            <p className="level-complete-card__achievement">
              {level.completionPromotionText || `You successfully completed ${level.title}! Your mentor promoted you.`}
            </p>
            <div className="level-complete-card__promo">
              <span className="level-complete-card__promo-icon">⚡</span>
              <span className="level-complete-card__promo-text">
                Promoted to: <strong>{promotionTitle}</strong>
              </span>
            </div>
            <button
              className="level-complete-card__btn"
              onClick={() => navigate('/dashboard')}
              id="promotion-confirm-btn"
            >
              Advance to {nextLevel ? nextLevel.title : 'Legend Status'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MissionView;
