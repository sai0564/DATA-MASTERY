import { Outlet, useLocation } from 'react-router-dom';
import { PyodideProvider } from './context/PyodideContext.jsx';
import TopBar from './components/layout/TopBar.jsx';

function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  // Only wrap with PyodideProvider when we actually need Python execution
  // (mission and playground pages). Landing, dashboard, and level detail don't need it.
  const needsPyodide =
    location.pathname.startsWith('/level/') && location.pathname.split('/').length >= 4 ||
    location.pathname.startsWith('/playground');

  const content = (
    <>
      {!isLanding && <TopBar />}
      <main className={isLanding ? '' : 'app-main'}>
        <Outlet />
      </main>
    </>
  );

  if (needsPyodide) {
    return <PyodideProvider>{content}</PyodideProvider>;
  }

  return content;
}

export default App;
