import { X } from 'lucide-react'
import { useSettingsStore, EditorTheme } from '../store/settingsStore'

interface ThemeSelectorProps {
  onClose: () => void
}

const themes: { id: EditorTheme; name: string; description: string }[] = [
  { id: 'vscode-dark', name: 'VS Code Dark', description: 'Default dark theme inspired by Visual Studio Code' },
  { id: 'vscode-light', name: 'VS Code Light', description: 'Light theme inspired by Visual Studio Code' },
  { id: 'github-dark', name: 'GitHub Dark', description: 'Dark theme from GitHub' },
  { id: 'github-light', name: 'GitHub Light', description: 'Light theme from GitHub' },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', description: 'Retro groove color scheme' },
  { id: 'atom-one-dark', name: 'Atom One Dark', description: 'Dark theme from Atom editor' },
]

export function ThemeSelector({ onClose }: ThemeSelectorProps) {
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const handleThemeChange = (themeId: EditorTheme) => {
    updateSettings({ editorTheme: themeId })
  }

  return (
    <div className="theme-selector-overlay" onClick={onClose}>
      <div className="theme-selector" onClick={(e) => e.stopPropagation()}>
        <div className="theme-selector-header">
          <h2>Select Theme</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="theme-list">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`theme-item ${settings.editorTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className="theme-info">
                <div className="theme-name">{theme.name}</div>
                <div className="theme-description">{theme.description}</div>
              </div>
              {settings.editorTheme === theme.id && (
                <span className="theme-active-indicator">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
