import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLevel } from '../content/levelRegistry.js';
import { getLevelStats, loadProgress } from '../stores/progressStore.js';
import { MENTORS } from '../utils/constants.js';
import './LevelDetail.css';

function LevelDetail() {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const level = getLevel(levelId);
  const stats = getLevelStats(levelId);
  const progress = loadProgress();
  const levelProgress = progress.levels[levelId];

  if (!level) {
    return (
      <div className="level-detail level-detail--error">
        <p>Level not found: {levelId}</p>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>
    );
  }

  const mentorData = MENTORS[level.mentor];
  const progressPct = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const handleSubLevelClick = (sub) => {
    const subProgress = levelProgress?.subLevels[sub.id];
    if (!subProgress?.unlocked && !subProgress?.completed) return;
    navigate(`/level/${levelId}/${sub.id}`);
  };

  const getSubStatus = (sub) => {
    const subProgress = levelProgress?.subLevels[sub.id];
    if (!subProgress) return 'locked';
    if (subProgress.completed) return 'completed';
    if (subProgress.unlocked) return 'active';
    return 'locked';
  };

  return (
    <div className="level-detail" id="level-detail-page">
      {/* Header */}
      <div className="level-detail__header animate-fade-in-up">
        <Link to="/dashboard" className="level-detail__back">← Dashboard</Link>
        <div className="level-detail__header-content">
          <div className="level-detail__icon">{level.icon}</div>
          <div className="level-detail__header-text">
            <h1 className="level-detail__title">{level.title}</h1>
            <p className="level-detail__desc">{level.description}</p>
            <div className="level-detail__meta">
              <span className="level-detail__mentor">
                {mentorData?.emoji} with {mentorData?.name}
              </span>
              <span className="level-detail__progress-text">
                {stats.completed}/{stats.total} complete · {stats.dp} DP earned
              </span>
            </div>
          </div>
        </div>
        <div className="level-detail__progress-bar">
          <div
            className="level-detail__progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Sub-level roadmap */}
      <div className="level-detail__path">
        {level.subLevels.map((sub, index) => {
          const status = getSubStatus(sub);
          const isChallenge = sub.type === 'challenge';
          const dp = levelProgress?.subLevels[sub.id]?.dp || 0;
          const duration = sub.estDuration || '3m';
          
          const basePoints = sub.rewards?.basePoints || sub.points?.base || 50;
          const bonusPoints = sub.rewards?.bonusPoints || sub.points?.bonus || 10;

          return (
            <div key={sub.id} className="level-detail__step-wrapper">
              {index > 0 && (
                <div className={`level-detail__connector-node level-detail__connector-node--${status}`}>
                  <span className="level-detail__connector-arrow">↓</span>
                </div>
              )}
              <button
                className={`level-detail__step level-detail__step--${status} ${isChallenge ? 'level-detail__step--challenge' : ''} animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
                onClick={() => handleSubLevelClick(sub)}
                disabled={status === 'locked'}
                id={`sublevel-${sub.id}`}
              >
                <div className="level-detail__step-indicator">
                  {status === 'completed' && '✅'}
                  {status === 'active' && (isChallenge ? '⭐' : '▶')}
                  {status === 'locked' && '🔒'}
                </div>
                <div className="level-detail__step-content">
                  <div className="level-detail__step-meta">
                    <span className="level-detail__step-id">
                      {isChallenge ? 'Final Challenge' : `Mission ${sub.id}`}
                    </span>
                    <span className="level-detail__step-duration">⏱️ {duration}</span>
                  </div>
                  <h3 className="level-detail__step-title">{sub.title}</h3>
                  <div className="level-detail__step-footer">
                    {status === 'completed' ? (
                      <span className="level-detail__step-dp-earned">Earned: +{dp} DP</span>
                    ) : (
                      <div className="level-detail__step-rewards">
                        <span className="badge-base">+{basePoints} DP</span>
                        {bonusPoints > 0 && <span className="badge-bonus">+{bonusPoints} Bonus</span>}
                      </div>
                    )}
                    {status === 'active' && (
                      <span className="level-detail__step-action">
                        {isChallenge ? 'Begin Challenge' : 'Start Mission'}
                      </span>
                    )}
                  </div>
                </div>
                {status === 'active' && (
                  <div className="level-detail__step-arrow">→</div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LevelDetail;
