import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    // Animate grid background
    const canvas = document.getElementById('landing-grid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let offset = 0;
    function drawGrid() {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const gridSize = 60;
      const shiftX = offset % gridSize;
      const shiftY = (offset * 0.5) % gridSize;

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)';
      ctx.lineWidth = 1;

      for (let x = -gridSize + shiftX; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = -gridSize + shiftY; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Radial glow at center
      const grd = ctx.createRadialGradient(
        width / 2, height * 0.35, 0,
        width / 2, height * 0.35, width * 0.45
      );
      grd.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
      grd.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      offset += 0.15;
      animFrame = requestAnimationFrame(drawGrid);
    }
    drawGrid();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleStart = () => {
    navigate('/dashboard');
  };

  return (
    <div className="landing" id="landing-page">
      <canvas id="landing-grid-canvas" className="landing__grid-canvas" />

      {/* ===== Hero Section ===== */}
      <section className="landing__hero" ref={heroRef}>
        <div className="landing__hero-badge animate-fade-in-up">
          <span className="landing__hero-badge-dot" />
          Interactive Learning Platform
        </div>

        <h1 className="landing__title animate-fade-in-up stagger-1">
          Master Data Analysis<br />
          Through <span className="gradient-text">Real Challenges</span>
        </h1>

        <p className="landing__subtitle animate-fade-in-up stagger-2">
          Join <strong>NovaMetrics</strong> as a Junior Data Analyst.
          Learn Pandas &amp; NumPy by solving realistic business problems — 
          all in your browser.
        </p>

        <div className="landing__cta-group animate-fade-in-up stagger-3">
          <button
            className="landing__cta-primary"
            onClick={handleStart}
            id="start-journey-btn"
          >
            <span className="landing__cta-text">Begin Your Journey</span>
            <span className="landing__cta-arrow">→</span>
          </button>
          <p className="landing__cta-note">No signup required · Progress saves in your browser</p>
        </div>

        {/* Floating code preview */}
        <div className="landing__code-preview animate-fade-in-up stagger-4">
          <div className="landing__code-header">
            <span className="landing__code-dot landing__code-dot--red" />
            <span className="landing__code-dot landing__code-dot--yellow" />
            <span className="landing__code-dot landing__code-dot--green" />
            <span className="landing__code-filename">mission_01.py</span>
          </div>
          <pre className="landing__code-body"><code>{`import pandas as pd

df = pd.read_csv('nova_customers.csv')
print(f"Total rows: {df.shape[0]}")

# Find and remove duplicate customers
dupes = df.duplicated().sum()
print(f"Duplicates found: {dupes}")

df_clean = df.drop_duplicates()
print(f"Unique customers: {df_clean.shape[0]}")`}</code></pre>
          <div className="landing__code-output">
            <span className="landing__code-output-label">OUTPUT</span>
            <span>Total rows: 1312</span>
            <span>Duplicates found: 65</span>
            <span className="landing__code-output-success">Unique customers: 1247 ✓</span>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section className="landing__features" id="features">
        <div className="landing__features-grid">
          <div className="landing__feature-card animate-fade-in-up stagger-1">
            <div className="landing__feature-icon">📊</div>
            <h3 className="landing__feature-title">Real Datasets</h3>
            <p className="landing__feature-desc">
              Work with realistic company data — customer records, sales reports,
              sensor readings. No toy examples.
            </p>
          </div>

          <div className="landing__feature-card animate-fade-in-up stagger-2">
            <div className="landing__feature-icon">🐍</div>
            <h3 className="landing__feature-title">Python in Browser</h3>
            <p className="landing__feature-desc">
              Write and run real Python code instantly. Pandas and NumPy
              execute right here — no installs needed.
            </p>
          </div>

          <div className="landing__feature-card animate-fade-in-up stagger-3">
            <div className="landing__feature-icon">💬</div>
            <h3 className="landing__feature-title">Story-Driven</h3>
            <p className="landing__feature-desc">
              Your mentor Maya guides you through workplace scenarios.
              Every task has context, stakes, and a purpose.
            </p>
          </div>

          <div className="landing__feature-card animate-fade-in-up stagger-4">
            <div className="landing__feature-icon">🏆</div>
            <h3 className="landing__feature-title">Track Progress</h3>
            <p className="landing__feature-desc">
              Earn Data Points, unlock chapters, and build confidence.
              Your journey is saved automatically.
            </p>
          </div>
        </div>
      </section>

      {/* ===== How It Works Section ===== */}
      <section className="landing__workflow" id="how-it-works">
        <h2 className="landing__section-title animate-fade-in-up">
          How It <span className="gradient-text">Works</span>
        </h2>
        <div className="landing__workflow-steps">
          <div className="landing__step animate-fade-in-up stagger-1">
            <div className="landing__step-number">1</div>
            <div className="landing__step-content">
              <h4>Maya sends a task</h4>
              <p>A realistic data problem from NovaMetrics lands in your chat.</p>
            </div>
          </div>
          <div className="landing__step-connector" />
          <div className="landing__step animate-fade-in-up stagger-2">
            <div className="landing__step-number">2</div>
            <div className="landing__step-content">
              <h4>You write Python code</h4>
              <p>Use Pandas, NumPy, and real datasets to solve the problem.</p>
            </div>
          </div>
          <div className="landing__step-connector" />
          <div className="landing__step animate-fade-in-up stagger-3">
            <div className="landing__step-number">3</div>
            <div className="landing__step-content">
              <h4>Instant validation</h4>
              <p>Your code runs in the browser and results are checked automatically.</p>
            </div>
          </div>
          <div className="landing__step-connector" />
          <div className="landing__step animate-fade-in-up stagger-4">
            <div className="landing__step-number">4</div>
            <div className="landing__step-content">
              <h4>Level up</h4>
              <p>Earn points, get feedback, and move to the next challenge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="landing__bottom-cta">
        <div className="landing__bottom-cta-inner animate-fade-in-up">
          <h2>Ready to become a data analyst?</h2>
          <p>Start with your first mission. No signup, no install, no excuses.</p>
          <button
            className="landing__cta-primary"
            onClick={handleStart}
            id="bottom-start-btn"
          >
            <span className="landing__cta-text">Start Now</span>
            <span className="landing__cta-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="landing__footer">
        <p>
          DataMastery — Learn by doing.
          Powered by <a href="https://pyodide.org" target="_blank" rel="noopener noreferrer">Pyodide</a>,
          built with React.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
