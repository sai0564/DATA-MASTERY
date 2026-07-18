import { describe, it, expect } from 'vitest';
import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import OutputPanel from '../../src/components/editor/OutputPanel.jsx';

describe('OutputPanel — Notebook Execution Feedback', () => {
  it('renders import statement feedback when imports are present with no stdout', () => {
    render(
      h(OutputPanel, {
        stateDelta: { created: [], updated: [], imports: ['pd'] },
        stdout: '',
        error: null,
        isRunning: false,
      })
    );

    expect(screen.getByText('✓ Executed successfully.')).toBeTruthy();
    expect(screen.getByText('No output (expected for import statements).')).toBeTruthy();
  });

  it('renders variable creation feedback with DataFrame metadata', () => {
    render(
      h(OutputPanel, {
        stateDelta: {
          created: [{ name: 'df', type: 'DataFrame', action: 'created', rows: 1247, cols: 9 }],
          updated: [],
          imports: [],
        },
        stdout: '',
        error: null,
        isRunning: false,
      })
    );

    expect(screen.getByText('✓ DataFrame loaded successfully.')).toBeTruthy();
    expect(screen.getByText("Variable 'df' created.")).toBeTruthy();
    expect(screen.getByText('Rows: 1247')).toBeTruthy();
    expect(screen.getByText('Columns: 9')).toBeTruthy();
  });

  it('renders variable update feedback for existing variables', () => {
    render(
      h(OutputPanel, {
        stateDelta: {
          created: [],
          updated: [{ name: 'df', type: 'DataFrame', action: 'updated', rows: 850, cols: 9 }],
          imports: [],
        },
        stdout: '',
        error: null,
        isRunning: false,
      })
    );

    expect(screen.getByText('✓ Executed successfully.')).toBeTruthy();
    expect(screen.getByText("Variable 'df' updated.")).toBeTruthy();
    expect(screen.getByText('Rows: 850')).toBeTruthy();
    expect(screen.getByText('Columns: 9')).toBeTruthy();
  });

  it('renders created scalar variable confirmation', () => {
    render(
      h(OutputPanel, {
        stateDelta: {
          created: [{ name: 'x', type: 'int', action: 'created' }],
          updated: [],
          imports: [],
        },
        stdout: '',
        error: null,
        isRunning: false,
      })
    );

    expect(screen.getByText('✓ Executed successfully.')).toBeTruthy();
    expect(screen.getByText("Variable 'x' created.")).toBeTruthy();
  });

  it('renders execution failure header when an exception is raised', () => {
    render(
      h(OutputPanel, {
        stateDelta: null,
        stdout: '',
        error: 'NameError: name "pd" is not defined',
        isRunning: false,
      })
    );

    expect(screen.getByText('❌ Execution Failed')).toBeTruthy();
    expect(screen.getByText(/Name Error \(Undefined Variable\)/i)).toBeTruthy();
  });
});
