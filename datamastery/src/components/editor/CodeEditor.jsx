import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { indentOnInput, bracketMatching, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import './CodeEditor.css';

/**
 * CodeMirror 6 editor for Python code.
 * Props:
 *   initialCode: string — starting code
 *   onChange: (code: string) => void
 *   readOnly: boolean
 *
 * Exposes via ref:
 *   getCode(): string — returns current editor contents
 */
const CodeEditor = forwardRef(function CodeEditor(
  { initialCode = '', onChange, readOnly = false },
  ref
) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);

  // Expose getCode + setCode to parent via ref
  useImperativeHandle(ref, () => ({
    getCode() {
      if (viewRef.current) {
        return viewRef.current.state.doc.toString();
      }
      return initialCode;
    },
    setCode(newCode) {
      if (viewRef.current && newCode !== undefined) {
        const currentDoc = viewRef.current.state.doc.toString();
        if (currentDoc !== newCode) {
          viewRef.current.dispatch({
            changes: {
              from: 0,
              to: currentDoc.length,
              insert: newCode,
            },
          });
        }
      }
    },
  }), [initialCode]);

  // Create editor once
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange) {
        onChange(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        python(),
        oneDark,
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...closeBracketsKeymap,
          indentWithTab,
        ]),
        updateListener,
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-scroller': {
            fontFamily: 'var(--font-mono)',
            overflow: 'auto',
          },
          '.cm-gutters': {
            backgroundColor: 'var(--editor-gutter)',
            borderRight: '1px solid var(--border-subtle)',
          },
          '.cm-content': {
            padding: '8px 0',
          },
        }),
        EditorState.readOnly.of(readOnly),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update editor content when initialCode changes (navigation between missions)
  useEffect(() => {
    if (viewRef.current && initialCode !== undefined) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (currentDoc !== initialCode) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentDoc.length,
            insert: initialCode,
          },
        });
      }
    }
  }, [initialCode]);

  // Note: readOnly is only applied at creation time for simplicity.
  // Dynamic readOnly changes are handled via the parent component's logic.

  return <div className="code-editor" ref={containerRef} id="code-editor" />;
});

export default CodeEditor;
