import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, X } from 'lucide-react'
import { useProjectStore, FileTreeItem } from '../store/projectStore'
import { useEditorStore } from '../store/editorStore'

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const iconMap: Record<string, string> = {
    js: '📜', jsx: '⚛️', ts: '📘', tsx: '⚛️',
    py: '🐍', rs: '🦀', go: '🐹',
    html: '🌐', css: '🎨', scss: '🎨',
    json: '📋', md: '📝', txt: '📄',
    jpg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️',
    pdf: '📕', zip: '📦', tar: '📦',
  }
  return iconMap[ext] || ''
}

interface TreeItemProps {
  item: FileTreeItem
  depth: number
  onFileClick: (path: string) => void
  onFolderToggle: (path: string, isExpanded: boolean) => void
}

function TreeItem({ item, depth, onFileClick, onFolderToggle }: TreeItemProps) {
  const handleClick = () => {
    if (item.isDirectory) {
      onFolderToggle(item.path, !item.isExpanded)
    } else {
      onFileClick(item.path)
    }
  }

  return (
    <>
      <div
        className="tree-item"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        title={item.path}
      >
        <span className="tree-icon">
          {item.isDirectory ? (
            item.isLoading ? (
              <span className="loading-spinner">⟳</span>
            ) : item.isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span style={{ width: 14, display: 'inline-block' }} />
          )}
        </span>
        <span className="tree-icon">
          {item.isDirectory ? (
            item.isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
          ) : (
            <>{getFileIcon(item.name) || <File size={16} />}</>
          )}
        </span>
        <span className="tree-name">{item.name}</span>
      </div>
      {item.isDirectory && item.isExpanded && item.children && (
        <div className="tree-children">
          {item.children.map((child) => (
            <TreeItem
              key={child.path}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              onFolderToggle={onFolderToggle}
            />
          ))}
        </div>
      )}
    </>
  )
}

export function ProjectPanel() {
  const rootPath = useProjectStore((s) => s.rootPath)
  const rootName = useProjectStore((s) => s.rootName)
  const fileTree = useProjectStore((s) => s.fileTree)
  const panelWidth = useProjectStore((s) => s.panelWidth)
  const setFileTree = useProjectStore((s) => s.setFileTree)
  const toggleExpanded = useProjectStore((s) => s.toggleExpanded)
  const updateChildren = useProjectStore((s) => s.updateChildren)
  const setLoading = useProjectStore((s) => s.setLoading)
  const closeProject = useProjectStore((s) => s.closeProject)
  const setPanelWidth = useProjectStore((s) => s.setPanelWidth)
  const addTab = useEditorStore((s) => s.addTab)

  const [isResizing, setIsResizing] = useState(false)

  const loadFolder = useCallback(async (folderPath: string): Promise<FileTreeItem[]> => {
    const result = await window.vista.readFolder(folderPath)
    if (result.success) {
      return result.items.map((item) => ({
        name: item.name,
        path: item.path,
        isDirectory: item.isDirectory,
        isExpanded: false,
        children: item.isDirectory ? undefined : undefined,
      }))
    }
    return []
  }, [])

  useEffect(() => {
    if (rootPath) {
      loadFolder(rootPath).then(setFileTree)
    }
  }, [rootPath, loadFolder, setFileTree])

  const handleFileClick = async (filePath: string) => {
    const result = await window.vista.readFile(filePath)
    if (result.success && result.content !== undefined) {
      addTab({
        path: filePath,
        name: '',
        content: result.content,
        language: '',
      })
    }
  }

  const handleFolderToggle = async (folderPath: string, shouldExpand: boolean) => {
    toggleExpanded(folderPath)
    
    if (shouldExpand) {
      const findItem = (items: FileTreeItem[]): FileTreeItem | null => {
        for (const item of items) {
          if (item.path === folderPath) return item
          if (item.children) {
            const found = findItem(item.children)
            if (found) return found
          }
        }
        return null
      }
      
      const item = findItem(fileTree)
      if (item && !item.children) {
        setLoading(folderPath, true)
        const children = await loadFolder(folderPath)
        updateChildren(folderPath, children)
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        setPanelWidth(e.clientX)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, setPanelWidth])

  if (!rootPath) {
    return null
  }

  return (
    <div className="project-panel" style={{ width: panelWidth }}>
      <div className="project-header">
        <span className="project-title" title={rootPath}>
          {rootName}
        </span>
        <button className="project-close" onClick={closeProject} title="Close Folder">
          <X size={14} />
        </button>
      </div>
      <div className="project-tree">
        {fileTree.map((item) => (
          <TreeItem
            key={item.path}
            item={item}
            depth={0}
            onFileClick={handleFileClick}
            onFolderToggle={handleFolderToggle}
          />
        ))}
      </div>
      <div
        className="project-resizer"
        onMouseDown={handleMouseDown}
        style={{ cursor: 'col-resize' }}
      />
    </div>
  )
}
