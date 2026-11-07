import { useEffect, useCallback } from 'react'
import { TabBar } from './components/TabBar'
import { Editor } from './components/Editor'
import { StatusBar } from './components/StatusBar'
import { SearchPanel } from './components/SearchPanel'
import { PluginManager } from './components/PluginManager'
import { WelcomeScreen } from './components/WelcomeScreen'
import { ThemeSelector } from './components/ThemeSelector'
import { ProjectPanel } from './components/ProjectPanel'
import { LanguageSelector } from './components/LanguageSelector'
import { SettingsPanel } from './components/SettingsPanel'
import { useEditorStore } from './store/editorStore'
import { usePluginStore } from './store/pluginStore'
import { useProjectStore } from './store/projectStore'
import './styles/app.css'

function App() {
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const addTab = useEditorStore((s) => s.addTab)
  const removeTab = useEditorStore((s) => s.removeTab)
  const updateTabContent = useEditorStore((s) => s.updateTabContent)
  const markTabSaved = useEditorStore((s) => s.markTabSaved)
  const getActiveTab = useEditorStore((s) => s.getActiveTab)
  const showSearch = useEditorStore((s) => s.showSearch)
  const showReplace = useEditorStore((s) => s.showReplace)
  const showPluginManager = useEditorStore((s) => s.showPluginManager)
  const showThemeSelector = useEditorStore((s) => s.showThemeSelector)
  const showLanguageSelector = useEditorStore((s) => s.showLanguageSelector)
  const showSettings = useEditorStore((s) => s.showSettings)
  const setShowSearch = useEditorStore((s) => s.setShowSearch)
  const setShowReplace = useEditorStore((s) => s.setShowReplace)
  const setShowPluginManager = useEditorStore((s) => s.setShowPluginManager)
  const setShowThemeSelector = useEditorStore((s) => s.setShowThemeSelector)
  const setShowLanguageSelector = useEditorStore((s) => s.setShowLanguageSelector)
  const setShowSettings = useEditorStore((s) => s.setShowSettings)
  const executeHook = usePluginStore((s) => s.executeHook)
  const setProject = useProjectStore((s) => s.setProject)
  const closeProject = useProjectStore((s) => s.closeProject)

  const handleSave = useCallback(async () => {
    const tab = getActiveTab()
    if (!tab) return

    if (tab.path) {
      const result = await window.vista.writeFile(tab.path, tab.content)
      if (result.success) {
        markTabSaved(tab.id)
        executeHook('onFileSave', tab.path, tab.content)
      }
    } else {
      const path = await window.vista.saveDialog()
      if (path) {
        const result = await window.vista.writeFile(path, tab.content)
        if (result.success) {
          markTabSaved(tab.id, path)
          executeHook('onFileSave', path, tab.content)
        }
      }
    }
  }, [getActiveTab, markTabSaved, executeHook])

  const handleSaveAs = useCallback(async () => {
    const tab = getActiveTab()
    if (!tab) return

    const path = await window.vista.saveDialog(tab.path || undefined)
    if (path) {
      const result = await window.vista.writeFile(path, tab.content)
      if (result.success) {
        markTabSaved(tab.id, path)
        executeHook('onFileSave', path, tab.content)
      }
    }
  }, [getActiveTab, markTabSaved, executeHook])

  const handleCloseTab = useCallback(() => {
    const tab = getActiveTab()
    if (!tab) return

    if (tab.isDirty) {
      if (!confirm(`${tab.name} has unsaved changes. Close anyway?`)) {
        return
      }
    }
    removeTab(tab.id)
  }, [getActiveTab, removeTab])

  useEffect(() => {
    if (!window.vista) return

    window.vista.onFileOpened(({ path, content }) => {
      addTab({ path, name: '', content, language: '' })
      executeHook('onFileOpen', path, content)
    })

    window.vista.onMenuNew(() => {
      addTab({ path: null, name: 'Untitled', content: '', language: 'plaintext' })
    })

    window.vista.onMenuSave(() => handleSave())
    window.vista.onMenuSaveAs(() => handleSaveAs())
    window.vista.onMenuCloseTab(() => handleCloseTab())
    window.vista.onMenuFind(() => setShowSearch(true))
    window.vista.onMenuReplace(() => setShowReplace(true))
    window.vista.onMenuPlugins(() => setShowPluginManager(true))
    window.vista.onMenuTheme(() => setShowThemeSelector(true))
    window.vista.onMenuOpenFolder(async () => {
      const folderPath = await window.vista.openFolderDialog()
      if (folderPath) {
        setProject(folderPath)
      }
    })
    window.vista.onMenuCloseFolder(() => closeProject())
  }, [addTab, handleSave, handleSaveAs, handleCloseTab, setShowSearch, setShowReplace, setShowPluginManager, setShowThemeSelector, setProject, closeProject, executeHook])

  const handleContentChange = useCallback(
    (tabId: string, content: string) => {
      updateTabContent(tabId, content)
      executeHook('onContentChange', content)
    },
    [updateTabContent, executeHook]
  )

  return (
    <div className="app">
      <div className="main-content">
        <ProjectPanel />
        <div className="editor-wrapper">
          <TabBar />
          
          {(showSearch || showReplace) && (
            <SearchPanel
              showReplace={showReplace}
              onClose={() => {
                setShowSearch(false)
                setShowReplace(false)
              }}
            />
          )}

          <div className="editor-area">
            {tabs.length === 0 ? (
              <WelcomeScreen />
            ) : (
              tabs.map((tab) => (
                <Editor
                  key={tab.id}
                  tabId={tab.id}
                  content={tab.content}
                  language={tab.language}
                  onChange={(content) => handleContentChange(tab.id, content)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <StatusBar />

      {showPluginManager && (
        <PluginManager onClose={() => setShowPluginManager(false)} />
      )}

      {showThemeSelector && (
        <ThemeSelector onClose={() => setShowThemeSelector(false)} />
      )}

      {showLanguageSelector && (
        <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

export default App
