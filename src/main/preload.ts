import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('vista', {
  openDialog: () => ipcRenderer.invoke('dialog:open'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  saveDialog: (defaultPath?: string) => ipcRenderer.invoke('dialog:save', { defaultPath }),
  readFile: (path: string) => ipcRenderer.invoke('file:read', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('file:write', { path, content }),
  fileExists: (path: string) => ipcRenderer.invoke('file:exists', path),
  readFolder: (path: string) => ipcRenderer.invoke('folder:read', path),
  
  onFileOpened: (callback: (data: { path: string; content: string }) => void) => {
    ipcRenderer.on('file:opened', (_, data) => callback(data))
  },
  onMenuNew: (callback: () => void) => {
    ipcRenderer.on('menu:new', () => callback())
  },
  onMenuSave: (callback: () => void) => {
    ipcRenderer.on('menu:save', () => callback())
  },
  onMenuSaveAs: (callback: () => void) => {
    ipcRenderer.on('menu:save-as', () => callback())
  },
  onMenuCloseTab: (callback: () => void) => {
    ipcRenderer.on('menu:close-tab', () => callback())
  },
  onMenuFind: (callback: () => void) => {
    ipcRenderer.on('menu:find', () => callback())
  },
  onMenuReplace: (callback: () => void) => {
    ipcRenderer.on('menu:replace', () => callback())
  },
  onMenuPlugins: (callback: () => void) => {
    ipcRenderer.on('menu:plugins', () => callback())
  },
  onMenuTheme: (callback: () => void) => {
    ipcRenderer.on('menu:theme', () => callback())
  },
  onMenuOpenFolder: (callback: () => void) => {
    ipcRenderer.on('menu:open-folder', () => callback())
  },
  onMenuCloseFolder: (callback: () => void) => {
    ipcRenderer.on('menu:close-folder', () => callback())
  },
})
