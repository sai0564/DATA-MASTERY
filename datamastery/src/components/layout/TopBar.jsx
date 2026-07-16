import { Link, useLocation, useParams } from 'react-router-dom';
import { getTotalDP } from '../../stores/progressStore.js';
import { getSubLevel } from '../../content/levelRegistry.js';
import { MENTORS } from '../../utils/constants.js';
import './TopBar.css';

function TopBar() {
  const location = useLocation();
  const totalDP = getTotalDP();

  // Extract route params for breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isLevelDetail = pathParts[0] === 'level' && pathParts.length === 2;
  const isMission = pathParts[0] === 'level' && pathParts.length >= 3;
  const levelId = pathParts[1] || null;
  const subLevelId = pathParts[2] || null;

  // Look up mission data for breadcrumbs
  let missionData = null;
  let levelTitle = '';
  let subLevelTitle = '';
  let mentorData = null;

  if (isMission && levelId && subLevelId) {
    missionData = getSubLevel(levelId, subLevelId);
    if (missionData) {
      levelTitle = missionData.level.title;
      subLevelTitle = missionData.subLevel.title;
      const mentor = missionData.subLevel.mentor || missionData.level.mentor;
      mentorData = MENTORS[mentor];
    }
  }

  const navItems = [
    { path: '/dashboard', label: 'Career', icon: '🎯' },
    { path: '/playground', label: 'Playground', icon: '🧪' },
  ];

  return (
    <header className="topbar" id="topbar">
      <div className="topbar__inner">
        <Link to="/dashboard" className="topbar__brand">
          <span className="topbar__logo">
            <span className="topbar__logo-icon">◆</span>
          </span>
          <span className="topbar__name">
            Data<span className="topbar__name-accent">Mastery</span>
          </span>
        </Link>

        {/* Breadcrumbs — shown when inside a level or mission */}
        {(isLevelDetail || isMission) ? (
          <nav className="topbar__breadcrumbs" aria-label="Breadcrumbs">
            <Link to="/dashboard" className="topbar__crumb">
              Career
            </Link>
            <span className="topbar__crumb-sep">›</span>
            {levelId && (
              <Link
                to={`/level/${levelId}`}
                className={`topbar__crumb ${!isMission ? 'topbar__crumb--current' : ''}`}
              >
                {levelTitle || levelId}
              </Link>
            )}
            {isMission && (
              <>
                <span className="topbar__crumb-sep">›</span>
                <span className="topbar__crumb topbar__crumb--current">
                  {missionData?.subLevel.type === 'challenge' && '🏆 '}
                  {subLevelId} {subLevelTitle}
                </span>
              </>
            )}
            {isMission && mentorData && (
              <span className="topbar__mentor-badge">
                {mentorData.emoji} {mentorData.name}
              </span>
            )}
          </nav>
        ) : (
          <nav className="topbar__nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`topbar__nav-item ${
                  location.pathname.startsWith(item.path) ||
                  (item.path === '/dashboard' && location.pathname.startsWith('/level'))
                    ? 'topbar__nav-item--active' : ''
                }`}
              >
                <span className="topbar__nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="topbar__right">
          <div className="topbar__points" id="topbar-points">
            <span className="topbar__points-icon">⚡</span>
            <span className="topbar__points-value">{totalDP}</span>
            <span className="topbar__points-label">DP</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
