import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

/**
 * CodeMirror theme using ViewMarket's CSS custom properties.
 * Maps directly to var(--*) tokens so dark/light switching is automatic.
 */
const viewMarketTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      fontSize: '0.8125rem',
      fontFamily: 'var(--font-mono), monospace',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-content': {
      caretColor: 'var(--text-primary)',
      padding: '8px 0',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--text-primary)',
      borderLeftWidth: '2px',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'rgba(255, 255, 255, 0.12) !important',
    },
    '&.cm-focused .cm-selectionBackground': {
      backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--bg-overlay-hover)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--bg-overlay-hover)',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--bg-surface)',
      color: 'var(--text-dim)',
      borderRight: '1px solid var(--border-subtle)',
      fontSize: '0.75rem',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 8px 0 12px',
      minWidth: '32px',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'var(--bg-overlay-md)',
      color: 'var(--text-faint)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '3px',
      padding: '0 6px',
      margin: '0 4px',
    },
    '.cm-matchingBracket': {
      backgroundColor: 'var(--bg-overlay-active)',
      outline: '1px solid var(--border-medium)',
    },
    '.cm-nonmatchingBracket': {
      backgroundColor: 'rgba(255, 80, 80, 0.15)',
      outline: '1px solid rgba(255, 80, 80, 0.3)',
    },
    '.cm-tooltip': {
      backgroundColor: 'var(--bg-elevated)',
      border: '1px solid var(--border-medium)',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
    '.cm-tooltip.cm-tooltip-autocomplete': {
      '& > ul': {
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '0.8125rem',
        maxHeight: '200px',
      },
      '& > ul > li': {
        padding: '4px 8px',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: 'var(--bg-overlay-active)',
        color: 'var(--text-primary)',
      },
    },
    '.cm-panels': {
      backgroundColor: 'var(--bg-surface-alt)',
      color: 'var(--text-secondary)',
    },
    '.cm-panels.cm-panels-bottom': {
      borderTop: '1px solid var(--border-subtle)',
    },
    '.cm-searchMatch': {
      backgroundColor: 'rgba(255, 200, 50, 0.2)',
      outline: '1px solid rgba(255, 200, 50, 0.4)',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: 'rgba(255, 200, 50, 0.35)',
    },
    '.cm-selectionMatch': {
      backgroundColor: 'var(--bg-overlay-md)',
    },
    '.cm-diagnostic': {
      fontSize: '0.75rem',
    },
    '.cm-diagnostic-error': {
      borderLeft: '3px solid #ef4444',
    },
    '.cm-diagnostic-warning': {
      borderLeft: '3px solid #f59e0b',
    },
    '.cm-lintPoint-error': {
      borderBottom: '2px wavy #ef4444',
    },
    '.cm-lintPoint-warning': {
      borderBottom: '2px wavy #f59e0b',
    },
    '.cm-foldGutter .cm-gutterElement': {
      color: 'var(--text-faint)',
      cursor: 'pointer',
      transition: 'color 0.15s ease',
      '&:hover': {
        color: 'var(--text-primary)',
      },
    },
  },
  { dark: true }
);

/**
 * Syntax highlighting using monochrome tones with subtle color accents.
 * Comments: dim, strings: slightly bright, keywords: primary, numbers: medium.
 */
const viewMarketHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--text-primary)', fontWeight: '600' },
  { tag: tags.operator, color: 'var(--text-high)' },
  { tag: tags.special(tags.variableName), color: 'var(--text-high)' },
  { tag: tags.typeName, color: 'var(--text-high)' },
  { tag: tags.atom, color: 'var(--text-high)' },
  { tag: tags.number, color: 'var(--text-secondary)' },
  { tag: tags.definition(tags.variableName), color: 'var(--text-primary)' },
  { tag: tags.string, color: 'var(--text-muted)' },
  { tag: tags.special(tags.string), color: 'var(--text-muted)' },
  { tag: tags.comment, color: 'var(--text-dim)', fontStyle: 'italic' },
  { tag: tags.variableName, color: 'var(--text-secondary)' },
  { tag: tags.tagName, color: 'var(--text-high)' },
  { tag: tags.bracket, color: 'var(--text-faint)' },
  { tag: tags.meta, color: 'var(--text-muted)' },
  { tag: tags.link, color: 'var(--text-muted)', textDecoration: 'underline' },
  { tag: tags.heading, color: 'var(--text-primary)', fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.bool, color: 'var(--text-high)' },
  { tag: tags.null, color: 'var(--text-faint)' },
  { tag: tags.className, color: 'var(--text-high)' },
  { tag: tags.propertyName, color: 'var(--text-secondary)' },
  { tag: tags.function(tags.variableName), color: 'var(--text-primary)' },
  { tag: tags.regexp, color: 'var(--text-muted)' },
]);

export const viewMarketEditorTheme = [
  viewMarketTheme,
  syntaxHighlighting(viewMarketHighlightStyle),
];
