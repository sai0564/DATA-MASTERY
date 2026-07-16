import { useNavigate } from 'react-router-dom';
import { levels } from '../content/levelRegistry.js';
import { getLevelStats, loadProgress } from '../stores/progressStore.js';
import { MENTORS } from '../utils/constants.js';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const progress = loadProgress();

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
    </div>
  );
}

export default Dashboard;
