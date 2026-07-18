import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement as h } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PyodideContext } from '../../src/context/PyodideContext.jsx';
import MissionView from '../../src/pages/MissionView.jsx';

const STARTER_CODE = "import pandas as pd\n\ndf = pd.read_csv('customers.csv')\n";

const makeMockPyodide = () => ({
  status: 'ready',
  isReady: true,
  isRunning: false,
  isLoading: false,
  loadingMessage: '',
  error: null,
  init: vi.fn().mockResolvedValue(undefined),
  loadDatasets: vi.fn().mockResolvedValue(undefined),
  runCode: vi.fn().mockResolvedValue({
    stdout: '',
    stderr: '',
    error: null,
    variables: {
      df: {
        type: 'DataFrame',
        shape: [1247, 9],
        columns: ['customer_id', 'first_name', 'email', 'age', 'city', 'state', 'country', 'signup_date', 'last_purchase'],
        dtypes: {},
        head: [],
      },
    },
    lastExpressionResult: null,
  }),
  resetNamespace: vi.fn().mockResolvedValue(undefined),
});

const renderMission = (mockPyodide) =>
  render(
    h(
      PyodideContext.Provider,
      { value: mockPyodide },
      h(
        MemoryRouter,
        { initialEntries: ['/level/level-1/1.1'] },
        h(
          Routes,
          null,
          h(Route, { path: '/level/:levelId/:subLevelId', element: h(MissionView) })
        )
      )
    )
  );

describe('REGRESSION: Level 1.1 Run flow executes once and advances Maya', () => {
  let mockPyodide;

  beforeEach(() => {
    mockPyodide = makeMockPyodide();
    localStorage.clear();
  });

  it('runs the starter code exactly once and reveals the next task (df.head())', async () => {
    renderMission(mockPyodide);

    // 1. Accept the briefing to begin the conversation
    const acceptBtn = await screen.findByText(/Accept Assignment/i);
    fireEvent.click(acceptBtn);

    // 2. Maya's first task should appear
    await screen.findByText(/Load customers\.csv using pandas\./i, {}, { timeout: 20000 });

    // 3. Click Run with the unchanged starter code
    const runBtn = await screen.findByText(/▶ Run/i);
    fireEvent.click(runBtn);

    // 4. Maya must immediately reveal the NEXT task (head preview)
    await waitFor(
      () => {
        expect(screen.queryByText(/Show the first five rows/i)).toBeTruthy();
      },
      { timeout: 20000 }
    );

    // 5. The Python code was executed exactly once (no redundant re-run)
    expect(mockPyodide.runCode).toHaveBeenCalledTimes(1);
    expect(mockPyodide.runCode.mock.calls[0][0]).toContain("df = pd.read_csv('customers.csv')");
  }, 60000);

  it('does not silently stall if the execution fails — the error surfaces instead', async () => {
    mockPyodide.runCode.mockResolvedValue({
      stdout: '',
      stderr: '',
      error: 'Traceback (most recent call last):\n  File "<exec>", line 2, in <module>\nFileNotFoundError: [Errno 44] customers.csv',
      variables: {},
    });

    renderMission(mockPyodide);

    const acceptBtn = await screen.findByText(/Accept Assignment/i);
    fireEvent.click(acceptBtn);

    await screen.findByText(/Load customers\.csv using pandas\./i, {}, { timeout: 20000 });

    const runBtn = await screen.findByText(/▶ Run/i);
    fireEvent.click(runBtn);

    // The failure must be visible in the output panel, not silently swallowed
    await waitFor(
      () => {
        expect(screen.queryByText(/File Not Found Error/i)).toBeTruthy();
      },
      { timeout: 20000 }
    );

    // Code still ran exactly once (single execution path)
    expect(mockPyodide.runCode).toHaveBeenCalledTimes(1);
  }, 60000);
});
