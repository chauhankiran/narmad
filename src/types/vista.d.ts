export interface FolderItem {
  name: string
  path: string
  isDirectory: boolean
}

export interface VistaAPI {
  openDialog: () => Promise<void>
  openFolderDialog: () => Promise<string | null>
  saveDialog: (defaultPath?: string) => Promise<string | null>
  readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>
  writeFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>
  fileExists: (path: string) => Promise<boolean>
  readFolder: (path: string) => Promise<{ success: boolean; items: FolderItem[]; error?: string }>
  
  onFileOpened: (callback: (data: { path: string; content: string }) => void) => void
  onMenuNew: (callback: () => void) => void
  onMenuSave: (callback: () => void) => void
  onMenuSaveAs: (callback: () => void) => void
  onMenuCloseTab: (callback: () => void) => void
  onMenuFind: (callback: () => void) => void
  onMenuReplace: (callback: () => void) => void
  onMenuPlugins: (callback: () => void) => void
  onMenuTheme: (callback: () => void) => void
  onMenuOpenFolder: (callback: () => void) => void
  onMenuCloseFolder: (callback: () => void) => void
}

declare global {
  interface Window {
    vista: VistaAPI
  }
}
