import { useEffect, useRef, useCallback } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view'
import { EditorState, Extension, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { rust } from '@codemirror/lang-rust'
import { sql } from '@codemirror/lang-sql'
import { xml } from '@codemirror/lang-xml'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark'
import { atomone } from '@uiw/codemirror-theme-atomone'
import { useEditorStore } from '../store/editorStore'
import { useSettingsStore, EditorTheme } from '../store/settingsStore'

function getThemeExtension(theme: EditorTheme): Extension {
  switch (theme) {
    case 'vscode-dark':
      return vscodeDark
    case 'vscode-light':
      return vscodeLight
    case 'github-dark':
      return githubDark
    case 'github-light':
      return githubLight
    case 'gruvbox-dark':
      return gruvboxDark
    case 'atom-one-dark':
      return atomone
    default:
      return vscodeDark
  }
}

function getLanguageExtension(language: string): Extension | null {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return javascript({ typescript: language === 'typescript', jsx: true })
    case 'python':
      return python()
    case 'html':
      return html()
    case 'css':
      return css()
    case 'json':
      return json()
    case 'markdown':
      return markdown()
    case 'cpp':
      return cpp()
    case 'java':
      return java()
    case 'rust':
      return rust()
    case 'sql':
      return sql()
    case 'xml':
      return xml()
    default:
      return null
  }
}

interface EditorProps {
  tabId: string
  content: string
  language: string
  onChange: (content: string) => void
}

export function Editor({ tabId, content, language, onChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const themeCompartmentRef = useRef(new Compartment())
  const languageCompartmentRef = useRef(new Compartment())
  const tabSizeCompartmentRef = useRef(new Compartment())
  const fontStyleCompartmentRef = useRef(new Compartment())
  const settings = useSettingsStore((s) => s.settings)
  const editorTheme = settings.editorTheme
  const { fontSize, fontFamily, tabSize } = settings
  const isActive = useEditorStore((s) => s.activeTabId === tabId)

  const createExtensions = useCallback((): Extension[] => {
    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        indentWithTab,
      ]),
      themeCompartmentRef.current.of(getThemeExtension(editorTheme)),
      fontStyleCompartmentRef.current.of(EditorView.theme({
        '&': {
          height: '100%',
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily,
        },
        '.cm-scroller': {
          overflow: 'auto',
        },
        '.cm-content': {
          caretColor: '#fff',
        },
      })),
      tabSizeCompartmentRef.current.of(EditorState.tabSize.of(tabSize)),
      ...(settings.wordWrap ? [EditorView.lineWrapping] : []),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      }),
      languageCompartmentRef.current.of(getLanguageExtension(language) || []),
    ]

    return extensions
  }, [language, settings, onChange])

  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: content,
      extensions: createExtensions(),
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [tabId])

  useEffect(() => {
    if (viewRef.current) {
      const currentContent = viewRef.current.state.doc.toString()
      if (currentContent !== content) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
        })
      }
    }
  }, [content])

  useEffect(() => {
    if (viewRef.current && isActive) {
      viewRef.current.focus()
    }
  }, [isActive])

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: themeCompartmentRef.current.reconfigure(getThemeExtension(editorTheme))
      })
    }
  }, [editorTheme])

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: languageCompartmentRef.current.reconfigure(getLanguageExtension(language) || [])
      })
    }
  }, [language])

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: tabSizeCompartmentRef.current.reconfigure(EditorState.tabSize.of(tabSize))
      })
    }
  }, [tabSize])

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: fontStyleCompartmentRef.current.reconfigure(EditorView.theme({
          '&': {
            height: '100%',
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily,
          },
          '.cm-scroller': {
            overflow: 'auto',
          },
          '.cm-content': {
            caretColor: '#fff',
          },
        }))
      })
    }
  }, [fontSize, fontFamily])

  return (
    <div
      ref={containerRef}
      className="editor-container"
      style={{
        height: '100%',
        width: '100%',
        display: isActive ? 'block' : 'none',
      }}
    />
  )
}
