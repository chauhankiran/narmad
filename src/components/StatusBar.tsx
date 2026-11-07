import { useEditorStore } from '../store/editorStore'
import { usePluginStore } from '../store/pluginStore'
import { useSettingsStore } from '../store/settingsStore'

const languageNames: Record<string, string> = {
  plaintext: 'Plain Text',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  markdown: 'Markdown',
  cpp: 'C/C++',
  java: 'Java',
  rust: 'Rust',
  go: 'Go',
  sql: 'SQL',
  xml: 'XML',
  yaml: 'YAML',
  shell: 'Shell',
}

export function StatusBar() {
  const activeTab = useEditorStore((s) => s.getActiveTab())
  const setShowLanguageSelector = useEditorStore((s) => s.setShowLanguageSelector)
  const setShowSettings = useEditorStore((s) => s.setShowSettings)
  const plugins = usePluginStore((s) => s.getEnabledPlugins())
  const settings = useSettingsStore((s) => s.settings)

  const statusBarItems = plugins.flatMap((p) => p.hooks.statusBarItems || [])
  const leftItems = statusBarItems.filter((i) => i.position === 'left')
  const rightItems = statusBarItems.filter((i) => i.position === 'right')

  const lineCount = activeTab?.content.split('\n').length || 0
  const charCount = activeTab?.content.length || 0

  return (
    <div className="status-bar">
      <div className="status-left">
        {leftItems.map((item) => (
          <span
            key={item.id}
            className="status-item"
            onClick={item.onClick}
            style={{ cursor: item.onClick ? 'pointer' : 'default' }}
          >
            {typeof item.content === 'function' ? item.content() : item.content}
          </span>
        ))}
        {activeTab && (
          <span className="status-item">
            {activeTab.path || 'Untitled'}
          </span>
        )}
      </div>
      <div className="status-right">
        {rightItems.map((item) => (
          <span
            key={item.id}
            className="status-item"
            onClick={item.onClick}
            style={{ cursor: item.onClick ? 'pointer' : 'default' }}
          >
            {typeof item.content === 'function' ? item.content() : item.content}
          </span>
        ))}
        {activeTab && (
          <>
            <span className="status-item">Ln {lineCount}</span>
            <span className="status-item">Ch {charCount}</span>
            <span 
              className="status-item status-item-clickable"
              onClick={() => setShowSettings(true)}
              title="Indentation Settings"
            >
              {settings.insertSpaces ? `Spaces: ${settings.tabSize}` : `Tab Size: ${settings.tabSize}`}
            </span>
            <span 
              className="status-item status-item-clickable"
              onClick={() => setShowLanguageSelector(true)}
              title="Select Language Mode"
            >
              {languageNames[activeTab.language] || activeTab.language}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
