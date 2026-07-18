import { useNavigate } from 'react-router-dom';
import BackgroundBeams from '../components/design/BackgroundBeams.jsx';
import DotPattern from '../components/design/DotPattern.jsx';
import MagicCard from '../components/design/MagicCard.jsx';
import Terminal from '../components/design/Terminal.jsx';
import AnimatedBadge from '../components/design/AnimatedBadge.jsx';
import FontWeightText from '../components/design/FontWeightText.jsx';
import BlurFade from '../components/design/BlurFade.jsx';
import AnimatedFrameworks from '../components/design/AnimatedFrameworks.jsx';
import InfiniteMovingCards from '../components/design/InfiniteMovingCards.jsx';
import TracingBeam from '../components/design/TracingBeam.jsx';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  const handleStart = () => navigate('/dashboard');

  const terminalCommands = [
    { type: 'command', text: 'python datamastery.py' },
    { type: 'output', text: '✓ Python 3.12 loaded' },
    { type: 'output', text: '✓ Pandas 2.2.3' },
    { type: 'output', text: '✓ NumPy 2.0.2' },
    { type: 'output', text: '✓ Maya Ready' },
    { type: 'output', text: '✓ Notebook Ready' },
  ];

  return (
    <div className="landing-modern" id="landing-page">
      {/* Background Effects */}
      <BackgroundBeams />
      <DotPattern width={32} height={32} color="rgba(255,255,255,0.035)" />

      {/* Floating Glass Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <a href="#" className="landing-nav__brand" onClick={() => navigate('/')}>
            <span className="landing-nav__logo">◆</span>
            <span className="landing-nav__name">Data<span className="gradient-text">Mastery</span></span>
          </a>

          <div className="landing-nav__links">
            <a href="#features" className="landing-nav__link">Features</a>
            <a href="#tech" className="landing-nav__link">Tech</a>
            <a href="#roadmap" className="landing-nav__link">Roadmap</a>
          </div>

          <button onClick={handleStart} className="landing-nav__cta">
            Start Learning →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <BlurFade delay={0.1}>
          <div className="landing-hero__badges">
            <AnimatedBadge text="Interactive Learning Platform" shimmer={false} />
            <AnimatedBadge text="Browser-Based Python" shimmer={true} />
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <h1 className="landing-hero__title">
            Become a Data Analyst
            <br />
            <FontWeightText
              text="Through Real Code."
              label="Interactive Python"
              weight={800}
              hoverWeight={300}
            />
          </h1>
        </BlurFade>

        <BlurFade delay={0.35}>
          <p className="landing-hero__subtitle">
            Join <strong>NovaMetrics</strong> as a Junior Data Analyst. Learn Pandas, NumPy,
            and professional data tools by solving realistic workplace challenges —
            all inside your browser. No installations. No signups. Just pure learning.
          </p>
        </BlurFade>

        <BlurFade delay={0.5}>
          <div className="landing-hero__cta">
            <button onClick={handleStart} className="landing-hero__btn" id="start-journey-btn">
              <span>Begin Your Journey</span>
              <span className="landing-hero__btn-arrow">→</span>
            </button>
            <span className="landing-hero__note">No signup required · Progress saves locally</span>
          </div>
        </BlurFade>

        {/* Terminal Demo */}
        <BlurFade delay={0.65} direction="up">
          <TracingBeam className="landing-hero__terminal-wrapper">
            <Terminal
              title="python datamastery.py"
              commands={terminalCommands}
              prompt="$"
              autoType={false}
              className="landing-hero__terminal"
            />
          </TracingBeam>
        </BlurFade>
      </section>

      {/* Animated Tech Stack */}
      <section id="tech" className="landing-tech">
        <BlurFade>
          <AnimatedFrameworks
            title="DataMastery Tech Stack"
            description="Master professional data tools through interactive browser notebooks."
          />
        </BlurFade>
      </section>

      {/* Interactive Features */}
      <section id="features" className="landing-features">
        <div className="landing-features__header">
          <h2>Why <span className="gradient-text">DataMastery</span></h2>
          <p>Built for analysts who learn by doing, not watching.</p>
        </div>

        <div className="landing-features__grid">
          <MagicCard glowColor="rgba(99, 102, 241, 0.25)">
            <div className="landing-feature__icon">📊</div>
            <h3>Real Datasets</h3>
            <p>Work with realistic company data — customer records, sales reports, sensor readings. No toy examples.</p>
          </MagicCard>

          <MagicCard glowColor="rgba(139, 92, 246, 0.25)">
            <div className="landing-feature__icon">🐍</div>
            <h3>Python in Browser</h3>
            <p>Write and run real Python instantly. Pandas and NumPy execute right here — no installs needed.</p>
          </MagicCard>

          <MagicCard glowColor="rgba(251, 191, 36, 0.15)">
            <div className="landing-feature__icon">💬</div>
            <h3>Story-Driven</h3>
            <p>Your mentor Maya guides you through workplace scenarios with real stakes and purpose.</p>
          </MagicCard>

          <MagicCard glowColor="rgba(16, 185, 129, 0.15)">
            <div className="landing-feature__icon">🏆</div>
            <h3>Track Progress</h3>
            <p>Earn Data Points, unlock chapters, build confidence. Your journey saves automatically.</p>
          </MagicCard>
        </div>
      </section>

      {/* Moving Cards */}
      <section id="roadmap" className="landing-roadmap">
        <h2>Learning <span className="gradient-text">Roadmap</span></h2>
        <p>From beginner to analyst — one mission at a time.</p>
        <InfiniteMovingCards speed={30} />
      </section>

      {/* How It Works */}
      <section className="landing-how">
        <h2>How It <span className="gradient-text">Works</span></h2>
        <div className="landing-how__steps">
          {[
            { num: '1', title: 'Maya sends a task', desc: 'A realistic data problem from NovaMetrics lands in your chat.' },
            { num: '2', title: 'You write Python', desc: 'Use Pandas, NumPy, and real datasets to solve the challenge.' },
            { num: '3', title: 'Instant validation', desc: 'Your code runs in the browser and results are checked automatically.' },
            { num: '4', title: 'Level up', desc: 'Earn points, get feedback, and advance to the next mission.' },
          ].map((step) => (
            <div key={step.num} className="landing-how__step">
              <div className="landing-how__step-num">{step.num}</div>
              <div className="landing-how__step-content">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta">
        <MagicCard className="landing-cta__card">
          <h2>Ready to become a data analyst?</h2>
          <p>Start with your first mission. No signup required. Just code.</p>
          <button onClick={handleStart} className="landing-cta__btn">
            Start Now <span>→</span>
          </button>
        </MagicCard>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          DataMastery — Learn by doing. Powered by{' '}
          <a href="https://pyodide.org" target="_blank" rel="noopener noreferrer">Pyodide</a>,
          built with React.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
