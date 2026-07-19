/* eslint-disable react-refresh/only-export-components */
import { StrictMode, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Landing from './pages/Landing.jsx';
import { AppErrorBoundary } from './components/ErrorBoundaries/AppError.jsx';
import './styles/index.css';
import './styles/animations.css';

import { createRoot } from 'react-dom/client';

// Lazy loaded routes for performance
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const LevelDetail = lazy(() => import('./pages/LevelDetail.jsx'));
const MissionView = lazy(() => import('./pages/MissionView.jsx'));
const Playground = lazy(() => import('./pages/Playground.jsx'));

// Generic loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
    <div className="mission-view__loader-icon animate-pulse" style={{ fontSize: '3rem' }}>🐍</div>
  </div>
);

import { ThemeProvider } from 'next-themes';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AppErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<App />}>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/level/:levelId" element={<LevelDetail />} />
                <Route path="/level/:levelId/:subLevelId" element={<MissionView />} />
                <Route path="/playground" element={<Playground />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppErrorBoundary>
    </ThemeProvider>
  </StrictMode>
);
