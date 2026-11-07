import { create } from 'zustand'

export type EditorTheme = 
  | 'vscode-dark'
  | 'vscode-light'
  | 'github-dark'
  | 'github-light'
  | 'gruvbox-dark'
  | 'atom-one-dark'

export interface EditorSettings {
  fontSize: number
  fontFamily: string
  tabSize: number
  insertSpaces: boolean
  wordWrap: boolean
  lineNumbers: boolean
  minimap: boolean
  editorTheme: EditorTheme
  autoSave: boolean
  autoSaveDelay: number
}

interface SettingsState {
  settings: EditorSettings
  updateSettings: (partial: Partial<EditorSettings>) => void
  resetSettings: () => void
}

const defaultSettings: EditorSettings = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  tabSize: 4,
  insertSpaces: true,
  wordWrap: false,
  lineNumbers: true,
  minimap: false,
  editorTheme: 'vscode-dark',
  autoSave: false,
  autoSaveDelay: 1000,
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: { ...defaultSettings },

  updateSettings: (partial) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }))
  },

  resetSettings: () => {
    set({ settings: { ...defaultSettings } })
  },
}))
