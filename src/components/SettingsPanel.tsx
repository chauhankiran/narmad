import { X } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

interface SettingsPanelProps {
  onClose: () => void
}

const tabSizes = [2, 4, 8]

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return (
    <div className="settings-panel-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-panel-header">
          <h2>Editor Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Indentation</h3>
            
            <div className="settings-row">
              <label>Tab Size</label>
              <div className="settings-control">
                <select
                  value={settings.tabSize}
                  onChange={(e) => updateSettings({ tabSize: Number(e.target.value) })}
                >
                  {tabSizes.map((size) => (
                    <option key={size} value={size}>{size} spaces</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="settings-row">
              <label>Insert Spaces</label>
              <div className="settings-control">
                <div className="toggle-group">
                  <button
                    className={`toggle-btn ${settings.insertSpaces ? 'active' : ''}`}
                    onClick={() => updateSettings({ insertSpaces: true })}
                  >
                    Spaces
                  </button>
                  <button
                    className={`toggle-btn ${!settings.insertSpaces ? 'active' : ''}`}
                    onClick={() => updateSettings({ insertSpaces: false })}
                  >
                    Tabs
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Font</h3>
            
            <div className="settings-row">
              <label>Font Size</label>
              <div className="settings-control">
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={settings.fontSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (val >= 8 && val <= 72) {
                      updateSettings({ fontSize: val })
                    }
                  }}
                  className="settings-input-number"
                />
                <span className="settings-unit">px</span>
              </div>
            </div>

            <div className="settings-row">
              <label>Font Family</label>
              <div className="settings-control settings-control-wide">
                <input
                  type="text"
                  value={settings.fontFamily}
                  onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                  placeholder="e.g. 'Fira Code', monospace"
                  className="settings-input-text"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Editor</h3>
            
            <div className="settings-row">
              <label>Word Wrap</label>
              <div className="settings-control">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.wordWrap}
                    onChange={(e) => updateSettings({ wordWrap: e.target.checked })}
                  />
                  <span>Enable word wrap</span>
                </label>
              </div>
            </div>

            <div className="settings-row">
              <label>Line Numbers</label>
              <div className="settings-control">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.lineNumbers}
                    onChange={(e) => updateSettings({ lineNumbers: e.target.checked })}
                  />
                  <span>Show line numbers</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
