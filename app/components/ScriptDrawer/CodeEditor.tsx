'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { ViewUpdate } from '@codemirror/view';
import type { LanguageId } from './editorExtensions';
import { getLanguageExtension, baseExtensions } from './editorExtensions';
import { viewMarketEditorTheme } from './editorTheme';
import styles from './CodeEditor.module.css';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: LanguageId;
  onLanguageChange: (lang: LanguageId) => void;
}

const LANGUAGE_OPTIONS: { id: LanguageId; label: string }[] = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
];

const MORE_MENU_ITEMS = [
  { id: 'goToLine', label: 'Go to Line', shortcut: 'Ctrl+G' },
  { id: 'foldAll', label: 'Fold All', shortcut: 'Ctrl+K Ctrl+0' },
  { id: 'unfoldAll', label: 'Unfold All', shortcut: 'Ctrl+K Ctrl+J' },
  { id: 'toggleWrap', label: 'Toggle Word Wrap', shortcut: '' },
] as const;

export default function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
}: CodeEditorProps) {
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<import('@codemirror/view').EditorView | null>(
    null
  );

  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  const handleUpdate = useCallback((viewUpdate: ViewUpdate) => {
    const pos = viewUpdate.state.selection.main.head;
    const line = viewUpdate.state.doc.lineAt(pos);
    setCursorPos({
      line: line.number,
      col: pos - line.from + 1,
    });
    editorViewRef.current = viewUpdate.view;
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMoreAction = useCallback((id: string) => {
    const view = editorViewRef.current;
    if (!view) return;
    switch (id) {
      case 'goToLine': {
        const line = prompt('Go to line:');
        if (line) {
          const lineNum = parseInt(line, 10);
          const doc = view.state.doc;
          if (lineNum >= 1 && lineNum <= doc.lines) {
            const pos = doc.line(lineNum).from;
            view.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
          }
        }
        break;
      }
      case 'foldAll': {
        import('@codemirror/language').then(({ foldAll }) => {
          foldAll(view);
        });
        break;
      }
      case 'unfoldAll': {
        import('@codemirror/language').then(({ unfoldAll }) => {
          unfoldAll(view);
        });
        break;
      }
      case 'toggleWrap': {
        // Toggle line wrapping by dispatching a reconfigure
        // For now, just log — full implementation needs state tracking
        break;
      }
    }
    setIsMoreOpen(false);
  }, []);

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.id === language);

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Language selector */}
        <div className={styles.langSelector} ref={langRef}>
          <button
            className={styles.langButton}
            onClick={() => setIsLangOpen((v) => !v)}
            title="Select language"
          >
            <span className={styles.langLabel}>{currentLang?.label}</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isLangOpen && (
            <div className={styles.dropdown}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`${styles.dropdownItem} ${opt.id === language ? styles.dropdownItemActive : ''}`}
                  onClick={() => {
                    onLanguageChange(opt.id);
                    setIsLangOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.toolbarSpacer} />

        {/* Undo */}
        <button
          className={styles.toolButton}
          title="Undo (Ctrl+Z)"
          onClick={() => {
            const view = editorViewRef.current;
            if (view) {
              import('@codemirror/commands').then(({ undo }) => undo(view));
            }
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>

        {/* Redo */}
        <button
          className={styles.toolButton}
          title="Redo (Ctrl+Shift+Z)"
          onClick={() => {
            const view = editorViewRef.current;
            if (view) {
              import('@codemirror/commands').then(({ redo }) => redo(view));
            }
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
          </svg>
        </button>

        {/* Find */}
        <button
          className={styles.toolButton}
          title="Find (Ctrl+F)"
          onClick={() => {
            const view = editorViewRef.current;
            if (view) {
              import('@codemirror/search').then(({ openSearchPanel }) => {
                openSearchPanel(view);
              });
            }
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* More menu */}
        <div className={styles.moreMenu} ref={moreRef}>
          <button
            className={styles.toolButton}
            title="More actions"
            onClick={() => setIsMoreOpen((v) => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {isMoreOpen && (
            <div className={styles.dropdown}>
              {MORE_MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={styles.dropdownItem}
                  onClick={() => handleMoreAction(item.id)}
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className={styles.shortcutTag}>{item.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className={styles.editorWrap}>
        <CodeMirror
          value={value}
          onChange={handleChange}
          onUpdate={handleUpdate}
          extensions={[getLanguageExtension(language), ...baseExtensions]}
          theme={viewMarketEditorTheme}
          className={styles.editor}
          basicSetup={false}
        />
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span className={styles.statusItem}>
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>
        <span className={styles.statusSpacer} />
        <span className={styles.statusItem}>{currentLang?.label}</span>
        <span className={styles.statusDivider} />
        <span className={styles.statusItem}>UTF-8</span>
        <span className={styles.statusDivider} />
        <span className={styles.statusItem}>LF</span>
      </div>
    </div>
  );
}
