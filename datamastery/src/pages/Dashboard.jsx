import { useNavigate } from 'react-router-dom';
import { levels } from '../content/levelRegistry.js';
import { getLevelStats, loadProgress } from '../stores/progressStore.js';
import { MENTORS, ACHIEVEMENT_REGISTRY } from '../utils/constants.js';
import './Dashboard.css';


function Dashboard() {
  const navigate = useNavigate();
  const progress = loadProgress();
  const achievements = progress.achievements || {};

  const totalDP = progress.totalDP || 0;
  const totalCompleted = progress.completedCount || 0;
  const totalSubLevels = levels.reduce((sum, l) => sum + l.subLevels.length, 0);

  const handleLevelClick = (level) => {
    const stats = getLevelStats(level.id);
    if (stats.status === 'locked') return;
    navigate(`/level/${level.id}`);
  };

  return (
    <div className="dashboard" id="dashboard-page">
      <div className="dashboard__header animate-fade-in-up">
        <div className="dashboard__header-text">
          <h1 className="dashboard__title">Your Career</h1>
          <p className="dashboard__subtitle">
            Complete each level to advance your career at NovaMetrics.
          </p>
        </div>
        <div className="dashboard__stats">
          <div className="dashboard__stat">
            <span className="dashboard__stat-value">{totalDP}</span>
            <span className="dashboard__stat-label">Data Points</span>
          </div>
          <div className="dashboard__stat">
            <span className="dashboard__stat-value">{totalCompleted}/{totalSubLevels}</span>
            <span className="dashboard__stat-label">Sub-levels</span>
          </div>
        </div>
      </div>

      <div className="dashboard__levels">
        {levels.map((level, index) => {
          const stats = getLevelStats(level.id);
          const mentorData = MENTORS[level.mentor];
          const progressPct = stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0;

          return (
            <button
              key={level.id}
              className={`dashboard__level-card dashboard__level-card--${stats.status} animate-fade-in-up stagger-${index + 1}`}
              onClick={() => handleLevelClick(level)}
              disabled={stats.status === 'locked'}
              id={`level-${level.id}`}
            >
              <div className="dashboard__level-icon">{level.icon}</div>
              <div className="dashboard__level-info">
                <div className="dashboard__level-meta">
                  <span className="dashboard__level-number">Level {index + 1}</span>
                  <span className="dashboard__level-mentor">
                    {mentorData?.emoji} {mentorData?.name}
                  </span>
                </div>
                <h3 className="dashboard__level-title">{level.title}</h3>
                <p className="dashboard__level-desc">{level.description}</p>
                <div className="dashboard__level-progress">
                  <div className="dashboard__progress-bar">
                    <div
                      className="dashboard__progress-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="dashboard__progress-text">
                    {stats.completed}/{stats.total} sub-levels
                    {stats.dp > 0 && ` · ${stats.dp} DP`}
                  </span>
                </div>
              </div>
              {stats.status === 'locked' && (
                <div className="dashboard__level-lock">🔒</div>
              )}
              {stats.status === 'active' && (
                <div className="dashboard__level-arrow">→</div>
              )}
              {stats.status === 'completed' && (
                <div className="dashboard__level-check">✅</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Achievements Section */}
      <div className="dashboard__achievements animate-fade-in-up stagger-3">
        <h2 className="dashboard__achievements-title">Achievements Showcase</h2>
        <div className="dashboard__achievements-grid">
          {Object.entries(ACHIEVEMENT_REGISTRY).map(([key, details]) => {
            const unlocked = !!achievements[key]?.unlocked;
            return (
              <div 
                key={key} 
                className={`achievement-card achievement-card--${unlocked ? 'unlocked' : 'locked'}`}
                id={`achievement-${key}`}
              >
                <div className="achievement-card__icon">{details.icon}</div>
                <div className="achievement-card__info">
                  <h4 className="achievement-card__title">{details.title}</h4>
                  <p className="achievement-card__desc">{details.description}</p>
                  {unlocked && achievements[key]?.unlockedAt && (
                    <span className="achievement-card__date">
                      Unlocked {new Date(achievements[key].unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
