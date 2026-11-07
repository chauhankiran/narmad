import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'

interface LanguageSelectorProps {
  onClose: () => void
}

const languages = [
  { id: 'plaintext', name: 'Plain Text' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'json', name: 'JSON' },
  { id: 'markdown', name: 'Markdown' },
  { id: 'cpp', name: 'C / C++' },
  { id: 'java', name: 'Java' },
  { id: 'rust', name: 'Rust' },
  { id: 'go', name: 'Go' },
  { id: 'sql', name: 'SQL' },
  { id: 'xml', name: 'XML' },
  { id: 'yaml', name: 'YAML' },
  { id: 'shell', name: 'Shell / Bash' },
  { id: 'php', name: 'PHP' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'swift', name: 'Swift' },
  { id: 'kotlin', name: 'Kotlin' },
  { id: 'scala', name: 'Scala' },
  { id: 'r', name: 'R' },
  { id: 'lua', name: 'Lua' },
  { id: 'perl', name: 'Perl' },
  { id: 'toml', name: 'TOML' },
]

export function LanguageSelector({ onClose }: LanguageSelectorProps) {
  const [search, setSearch] = useState('')
  const activeTab = useEditorStore((s) => s.getActiveTab())
  const updateTabLanguage = useEditorStore((s) => s.updateTabLanguage)

  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(search.toLowerCase()) ||
    lang.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (langId: string) => {
    if (activeTab) {
      updateTabLanguage(activeTab.id, langId)
    }
    onClose()
  }

  return (
    <div className="language-selector-overlay" onClick={onClose}>
      <div className="language-selector" onClick={(e) => e.stopPropagation()}>
        <div className="language-selector-header">
          <h2>Select Language Mode</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="language-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search languages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="language-list">
          {filteredLanguages.map((lang) => (
            <div
              key={lang.id}
              className={`language-item ${activeTab?.language === lang.id ? 'active' : ''}`}
              onClick={() => handleSelect(lang.id)}
            >
              <span className="language-name">{lang.name}</span>
              <span className="language-id">{lang.id}</span>
            </div>
          ))}
          {filteredLanguages.length === 0 && (
            <div className="no-results">No languages found</div>
          )}
        </div>
      </div>
    </div>
  )
}
