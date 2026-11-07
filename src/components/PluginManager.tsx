import { X, Power, PowerOff } from 'lucide-react'
import { usePluginStore } from '../store/pluginStore'

interface PluginManagerProps {
  onClose: () => void
}

export function PluginManager({ onClose }: PluginManagerProps) {
  const plugins = usePluginStore((s) => s.plugins)
  const enablePlugin = usePluginStore((s) => s.enablePlugin)
  const disablePlugin = usePluginStore((s) => s.disablePlugin)

  return (
    <div className="plugin-manager-overlay" onClick={onClose}>
      <div className="plugin-manager" onClick={(e) => e.stopPropagation()}>
        <div className="plugin-manager-header">
          <h2>Plugin Manager</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="plugin-list">
          {plugins.length === 0 ? (
            <div className="no-plugins">
              <p>No plugins installed.</p>
              <p className="hint">
                Plugins can be registered via the VistaPluginAPI:
              </p>
              <pre className="code-hint">{`VistaPluginAPI.register({
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  description: 'Does something cool',
  author: 'You',
  hooks: {
    onActivate: () => console.log('Activated!'),
    onFileOpen: (path, content) => {
      console.log('Opened:', path)
    }
  }
})`}</pre>
            </div>
          ) : (
            plugins.map((plugin) => (
              <div key={plugin.id} className="plugin-item">
                <div className="plugin-info">
                  <div className="plugin-name">
                    {plugin.name}
                    <span className="plugin-version">v{plugin.version}</span>
                  </div>
                  <div className="plugin-description">{plugin.description}</div>
                  <div className="plugin-author">by {plugin.author}</div>
                </div>
                <button
                  className={`plugin-toggle ${plugin.enabled ? 'enabled' : 'disabled'}`}
                  onClick={() =>
                    plugin.enabled
                      ? disablePlugin(plugin.id)
                      : enablePlugin(plugin.id)
                  }
                  title={plugin.enabled ? 'Disable' : 'Enable'}
                >
                  {plugin.enabled ? <Power size={18} /> : <PowerOff size={18} />}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="plugin-manager-footer">
          <p>Plugins have access to file events, commands, and status bar.</p>
        </div>
      </div>
    </div>
  )
}
