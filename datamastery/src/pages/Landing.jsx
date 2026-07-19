import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Sparkles, Play, RefreshCw, CheckCircle, Code2, Shield, Layers, HelpCircle, FileText } from 'lucide-react';
import { useTheme as useNextTheme } from 'next-themes';

import BackgroundBeams from '../components/design/BackgroundBeams.jsx';
import { DotPattern } from '@/registry/magicui/dot-pattern';
import { MagicCard } from '@/registry/magicui/magic-card';
import { BlurFade } from '@/registry/magicui/blur-fade';
import { FontWeightText } from '@/registry/eldoraui/font-weight-text';
import ThemeToggle from '../components/ThemeToggle.jsx';

import './Landing.css';

function Landing() {
  const navigate = useNavigate();
  const { theme, setTheme } = useNextTheme();

  const handleStart = () => navigate('/dashboard');
  const handlePlayground = () => navigate('/playground');

  // 4–6 Premium Benefit Feature Cards
  const features = [
    {
      title: 'Workplace Database Contexts',
      desc: 'Solve data queries using production retail telemetry, subscription churn lists, and HR headcount records.',
      icon: <Database className="w-6 h-6 text-[#3b82f6]" />
    },
    {
      title: 'In-Browser Sandbox Compilation',
      desc: 'Evaluate numpy arrays and pandas Series natively in your browser using Pyodide WebAssembly sandboxes.',
      icon: <Code2 className="w-6 h-6 text-[#6366f1]" />
    },
    {
      title: 'Interactive Variables Explorer',
      desc: 'Inspect dataframe shapes, dimensions, and type registers dynamically as you compile script iterations.',
      icon: <Layers className="w-6 h-6 text-amber-500" />
    },
    {
      title: 'Guided Code Reviews',
      desc: 'Receive code styling recommendations, data aggregations hints, and optimization advice from Maya.',
      icon: <Sparkles className="w-6 h-6 text-emerald-500" />
    }
  ];

  // --- Interactive Notebook Preview Demo States ---
  const [demoStep, setDemoStep] = useState(0); // 0: Briefing, 1: Typing, 2: Executing, 3: Show Output, 4: Success
  const [demoCode, setDemoCode] = useState("import pandas as pd\ndf = pd.read_csv('customers.csv')\n");

  const targetCode = "import pandas as pd\ndf = pd.read_csv('customers.csv')\n\n# Group customers by segment and calculate average spent\nsegment_spending = df.groupby('segment')['spent'].mean() \\\n                      .sort_values(ascending=False)\nprint(segment_spending.head(3))";

  const triggerNotebookDemo = () => {
    if (demoStep !== 0) {
      setDemoStep(0);
      setDemoCode("import pandas as pd\ndf = pd.read_csv('customers.csv')\n");
      return;
    }

    setDemoStep(1); // Start Typing
    let currentIndex = "import pandas as pd\ndf = pd.read_csv('customers.csv')\n".length;

    const interval = setInterval(() => {
      if (currentIndex < targetCode.length) {
        setDemoCode(targetCode.slice(0, currentIndex + 2));
        currentIndex += 2;
      } else {
        clearInterval(interval);
        setDemoStep(2); // Start Executing

        setTimeout(() => {
          setDemoStep(3); // Show Output Table

          setTimeout(() => {
            setDemoStep(4); // Success Banner
          }, 1000);
        }, 1200);
      }
    }, 20);
  };

  return (
    <div className="landing-modern" id="landing-page">
      {/* Background Effects */}
      <BackgroundBeams />

      {/* Floating Glass Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <a href="#" className="landing-nav__brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <span className="landing-nav__logo">◆</span>
            <span className="landing-nav__name">Data<span className="gradient-text">Mastery</span></span>
          </a>

          <div className="landing-nav__links">
            <a href="#why" className="landing-nav__link">Why Us</a>
            <a href="#preview" className="landing-nav__link">Notebook Preview</a>
            <a href="#playground" className="landing-nav__link">Playground</a>
          </div>

          <div className="landing-nav__actions">
            <ThemeToggle className="landing-nav__theme-toggler" />
            <button onClick={handleStart} className="landing-nav__cta">
              Start Learning →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <DotPattern className="absolute inset-0 z-0 opacity-20" width={24} height={24} glow={true} />

        <BlurFade delay={0.1}>
          <h1 className="landing-hero__title flex flex-col items-center">
            <span className="text-zinc-400 font-medium text-lg md:text-xl uppercase tracking-widest mb-3">Become a Data Analyst</span>
            <FontWeightText
              text="Through Real Code."
              fontSize={54}
              minWeight={300}
              maxWeight={840}
              className="text-[#3b82f6] font-extrabold tracking-tight leading-none"
            />
          </h1>
        </BlurFade>

        <BlurFade delay={0.25}>
          <p className="landing-hero__subtitle">
            Join <strong>NovaMetrics</strong> as a Junior Data Analyst. Learn Pandas, NumPy,
            and data tools by solving realistic workplace data problems —
            all inside your browser. No environment setups. Just pure coding.
          </p>
        </BlurFade>

        <BlurFade delay={0.4}>
          <div className="landing-hero__cta-wrapper flex gap-4">
            <button onClick={handleStart} className="landing-hero__btn" id="start-journey-btn">
              <span>Start Learning</span>
              <span className="landing-hero__btn-arrow">→</span>
            </button>
            <button onClick={handlePlayground} className="landing-hero__btn btn--secondary" id="playground-btn">
              <span>Open Playground</span>
            </button>
          </div>
          <span className="landing-hero__note text-zinc-500 text-xs mt-2 block">No signup required · saves progress locally</span>
        </BlurFade>

        {/* Realistic Notebook Mockup replacing Terminal */}
        <BlurFade delay={0.55} direction="up">
          <div className="landing-hero__notebook-mockup-wrapper">
            <div className="landing-hero__notebook-mockup">
              <div className="notebook-mockup__header">
                <div className="notebook-mockup__window-controls">
                  <span className="dot dot--red" />
                  <span className="dot dot--yellow" />
                  <span className="dot dot--green" />
                </div>
                <span className="notebook-mockup__tab">📊 customers_dashboard.ipynb</span>
              </div>
              <div className="notebook-mockup__body">
                {/* Code cell */}
                <div className="notebook-mockup__cell notebook-mockup__cell--code">
                  <div className="cell-num">In [1]:</div>
                  <pre className="cell-content font-mono">
                    <code>{`import pandas as pd
df = pd.read_csv('customers.csv')

# Analyze customer metrics by segment
summary = df.groupby('segment')['spent'].mean()
summary`}</code>
                  </pre>
                </div>
                {/* Output cell */}
                <div className="notebook-mockup__cell notebook-mockup__cell--output">
                  <div className="cell-num">Out [1]:</div>
                  <div className="cell-table-container">
                    <table className="notebook-mockup__table font-mono">
                      <thead>
                        <tr>
                          <th>segment</th>
                          <th>spent (mean)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Enterprise</td>
                          <td>$14,250.00</td>
                        </tr>
                        <tr>
                          <td>Growth</td>
                          <td>$4,890.00</td>
                        </tr>
                        <tr>
                          <td>Startup</td>
                          <td>$1,220.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Mini Maya Assistant card overlaid */}
                <div className="notebook-mockup__assistant-overlay animate-fade-in-up">
                  <div className="assistant-overlay__header flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Maya (Senior Analyst)</span>
                  </div>
                  <p className="assistant-overlay__text">
                    "Excellent segmentation. Enterprise clients account for 72% of total revenue. Let's merge this with `sales.csv` next!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Why DataMastery benefits */}
      <section id="why" className="landing-features">
        <BlurFade delay={0.1}>
          <div className="landing-features__header">
            <h2>Why <span className="gradient-text">DataMastery</span></h2>
            <p>Learn real analytical data pipelines directly by solving hands-on scripts.</p>
          </div>
        </BlurFade>

        <div className="landing-features__grid">
          {features.map((feature, idx) => (
            <BlurFade key={idx} delay={0.15 + idx * 0.05}>
              <MagicCard glowColor="rgba(59, 130, 246, 0.08)" className="p-8">
                <div className="landing-feature__icon-container mb-4">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Interactive Notebook Preview Section */}
      <section id="preview" className="landing-preview">
        <BlurFade delay={0.1}>
          <div className="landing-features__header">
            <h2>Experience the <span className="gradient-text">Workspace</span></h2>
            <p>Solve workplace tasks in our split-panel web environment.</p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <MagicCard className="landing-preview__workspace animate-fade-in-scale p-1" mode="gradient" gradientSize={300}>
            {/* Header of Workspace mockup */}
            <div className="landing-preview__workspace-header">
              <div className="landing-preview__window-controls">
                <span className="dot dot--red" />
                <span className="dot dot--yellow" />
                <span className="dot dot--green" />
              </div>
              <span className="landing-preview__tab-title">mission_workspace.py</span>
              <button
                className={`landing-preview__run-btn ${demoStep === 1 || demoStep === 2 ? 'loading' : ''}`}
                onClick={triggerNotebookDemo}
              >
                {demoStep === 0 && (
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3 fill-current" /> Run Demo
                  </span>
                )}
                {demoStep === 1 && '✏️ Typing Code...'}
                {demoStep === 2 && '⏳ Compiling...'}
                {demoStep > 2 && (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Reset Demo
                  </span>
                )}
              </button>
            </div>

            <div className="landing-preview__workspace-body">
              {/* Left Panel: Mentor Dialogue (Mission Briefing) */}
              <div className="landing-preview__workspace-left">
                <div className="landing-preview__panel-title">🎯 Mission Objective</div>
                <div className="landing-preview__chat-bubble maya animate-fade-in-scale">
                  <div className="chat-avatar-char">M</div>
                  <div className="chat-content">
                    <div className="chat-sender">Maya (Senior Data Analyst)</div>
                    <div className="chat-text">
                      Welcome to the team! Our first task is auditing customer transactions.
                      Let's open `customers.csv` and group client spending records.
                      Write a python snippet to group by `segment` and calculate the average `spent`.
                    </div>
                  </div>
                </div>

                {demoStep >= 1 && (
                  <div className="landing-preview__chat-bubble learner animate-fade-in-scale">
                    <div className="chat-avatar-char font-bold text-white bg-[#3b82f6]/40">Y</div>
                    <div className="chat-content">
                      <div className="chat-sender">You (Junior Analyst)</div>
                      <div className="chat-text">
                        Initiating. Importing pandas and running a segment groupby mean query.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel: Code Editor + Output (Notebook View) */}
              <div className="landing-preview__workspace-right">
                {/* Code Editor Mock */}
                <div className="landing-preview__editor">
                  <div className="editor-tab-header">
                    <span className="editor-tab active">🐍 script.py</span>
                  </div>
                  <pre className="editor-content font-mono">
                    <code>{demoCode}</code>
                    {demoStep === 1 && <span className="editor-cursor" />}
                  </pre>
                </div>

                {/* Console Output / Dataframe Table */}
                <div className="landing-preview__output">
                  <div className="output-tab-header">📟 Console Output</div>
                  <div className="output-content">
                    {demoStep === 0 && <span className="text-muted">Click Run Demo above to compile...</span>}
                    {demoStep === 1 && <span className="text-[#3b82f6] animate-pulse">Entering groupby query...</span>}
                    {demoStep === 2 && <span className="text-amber-500 animate-pulse">Running notebook in Pyodide WASM sandbox...</span>}
                    {demoStep >= 3 && (
                      <div className="dataframe-preview animate-fade-in-scale">
                        <div className="dataframe-meta">Output [1] - DataFrame (3 rows × 1 col)</div>
                        <table className="dataframe-table">
                          <thead>
                            <tr>
                              <th>segment</th>
                              <th>spent (mean)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Enterprise</td>
                              <td>$14,250.00</td>
                            </tr>
                            <tr>
                              <td>Growth</td>
                              <td>$4,890.00</td>
                            </tr>
                            <tr>
                              <td>Startup</td>
                              <td>$1,220.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {demoStep === 4 && (
                      <div className="landing-preview__success-bar animate-fade-in-up border border-[#10b981]/25">
                        <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                        <div className="success-info">
                          <h4 className="text-[#10b981]">Mission Complete!</h4>
                          <p>Earned <strong>+150 DP</strong> & unlocked Pandas Advanced aggregate methods.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>
        </BlurFade>
      </section>

      {/* Playground Preview Section */}
      <section id="playground" className="landing-playground-preview">
        <BlurFade delay={0.1}>
          <div className="landing-features__header">
            <h2>Free-form <span className="gradient-text">Data Playground</span></h2>
            <p>A standalone sandbox environment designed for quick tests and independent learning.</p>
          </div>
        </BlurFade>

        <div className="landing-playground-preview__grid">
          <div className="landing-playground-preview__text-col">
            <div className="playground-benefit">
              <div className="benefit-icon-container">
                <Database className="w-5 h-5 text-blue-500" />
              </div>
              <div className="benefit-content">
                <h4>Instant Dataset Mounting</h4>
                <p>Mount pre-loaded databases (Titanic, Wine, Iris) or upload custom CSVs with one click.</p>
              </div>
            </div>
            
            <div className="playground-benefit mt-6">
              <div className="benefit-icon-container">
                <Play className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="benefit-content">
                <h4>Code Execution & Variables</h4>
                <p>Inspect values, arrays, and lists inside a live Variables Explorer as you execute scripts.</p>
              </div>
            </div>
            
            <div className="playground-benefit mt-6">
              <div className="benefit-icon-container">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div className="benefit-content">
                <h4>One-Click Code Snippets</h4>
                <p>Paste common Pandas aggregation blocks or Matplotlib code snippets directly into your script.</p>
              </div>
            </div>

            <div className="playground-benefit mt-6">
              <button onClick={handlePlayground} className="playground-action-btn flex items-center gap-2">
                Open Free Playground →
              </button>
            </div>
          </div>
          
          <div className="landing-playground-preview__image-col">
            <MagicCard className="playground-mockup-card p-1" glowColor="rgba(124, 58, 237, 0.08)" mode="gradient">
              <div className="playground-mockup__header flex items-center justify-between">
                <span className="mock-title">Live Sandbox Environment</span>
                <span className="mock-badge font-mono">sandbox_console</span>
              </div>
              <div className="playground-mockup__inner">
                <div className="mock-sidebar">
                  <span className="sidebar-section-title">FILES</span>
                  <div className="mock-file active">📄 titanic.csv</div>
                  <div className="mock-file">📄 penguins.csv</div>
                  <div className="mock-file">📄 iris.csv</div>
                </div>
                <div className="mock-editor font-mono">
                  <pre>{`import pandas as pd
df = pd.read_csv('titanic.csv')
# Display variables explorer
df.info()`}</pre>
                  <div className="mock-variables-title mt-4">VARIABLE EXPLORER</div>
                  <div className="mock-var font-mono">df (DataFrame) - [891 rows x 8 cols]</div>
                </div>
              </div>
            </MagicCard>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta">
        <BlurFade delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.03]">
            <DotPattern className="absolute inset-0 z-0 opacity-15" width={16} height={16} glow={true} />
            <MagicCard className="landing-cta__card p-12 text-center relative z-10" glowColor="rgba(59, 130, 246, 0.08)">
              <h2>Ready to become a data analyst?</h2>
              <p>Take charge of your analytical skills. Solve real case files, code directly in the browser, and learn interactively.</p>
              <div className="flex gap-4 justify-center mt-6">
                <button onClick={handleStart} className="landing-cta__btn">
                  Start Learning Now <span>→</span>
                </button>
                <button onClick={handlePlayground} className="landing-cta__btn btn--secondary-cta">
                  Try Playground
                </button>
              </div>
            </MagicCard>
          </div>
        </BlurFade>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          DataMastery — Learn by doing. Powered by{' '}
          <a href="https://pyodide.org" target="_blank" rel="noopener noreferrer">Pyodide WebAssembly</a>. 
          No trackers. Progress saved locally in your browser.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
