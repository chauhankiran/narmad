import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: true,
    titleBarStyle: 'default',
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  createMenu()
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu:new') },
        { label: 'Open File...', accelerator: 'CmdOrCtrl+O', click: () => handleOpenFile() },
        { label: 'Open Folder...', accelerator: 'CmdOrCtrl+Shift+O', click: () => mainWindow?.webContents.send('menu:open-folder') },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu:save') },
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('menu:save-as') },
        { type: 'separator' },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => mainWindow?.webContents.send('menu:close-tab') },
        { label: 'Close Folder', click: () => mainWindow?.webContents.send('menu:close-folder') },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        { label: 'Find...', accelerator: 'CmdOrCtrl+F', click: () => mainWindow?.webContents.send('menu:find') },
        { label: 'Replace...', accelerator: 'CmdOrCtrl+H', click: () => mainWindow?.webContents.send('menu:replace') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Theme...', click: () => mainWindow?.webContents.send('menu:theme') },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Plugins',
      submenu: [
        { label: 'Manage Plugins...', click: () => mainWindow?.webContents.send('menu:plugins') },
        { type: 'separator' },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

async function handleOpenFile() {
  if (!mainWindow) return

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'py', 'html', 'css'] },
    ],
  })

  if (!result.canceled && result.filePaths.length > 0) {
    for (const filePath of result.filePaths) {
      const content = fs.readFileSync(filePath, 'utf-8')
      mainWindow.webContents.send('file:opened', { path: filePath, content })
    }
  }
}

ipcMain.handle('dialog:open', async () => {
  await handleOpenFile()
})

ipcMain.handle('dialog:save', async (_, { defaultPath }) => {
  if (!mainWindow) return null

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [
      { name: 'All Files', extensions: ['*'] },
    ],
  })

  return result.canceled ? null : result.filePath
})

ipcMain.handle('file:read', async (_, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('file:write', async (_, { path: filePath, content }: { path: string; content: string }) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('file:exists', async (_, filePath: string) => {
  return fs.existsSync(filePath)
})

ipcMain.handle('dialog:openFolder', async () => {
  if (!mainWindow) return null

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('folder:read', async (_, folderPath: string) => {
  try {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true })
    const items = entries.map((entry) => ({
      name: entry.name,
      path: path.join(folderPath, entry.name),
      isDirectory: entry.isDirectory(),
    }))
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })
    return { success: true, items }
  } catch (error) {
    return { success: false, error: String(error), items: [] }
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
