import { create } from 'zustand'

export interface FileTreeItem {
  name: string
  path: string
  isDirectory: boolean
  isExpanded?: boolean
  children?: FileTreeItem[]
  isLoading?: boolean
}

interface ProjectState {
  rootPath: string | null
  rootName: string | null
  fileTree: FileTreeItem[]
  isOpen: boolean
  panelWidth: number
  
  setProject: (path: string | null) => void
  setFileTree: (tree: FileTreeItem[]) => void
  toggleExpanded: (path: string) => void
  updateChildren: (path: string, children: FileTreeItem[]) => void
  setLoading: (path: string, loading: boolean) => void
  closeProject: () => void
  setPanelWidth: (width: number) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  rootPath: null,
  rootName: null,
  fileTree: [],
  isOpen: true,
  panelWidth: 250,

  setProject: (path) => {
    if (!path) {
      set({ rootPath: null, rootName: null, fileTree: [] })
      return
    }
    const name = path.split('/').pop() || path.split('\\').pop() || path
    set({ rootPath: path, rootName: name, fileTree: [] })
  },

  setFileTree: (tree) => {
    set({ fileTree: tree })
  },

  toggleExpanded: (path) => {
    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.map((item) => {
        if (item.path === path) {
          return { ...item, isExpanded: !item.isExpanded }
        }
        if (item.children) {
          return { ...item, children: updateTree(item.children) }
        }
        return item
      })
    }
    set({ fileTree: updateTree(get().fileTree) })
  },

  updateChildren: (path, children) => {
    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.map((item) => {
        if (item.path === path) {
          return { ...item, children, isLoading: false }
        }
        if (item.children) {
          return { ...item, children: updateTree(item.children) }
        }
        return item
      })
    }
    set({ fileTree: updateTree(get().fileTree) })
  },

  setLoading: (path, loading) => {
    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.map((item) => {
        if (item.path === path) {
          return { ...item, isLoading: loading }
        }
        if (item.children) {
          return { ...item, children: updateTree(item.children) }
        }
        return item
      })
    }
    set({ fileTree: updateTree(get().fileTree) })
  },

  closeProject: () => {
    set({ rootPath: null, rootName: null, fileTree: [] })
  },

  setPanelWidth: (width) => {
    set({ panelWidth: Math.max(150, Math.min(500, width)) })
  },
}))
