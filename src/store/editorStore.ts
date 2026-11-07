import { create } from 'zustand'

export interface Tab {
  id: string
  path: string | null
  name: string
  content: string
  originalContent: string
  isDirty: boolean
  language: string
}

interface EditorState {
  tabs: Tab[]
  activeTabId: string | null
  showSearch: boolean
  showReplace: boolean
  showPluginManager: boolean
  showThemeSelector: boolean
  showLanguageSelector: boolean
  showSettings: boolean
  
  addTab: (tab: Omit<Tab, 'id' | 'isDirty' | 'originalContent'>) => string
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTabContent: (id: string, content: string) => void
  updateTabLanguage: (id: string, language: string) => void
  markTabSaved: (id: string, path?: string) => void
  getActiveTab: () => Tab | null
  setShowSearch: (show: boolean) => void
  setShowReplace: (show: boolean) => void
  setShowPluginManager: (show: boolean) => void
  setShowThemeSelector: (show: boolean) => void
  setShowLanguageSelector: (show: boolean) => void
  setShowSettings: (show: boolean) => void
}

let tabCounter = 0

function generateTabId(): string {
  return `tab-${++tabCounter}-${Date.now()}`
}

function getLanguageFromPath(path: string | null): string {
  if (!path) return 'plaintext'
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    c: 'cpp',
    cpp: 'cpp',
    h: 'cpp',
    hpp: 'cpp',
    css: 'css',
    scss: 'css',
    html: 'html',
    htm: 'html',
    xml: 'xml',
    json: 'json',
    md: 'markdown',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
  }
  return langMap[ext] || 'plaintext'
}

function getNameFromPath(path: string | null): string {
  if (!path) return 'Untitled'
  return path.split('/').pop() || path.split('\\').pop() || 'Untitled'
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  showSearch: false,
  showReplace: false,
  showPluginManager: false,
  showThemeSelector: false,
  showLanguageSelector: false,
  showSettings: false,

  addTab: (tab) => {
    const id = generateTabId()
    const language = tab.language || getLanguageFromPath(tab.path)
    const name = tab.name || getNameFromPath(tab.path)
    
    const existingTab = get().tabs.find(t => t.path && t.path === tab.path)
    if (existingTab) {
      set({ activeTabId: existingTab.id })
      return existingTab.id
    }

    const newTab: Tab = {
      id,
      path: tab.path,
      name,
      content: tab.content,
      originalContent: tab.content,
      isDirty: false,
      language,
    }

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
    }))

    return id
  },

  removeTab: (id) => {
    set((state) => {
      const index = state.tabs.findIndex((t) => t.id === id)
      const newTabs = state.tabs.filter((t) => t.id !== id)
      
      let newActiveId = state.activeTabId
      if (state.activeTabId === id) {
        if (newTabs.length === 0) {
          newActiveId = null
        } else if (index >= newTabs.length) {
          newActiveId = newTabs[newTabs.length - 1].id
        } else {
          newActiveId = newTabs[index].id
        }
      }

      return { tabs: newTabs, activeTabId: newActiveId }
    })
  },

  setActiveTab: (id) => {
    set({ activeTabId: id })
  },

  updateTabContent: (id, content) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? { ...tab, content, isDirty: content !== tab.originalContent }
          : tab
      ),
    }))
  },

  markTabSaved: (id, path) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              path: path || tab.path,
              name: path ? getNameFromPath(path) : tab.name,
              originalContent: tab.content,
              isDirty: false,
              language: path ? getLanguageFromPath(path) : tab.language,
            }
          : tab
      ),
    }))
  },

  getActiveTab: () => {
    const state = get()
    return state.tabs.find((t) => t.id === state.activeTabId) || null
  },

  setShowSearch: (show) => set({ showSearch: show, showReplace: false }),
  setShowReplace: (show) => set({ showReplace: show, showSearch: false }),
  setShowPluginManager: (show) => set({ showPluginManager: show }),
  setShowThemeSelector: (show) => set({ showThemeSelector: show }),
  setShowLanguageSelector: (show) => set({ showLanguageSelector: show }),
  setShowSettings: (show) => set({ showSettings: show }),

  updateTabLanguage: (id, language) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, language } : tab
      ),
    }))
  },
}))
