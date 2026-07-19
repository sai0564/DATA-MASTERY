import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePyodideContext } from '../context/PyodideContext.jsx';
import { getSubLevel, getNextSubLevel, levels } from '../content/levelRegistry.js';
import { DatasetEngine } from '../engine/DatasetEngine.js';
import { MissionEngine } from '../engine/MissionEngine.js';
import { ConversationEngine } from '../engine/ConversationEngine.js';
import { SaveSystem } from '../engine/SaveSystem.js';
import { MENTORS } from '../utils/constants.js';
import CodeEditor from '../components/editor/CodeEditor.jsx';
import OutputPanel from '../components/editor/OutputPanel.jsx';
import {
  Award, Clock, Sparkles, CheckCircle2, Lock, Play, FileText, X,
  ChevronLeft, Loader2, Zap, FolderOpen, AlertTriangle, BookOpen, HelpCircle, AlertCircle
} from 'lucide-react';
import './MissionView.css';

function MissionView() {
  const { levelId, subLevelId } = useParams();
  const navigate = useNavigate();
  const pyodide = usePyodideContext();
  const editorRef = useRef(null);

  // --- Core states ---
  const [phase, setPhase] = useState('loading');
  const [output, setOutput] = useState({ stdout: '', stderr: '', error: null });
  const [lastExpressionResult, setLastExpressionResult] = useState(null);
  const [datasetsLoaded, setDatasetsLoaded] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [code, setCode] = useState('');
  const [earnedDPState, setEarnedDPState] = useState(null);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [activeGuidedStepIndex, setActiveGuidedStepIndex] = useState(0);
  
  // Experience Engine States
  const [briefingAccepted, setBriefingAccepted] = useState(false);
  const [inspectDataset, setInspectDataset] = useState(null);
  const [activeToasts, setActiveToasts] = useState([]);
  
  // Interactive Maya Card States
  const [hintClickCount, setHintClickCount] = useState(0);

  const engineRef = useRef(null);
  const prevSubLevelRef = useRef(null);
  const codeLoadedRef = useRef(null);

  // Resolve mission details
  const missionData = getSubLevel(levelId, subLevelId);
  const level = missionData?.level;
  const mission = missionData?.subLevel;
  const isChallenge = mission?.type === 'challenge';

  const isComplete = phase === 'complete';
  const isActive = phase === 'active' || phase === 'situation' || phase === 'task';

  // Static adapt to prevent resets on run
  useEffect(() => {
    const missionKey = `${levelId}/${subLevelId}`;
    if (prevSubLevelRef.current === missionKey) return;
    
    setPhase('loading');
    setOutput({ stdout: '', stderr: '', error: null });
    setLastExpressionResult(null);
    setDatasetsLoaded(false);
    setHintsUsed(0);
    setEarnedDPState(null);
    setLevelCompleted(false);
    setBriefingAccepted(false);
    setInspectDataset(null);
    setActiveGuidedStepIndex(0);
    setHintClickCount(0);

    prevSubLevelRef.current = missionKey;
  }, [levelId, subLevelId]);

  // Load saved code
  useEffect(() => {
    if (!mission || !levelId || !subLevelId) return;
    const missionKey = `${levelId}/${subLevelId}`;
    if (codeLoadedRef.current === missionKey) return;

    const savedCode = SaveSystem.getCode(levelId, subLevelId);
    const starter = savedCode || mission.starterCode || '';
    if (editorRef.current?.setCode) {
      editorRef.current.setCode(starter);
    }
    setCode(starter);
    codeLoadedRef.current = missionKey;
  }, [levelId, subLevelId, mission]);

  // Toast achievements
  const triggerAchievementToast = useCallback((id) => {
    const toast = { id: Date.now(), title: id, description: "Unlocked progress marker." };
    setActiveToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 4000);
  }, []);

  // Initialize MissionEngine
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
        if (updates.output !== undefined) {
          setOutput(updates.output);
          if (updates.output.error) setLastExpressionResult(null);
        }
        if (updates.datasetsLoaded !== undefined) setDatasetsLoaded(updates.datasetsLoaded);
        if (updates.earnedDP !== undefined) setEarnedDPState(updates.earnedDP);
        if (updates.levelCompleted !== undefined) {
          setTimeout(() => {
            setLevelCompleted(updates.levelCompleted);
          }, 3500);
        }
        if (updates.newlyUnlocked !== undefined && updates.newlyUnlocked.length > 0) {
          updates.newlyUnlocked.forEach((id) => triggerAchievementToast(id));
        }
      },
      addMessages: () => Promise.resolve(), // stub chat
      setMessages: () => {}, // stub chat
      GUIDED_PHASE: { SITUATION: 'situation', ACTIVE: 'active', COMPLETE: 'complete' },
      CHALLENGE_PHASE: { SITUATION: 'situation', ACTIVE: 'active', COMPLETE: 'complete' }
    });
  }, [levelId, subLevelId, missionData, pyodide, triggerAchievementToast]);

  // Load datasets
  useEffect(() => {
    if (!mission || !pyodide.isReady || datasetsLoaded || !engineRef.current || !briefingAccepted) return;
    const seed = DatasetEngine.getOrCreateSeed();
    const datasetEngineInstance = new DatasetEngine(seed);
    engineRef.current.loadDatasets(datasetEngineInstance);
  }, [mission, pyodide.isReady, datasetsLoaded, briefingAccepted]);

  // Intro flow
  useEffect(() => {
    if (!mission || !datasetsLoaded || !engineRef.current || !briefingAccepted) return;
    engineRef.current.startIntro();
  }, [mission, datasetsLoaded, briefingAccepted]);

  // Compile steps list using a temp ConversationEngine adapter
  const steps = useMemo(() => {
    if (!mission) return [];
    const tempEngine = new ConversationEngine({
      addMessages: () => {},
      setMessages: () => {},
      setPhase: () => {},
      mentor: 'maya',
      GUIDED_PHASE: {},
      CHALLENGE_PHASE: {}
    });
    return tempEngine.getGuidedSteps(mission);
  }, [mission]);

  // Reset hint index when step changes
  useEffect(() => {
    setHintClickCount(0);
  }, [activeGuidedStepIndex]);

  // Run + validate cell
  const handleRunCell = async () => {
    if (!pyodide.isReady || !engineRef.current) return;

    const codeToRun = editorRef.current?.getCode?.() || code;
    if (!codeToRun.trim()) return;

    setLastExpressionResult(null);

    const result = await engineRef.current.runAndValidate(codeToRun, hintsUsed, (txt) => txt);
    
    if (result && result.lastExpressionResult) {
      setLastExpressionResult(result.lastExpressionResult);
    }

    // Check if step advanced
    if (result && !result.error) {
      const isStillGuided = mission.type === 'guided';
      if (isStillGuided) {
        const nextStepIndex = engineRef.current.activeGuidedStepIndex;
        if (nextStepIndex !== activeGuidedStepIndex) {
          setActiveGuidedStepIndex(nextStepIndex);
          // Scroll next cell into view
          setTimeout(() => {
            const nextCellEl = document.getElementById(`notebook-cell-${nextStepIndex}`);
            nextCellEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    }
  };

  const handleHintUsed = () => {
    setHintClickCount(prev => prev + 1);
    setHintsUsed(prev => prev + 1);
  };

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleDatasetPreview = useCallback((filename) => {
    setInspectDataset(filename);
  }, []);

  const handleNext = useCallback(() => {
    const next = getNextSubLevel(levelId, subLevelId);
    if (next) navigate(`/level/${next.level.id}/${next.subLevel.id}`);
    else navigate(`/level/${levelId}`);
  }, [navigate, levelId, subLevelId]);

  if (!missionData) {
    return (
      <div className="mission-view mission-view--error">
        <p>Sub-level not found: {levelId}/{subLevelId}</p>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>
    );
  }

  const mentor = mission.mentor || level.mentor || 'maya';
  const mentorData = MENTORS[mentor];
  const activeStep = isChallenge ? null : (steps[activeGuidedStepIndex] || steps[0] || null);

  // Dynamic values calculation
  const currentLevelIdx = levels.findIndex(l => l.id === levelId);
  const nextLevel = currentLevelIdx !== -1 && currentLevelIdx < levels.length - 1 ? levels[currentLevelIdx + 1] : null;
  const promotionTitle = nextLevel ? nextLevel.title : 'Data Mastery Legend';

  return (
    <div className="mission-view-v2" id="mission-view-page">
      
      {/* Floating Achievement Unlock Toasts */}
      <div className="achievement-toasts-container">
        {activeToasts.map((toast) => (
          <div key={toast.id} className="achievement-toast animate-slide-in-right">
            <div className="achievement-toast__icon">{toast.icon}</div>
            <div className="achievement-toast__content">
              <span className="achievement-toast__label">Achievement Unlocked!</span>
              <h4 className="achievement-toast__title">{toast.title}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Centralized Notebook Document container (Comfortable reading width: 900-1100px) */}
      <div className="notebook-container">
        
        {/* 1. Notebook Header */}
        <header className="notebook-doc-header">
          <Link to={`/level/${levelId}`} className="notebook-doc-back">
            <ChevronLeft className="w-4 h-4" /> Back to level
          </Link>
          <div className="notebook-doc-meta mt-2">
            <span className="notebook-doc-sub">{level?.title}</span>
            <h1>{mission.title}</h1>
            <p className="description-text">{mission.subtitle}</p>
          </div>
        </header>

        {/* 2. Mission Summary Card */}
        <section className="notebook-summary-card">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Mission</span>
              <span className="summary-value">{mission.title}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Dataset</span>
              <span 
                className="summary-value summary-value--file clickable" 
                onClick={() => handleDatasetPreview(mission.datasetCard?.filename || 'customers.csv')}
              >
                📄 {mission.datasetCard?.filename || 'customers.csv'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Difficulty</span>
              <span className="summary-value summary-value--diff">{mission.datasetCard?.difficulty || 'Beginner'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Estimated Time</span>
              <span className="summary-value">⏱️ {mission.estDuration || '3m'}</span>
            </div>
          </div>
          <div className="summary-outcome">
            <span className="summary-label">Expected Outcome</span>
            <p className="summary-outcome-text">{mission.learningObjective}</p>
          </div>

          {!briefingAccepted && (
            <div className="summary-action-row mt-4">
              <button 
                onClick={() => setBriefingAccepted(true)} 
                className="accept-briefing-inline-btn"
                id="accept-briefing-btn"
              >
                Accept Assignment & Load Dataset
              </button>
            </div>
          )}
        </section>

        {/* 3. Notebook cells flow vertically */}
        <div className="notebook-cells-list mt-6">
          
          {isChallenge ? (
            // CHALLENGE MODE: Render Maya inline above the single workspace cell
            <>
              {briefingAccepted && (
                <div className="maya-mentor-card-inline animate-fade-in-scale">
                  <div className="maya-mentor-card-inline__header">
                    <span className="avatar-badge">👩‍💻 Maya</span>
                    <span className="role-label">{mentorData?.role || 'Senior Analyst'}</span>
                  </div>
                  <div className="maya-mentor-card-inline__body">
                    <p className="mentor-explainer">
                      {mission.businessSituation?.join(' ') || 'Write a query to solve the challenge.'}
                    </p>

                    {/* Contextual Hints */}
                    <div className="mentor-hints-wrapper mt-3">
                      {hintClickCount === 0 && (
                        <button onClick={handleHintUsed} className="hint-btn flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" /> Show Hint
                        </button>
                      )}
                      {hintClickCount === 1 && (
                        <div className="hint-revealed">
                          <span className="hint-label">💡 Hint 1:</span>
                          <p>{mission.hints?.[0] || 'Verify spelling inputs.'}</p>
                          <button onClick={handleHintUsed} className="hint-btn mt-2">Reveal next hint</button>
                        </div>
                      )}
                      {hintClickCount === 2 && (
                        <div className="hint-revealed">
                          <span className="hint-label">💡 Hint 2:</span>
                          <p>{mission.hints?.[1] || 'Group the fields appropriately.'}</p>
                          <button onClick={handleHintUsed} className="hint-btn mt-2">Show detailed code template</button>
                        </div>
                      )}
                      {hintClickCount >= 3 && (
                        <div className="hint-revealed">
                          <span className="hint-label">🚀 Code Hint:</span>
                          <p className="font-mono text-xs text-blue-400 mt-1">{mission.hints?.[2] || 'Check pandas reference pages.'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="notebook-cell active" id="notebook-cell-challenge">
                <div className="notebook-cell__header">
                  <span className="cell-badge cell-badge--active font-mono">Cell [1]</span>
                  <span className="cell-status text-[#3b82f6]">Challenge Assignment</span>
                </div>
                <div className="notebook-cell__body">
                  <div className="cell-markdown">
                    <p>Load the customer file and show the first few records.</p>
                  </div>

                  <div className="cell-editor-container">
                    <CodeEditor
                      ref={editorRef}
                      initialCode={mission.starterCode}
                      onChange={handleCodeChange}
                      readOnly={isComplete || !briefingAccepted}
                    />
                  </div>

                  <div className="cell-actions-row">
                    <button 
                      onClick={handleRunCell} 
                      disabled={!pyodide.isReady || pyodide.isRunning || isComplete || !briefingAccepted} 
                      className="run-cell-btn"
                    >
                      {pyodide.isRunning ? '⏳ Running...' : '▶ Run Cell (Shift + Enter)'}
                    </button>
                  </div>

                  {/* Inline Cell Output */}
                  <div className="cell-output-container">
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
              </div>
            </>
          ) : (
            // GUIDED MODE: Render multiple sequential steps as cells
            steps.map((step, idx) => {
              const isCellCompleted = idx < activeGuidedStepIndex;
              const isCellActive = idx === activeGuidedStepIndex;
              const isCellLocked = idx > activeGuidedStepIndex;

              return (
                <div key={step.id} className="notebook-item-wrapper">
                  
                  {/* Render Maya inline DIRECTLY before the current active cell */}
                  {isCellActive && briefingAccepted && (
                    <div className="maya-mentor-card-inline animate-fade-in-scale">
                      <div className="maya-mentor-card-inline__header">
                        <span className="avatar-badge">👩‍💻 Maya</span>
                        <span className="role-label">{mentorData?.role || 'Senior Analyst'}</span>
                      </div>
                      <div className="maya-mentor-card-inline__body">
                        <p className="mentor-explainer">
                          {step.mentor ? (typeof step.mentor === 'function' ? step.mentor(mission.datasetCard?.filename || 'customers.csv') : step.mentor) : "Let's run this cell."}
                        </p>

                        {/* Interactive Hint Clicker */}
                        <div className="mentor-hints-wrapper mt-3">
                          {hintClickCount === 0 && (
                            <button onClick={handleHintUsed} className="hint-btn flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5" /> Show Hint
                            </button>
                          )}
                          {hintClickCount === 1 && (
                            <div className="hint-revealed">
                              <span className="hint-label">💡 Hint 1:</span>
                              <p>{mission.hints?.[0] || 'Verify code structure details.'}</p>
                              <button onClick={handleHintUsed} className="hint-btn mt-2">Reveal next hint</button>
                            </div>
                          )}
                          {hintClickCount === 2 && (
                            <div className="hint-revealed">
                              <span className="hint-label">💡 Hint 2:</span>
                              <p>{mission.hints?.[1] || 'Call pd.read_csv to import the dataset.'}</p>
                              <button onClick={handleHintUsed} className="hint-btn mt-2">Reveal code snippet</button>
                            </div>
                          )}
                          {hintClickCount >= 3 && (
                            <div className="hint-revealed">
                              <span className="hint-label">🚀 Code Hint:</span>
                              <p className="font-mono text-xs text-blue-400 mt-1">
                                {mission.hints?.[2] || 'df = pd.read_csv("customers.csv")'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div 
                    id={`notebook-cell-${idx}`}
                    className={`notebook-cell ${isCellCompleted ? 'completed' : ''} ${isCellActive ? 'active' : ''} ${isCellLocked ? 'locked' : ''}`}
                  >
                    <div className="notebook-cell__header">
                      <span className="cell-badge font-mono">Cell [{idx + 1}]</span>
                      <span className="cell-status">
                        {isCellCompleted && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>}
                        {isCellActive && <span className="flex items-center gap-1 text-[#3b82f6]"><Play className="w-3.5 h-3.5 fill-current" /> Active</span>}
                        {isCellLocked && <span className="flex items-center gap-1 text-zinc-500"><Lock className="w-3.5 h-3.5" /> Locked</span>}
                      </span>
                    </div>

                    <div className="notebook-cell__body">
                      <div className="cell-markdown">
                        <p>{step.task}</p>
                        {step.scaffoldNote && (
                          <div className="scaffold-note-callout mt-2 p-3 bg-zinc-900 border border-zinc-700/50 rounded-lg text-xs text-zinc-400">
                            ℹ️ {step.scaffoldNote}
                          </div>
                        )}
                      </div>

                      {isCellActive && (
                        <>
                          <div className="cell-editor-container">
                            <CodeEditor
                              ref={editorRef}
                              initialCode={mission.starterCode}
                              onChange={handleCodeChange}
                              readOnly={isComplete || !briefingAccepted}
                            />
                          </div>

                          <div className="cell-actions-row">
                            <button 
                              onClick={handleRunCell} 
                              disabled={!pyodide.isReady || pyodide.isRunning || isComplete || !briefingAccepted} 
                              className="run-cell-btn"
                            >
                              {pyodide.isRunning ? '⏳ Running...' : '▶ Run Cell (Shift + Enter)'}
                            </button>
                          </div>

                          {/* Inline Output inside Active Cell */}
                          <div className="cell-output-container">
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
                        </>
                      )}

                      {isCellCompleted && (
                        <div className="cell-completed-summary bg-zinc-900/40 p-4 border border-emerald-500/10 rounded-lg">
                          <span className="text-zinc-500 text-xs font-mono">Output Log:</span>
                          <pre className="text-emerald-400 text-xs mt-1 font-mono">✓ Verified successfully.</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* 4. Reflection takeaways card at bottom */}
          {isComplete && (
            <div className="notebook-cell reflection-card animate-fade-in-up mt-6">
              <div className="reflection-card__badge flex items-center justify-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                <span>Lesson Reflections Completed</span>
              </div>
              <h2>Today's Takeaways</h2>
              <div className="reflection-card__divider" />
              
              <div className="reflection-card__content text-left">
                <div className="reflection-section">
                  <h4>What you learned:</h4>
                  <ul className="reflection-list mt-2">
                    {mission.summary?.concepts.map((concept, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-zinc-300 text-sm py-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="reflection-section mt-6">
                  <h4>Why this is important in business:</h4>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    {mission.summary?.why}
                  </p>
                </div>

                <div className="reflection-grid mt-6">
                  <div className="reflection-stat-box">
                    <span className="stat-label">Accuracy Index</span>
                    <span className="stat-val text-emerald-400">92%</span>
                  </div>
                  <div className="reflection-stat-box">
                    <span className="stat-label">DP Points Earned</span>
                    <span className="stat-val text-amber-500">+{earnedDPState || 150} DP</span>
                  </div>
                </div>
              </div>

              <div className="reflection-card__actions mt-8">
                <button onClick={handleNext} className="reflection-next-btn">
                  Start Next Lesson →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Dataset Inspect Modal */}
      {inspectDataset && (
        <div className="preview-modal-overlay" onClick={() => setInspectDataset(null)} id="preview-modal">
          <div className="preview-modal-card animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h3>inspect: {inspectDataset}</h3>
              <button className="preview-modal-close" onClick={() => setInspectDataset(null)}>×</button>
            </div>
            <div className="preview-modal-body">
              <div className="briefing-card__profile">
                <div className="briefing-card__profile-row flex items-center">
                  <span className="profile-label">Filename:</span>
                  <span className="profile-value flex items-center gap-1">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {inspectDataset}
                  </span>
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

    </div>
  );
}

export default MissionView;
