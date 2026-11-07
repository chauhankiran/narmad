import { FileText, FolderOpen, Settings } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'

export function WelcomeScreen() {
  const addTab = useEditorStore((s) => s.addTab)

  const handleNewFile = () => {
    addTab({
      path: null,
      name: 'Untitled',
      content: '',
      language: 'plaintext',
    })
  }

  const handleOpenFile = () => {
    window.vista?.openDialog()
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1 className="welcome-title">Vista</h1>
        <p className="welcome-subtitle">Lightweight Text Editor</p>

        <div className="welcome-actions">
          <button className="welcome-btn" onClick={handleNewFile}>
            <FileText size={20} />
            <span>New File</span>
          </button>
          <button className="welcome-btn" onClick={handleOpenFile}>
            <FolderOpen size={20} />
            <span>Open File</span>
          </button>
        </div>

        <div className="welcome-shortcuts">
          <h3>Keyboard Shortcuts</h3>
          <div className="shortcut-list">
            <div className="shortcut">
              <kbd>Ctrl+N</kbd>
              <span>New File</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl+O</kbd>
              <span>Open File</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl+S</kbd>
              <span>Save</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl+F</kbd>
              <span>Find</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl+H</kbd>
              <span>Replace</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl+W</kbd>
              <span>Close Tab</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
