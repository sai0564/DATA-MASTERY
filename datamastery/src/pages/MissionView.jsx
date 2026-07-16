import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePyodideContext } from '../context/PyodideContext.jsx';
import { getSubLevel, getNextSubLevel, levels } from '../content/levelRegistry.js';
import { DatasetEngine } from '../engine/DatasetEngine.js';
import { MissionEngine } from '../engine/MissionEngine.js';
import { RewardEngine } from '../engine/RewardEngine.js';
import { loadProgress } from '../stores/progressStore.js';
import { MENTORS, GUIDED_PHASE, CHALLENGE_PHASE } from '../utils/constants.js';
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
  const isGuided = mission?.type === 'guided';
  const isChallenge = mission?.type === 'challenge';

  // --- States ---
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState('loading');
  const [output, setOutput] = useState({ stdout: '', stderr: '', error: null });
  const [lastExpressionResult, setLastExpressionResult] = useState(null);
  const [datasetsLoaded, setDatasetsLoaded] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [code, setCode] = useState('');
  const [challengeStatesReached, setChallengeStatesReached] = useState([]);
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

  // Reset briefing overlay on sub-level path navigation changes
  useEffect(() => {
    setBriefingAccepted(false);
    setMessages([]);
    setLastExpressionResult(null);
    setOutput({ stdout: '', stderr: '', error: null });
    phaseRunRef.current = false;
  }, [levelId, subLevelId]);

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

  // --- Prepend dynamic memory greetings from Maya ---
  const triggerIntroWithMemory = async () => {
    if (!engineRef.current || !mission) return;

    const prevId = getPreviousSubLevelId(subLevelId);
    const progress = loadProgress();
    const levelProgress = progress.levels[levelId];
    const prevProgress = prevId ? levelProgress?.subLevels[prevId] : null;

    let memoryMessages = [];
    if (prevProgress && prevProgress.completed) {
      if (prevProgress.hintsUsed === 0) {
        memoryMessages.push("I noticed you solved the previous task without any hints! Let's keep that streak going. 🧠");
      } else {
        memoryMessages.push("Good job working through that last data task.");
      }

      if (subLevelId === '1.2') {
        memoryMessages.push("Now that you know how to load and preview a DataFrame, let's check its shape.");
      } else if (subLevelId === '1.3') {
        memoryMessages.push("Yesterday we checked the size of our dataset. Now let's see what columns we are tracking.");
      } else if (subLevelId === '1.4') {
        memoryMessages.push("You already know how to inspect the dimensions and column headers. Next is verifying the data types.");
      } else if (subLevelId === '1.5') {
        memoryMessages.push("We verified the data types. Remember, the top rows might look clean, but we should always sample random records.");
      } else if (subLevelId === '1.6') {
        memoryMessages.push("Great job sampling the records. Let's run a quick statistical summary before the meeting.");
      } else if (subLevelId === '1.7') {
        memoryMessages.push("You've inspected, sized, and summarized data files this week. Time for your performance review.");
      }
    }

    const mentor = mission.mentor || level.mentor || 'maya';
    const isChallenge = mission.type === 'challenge';

    if (!isChallenge) {
      setPhase(GUIDED_PHASE.SITUATION);
      const introMessages = [...memoryMessages];
      if (mission.conversation.situation) {
        introMessages.push(...mission.conversation.situation);
      }
      if (introMessages.length > 0) {
        await addMessages(introMessages, mentor);
      }

      setPhase(GUIDED_PHASE.CONCEPT);
      const concept = mission.conversation.concept;
      if (concept) {
        await addMessages([concept.explanation, concept.why], mentor);
      }

      setPhase(GUIDED_PHASE.TASK);
      if (mission.conversation.task) {
        await addMessages([mission.conversation.task], mentor);
      }

      setPhase(GUIDED_PHASE.ACTIVE);
    } else {
      setPhase(CHALLENGE_PHASE.SITUATION);
      const introMessages = [...memoryMessages];
      if (mission.conversation.situation) {
        introMessages.push(...mission.conversation.situation);
      }
      if (introMessages.length > 0) {
        await addMessages(introMessages, mentor);
      }
      setPhase(CHALLENGE_PHASE.ACTIVE);
    }
  };

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
      GUIDED_PHASE,
      CHALLENGE_PHASE,
    });
  }, [levelId, subLevelId, missionData, pyodide, addMessages, triggerAchievementToast]);

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

    triggerIntroWithMemory();
  }, [mission, datasetsLoaded, briefingAccepted]);

  // --- Handle code run ---
  const handleRun = useCallback(async () => {
    if (!pyodide.isReady || !engineRef.current) return;

    const codeToRun = editorRef.current?.getCode?.() || code;
    if (!codeToRun.trim()) return;

    // Reset old result before executing
    setLastExpressionResult(null);

    // Call execution
    const runResult = await pyodide.runCode(codeToRun);
    
    // Save evaluated expression result to notebook state
    if (runResult.lastExpressionResult) {
      setLastExpressionResult(runResult.lastExpressionResult);
    }

    // Call Validation and handle engine reaction flow
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
  const rewards = RewardEngine.calculateRewards(mission.points || mission.rewards, {
    hintsUsed,
    isChallenge,
  });
  const earnedDp = earnedDPState !== null ? earnedDPState : rewards.earnedDP;

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
            <p className="level-complete-card__subtitle">You survived your first week at NovaMetrics.</p>
            <div className="level-complete-card__divider" />
            <p className="level-complete-card__achievement">
              You inspected, sized, verified, and statistically summarized files like a professional. Maya promoted you!
            </p>
            <div className="level-complete-card__promo">
              <span className="level-complete-card__promo-icon">⚡</span>
              <span className="level-complete-card__promo-text">
                Promoted to: <strong>Data Quality Team</strong>
              </span>
            </div>
            <button
              className="level-complete-card__btn"
              onClick={() => navigate('/dashboard')}
              id="promotion-confirm-btn"
            >
              Advance to Level 2
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Previous Sub-level tracking ID helper
const getPreviousSubLevelId = (id) => {
  const mapping = {
    '1.2': '1.1',
    '1.3': '1.2',
    '1.4': '1.3',
    '1.5': '1.4',
    '1.6': '1.5',
    '1.7': '1.6',
  };
  return mapping[id] || null;
};

// Achievement Titles and Descriptions
const ACHIEVEMENT_REGISTRY = {
  'first-run': {
    title: 'First Successful Run',
    description: 'You loaded your first dataset and printed it using Pandas!',
    icon: '🚀'
  },
  'no-hints': {
    title: 'No Hint Completion',
    description: 'Completed a sub-level without using any hints.',
    icon: '🧠'
  },
  'perfect-week': {
    title: 'Perfect First Week',
    description: 'Completed all Level 1 guided sub-levels without using a single hint.',
    icon: '⭐'
  },
  'performance-review': {
    title: 'First Performance Review',
    description: 'Successfully completed the Level 1 challenge and earned a promotion.',
    icon: '👔'
  },
  'fast-learner': {
    title: 'Fast Learner',
    description: 'Solved a sub-level on your very first try.',
    icon: '⚡'
  },
  'curious-analyst': {
    title: 'Curious Analyst',
    description: 'Attempted a sub-level 4+ times or viewed all hints.',
    icon: '🔍'
  }
};

export default MissionView;
