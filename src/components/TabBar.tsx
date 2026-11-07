import { X } from 'lucide-react'
import { useEditorStore, Tab } from '../store/editorStore'

export function TabBar() {
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const setActiveTab = useEditorStore((s) => s.setActiveTab)
  const removeTab = useEditorStore((s) => s.removeTab)

  const handleCloseTab = (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation()
    if (tab.isDirty) {
      if (!confirm(`${tab.name} has unsaved changes. Close anyway?`)) {
        return
      }
    }
    removeTab(tab.id)
  }

  if (tabs.length === 0) {
    return null
  }

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="tab-name">
            {tab.isDirty && <span className="dirty-indicator">●</span>}
            {tab.name}
          </span>
          <button
            className="tab-close"
            onClick={(e) => handleCloseTab(e, tab)}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
