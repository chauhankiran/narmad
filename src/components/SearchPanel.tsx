import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'

interface SearchPanelProps {
  showReplace: boolean
  onClose: () => void
}

export function SearchPanel({ showReplace, onClose }: SearchPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const activeTab = useEditorStore((s) => s.getActiveTab())
  const updateTabContent = useEditorStore((s) => s.updateTabContent)

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!activeTab || !searchTerm) {
      setMatchCount(0)
      return
    }

    try {
      const flags = matchCase ? 'g' : 'gi'
      const pattern = useRegex ? searchTerm : searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(pattern, flags)
      const matches = activeTab.content.match(regex)
      setMatchCount(matches?.length || 0)
    } catch {
      setMatchCount(0)
    }
  }, [searchTerm, activeTab?.content, matchCase, useRegex])

  const handleReplace = () => {
    if (!activeTab || !searchTerm) return

    try {
      const flags = matchCase ? '' : 'i'
      const pattern = useRegex ? searchTerm : searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(pattern, flags)
      const newContent = activeTab.content.replace(regex, replaceTerm)
      updateTabContent(activeTab.id, newContent)
    } catch {
      // Invalid regex
    }
  }

  const handleReplaceAll = () => {
    if (!activeTab || !searchTerm) return

    try {
      const flags = matchCase ? 'g' : 'gi'
      const pattern = useRegex ? searchTerm : searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(pattern, flags)
      const newContent = activeTab.content.replace(regex, replaceTerm)
      updateTabContent(activeTab.id, newContent)
    } catch {
      // Invalid regex
    }
  }

  return (
    <div className="search-panel">
      <div className="search-row">
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Find..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="match-count">{matchCount} matches</span>
        <button className="search-btn" title="Previous">
          <ChevronUp size={16} />
        </button>
        <button className="search-btn" title="Next">
          <ChevronDown size={16} />
        </button>
        <button className="search-btn" onClick={onClose} title="Close">
          <X size={16} />
        </button>
      </div>

      {showReplace && (
        <div className="search-row">
          <input
            type="text"
            className="search-input"
            placeholder="Replace..."
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
          />
          <button className="search-btn text" onClick={handleReplace}>
            Replace
          </button>
          <button className="search-btn text" onClick={handleReplaceAll}>
            Replace All
          </button>
        </div>
      )}

      <div className="search-options">
        <label>
          <input
            type="checkbox"
            checked={matchCase}
            onChange={(e) => setMatchCase(e.target.checked)}
          />
          Match Case
        </label>
        <label>
          <input
            type="checkbox"
            checked={useRegex}
            onChange={(e) => setUseRegex(e.target.checked)}
          />
          Regex
        </label>
      </div>
    </div>
  )
}
