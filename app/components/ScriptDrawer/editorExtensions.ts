import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  keymap,
} from '@codemirror/view';
import { EditorState, type Extension } from '@codemirror/state';
import {
  foldGutter,
  indentOnInput,
  bracketMatching,
  foldKeymap,
} from '@codemirror/language';
import {
  closeBrackets,
  closeBracketsKeymap,
  autocompletion,
  completionKeymap,
} from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import {
  history,
  defaultKeymap,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import { lintKeymap } from '@codemirror/lint';

export type LanguageId = 'javascript' | 'python' | 'typescript';

/**
 * Returns the language extension for the given language ID.
 */
export function getLanguageExtension(lang: LanguageId): Extension {
  switch (lang) {
    case 'javascript':
    case 'typescript':
      return javascript({ typescript: lang === 'typescript' });
    case 'python':
      return python();
    default:
      return javascript();
  }
}

/**
 * Core editor extensions — shared across all language modes.
 * Includes: line numbers, gutter highlights, bracket matching,
 * auto-close brackets, code folding, autocomplete, find/replace,
 * history (undo/redo), active line, selection highlights, indent guides.
 */
export const baseExtensions: Extension[] = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter({
    openText: '\u25BE',
    closedText: '\u25B8',
  }),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
    indentWithTab,
  ]),
  EditorState.tabSize.of(2),
];
