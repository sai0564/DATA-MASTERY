import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LevelDetail from './pages/LevelDetail.jsx';
import MissionView from './pages/MissionView.jsx';
import Playground from './pages/Playground.jsx';
import './styles/index.css';
import './styles/animations.css';

import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/level/:levelId" element={<LevelDetail />} />
        <Route path="/level/:levelId/:subLevelId" element={<MissionView />} />
        <Route path="/playground" element={<Playground />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
