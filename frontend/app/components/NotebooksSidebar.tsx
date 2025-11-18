'use client'

import { useState, useEffect } from 'react'
import { NotebookWithCount } from '../types'

interface NotebooksSidebarProps {
  onNotebookClick?: (notebookId: string | null) => void
  selectedNotebook?: string | null
}

export default function NotebooksSidebar({ onNotebookClick, selectedNotebook }: NotebooksSidebarProps) {
  const [notebooks, setNotebooks] = useState<NotebookWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddNotebook, setShowAddNotebook] = useState(false)
  const [newNotebookName, setNewNotebookName] = useState('')
  const [newNotebookColor, setNewNotebookColor] = useState('#6366f1')

  useEffect(() => {
    fetchNotebooks()
  }, [])

  const fetchNotebooks = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notebooks')
      const data = await response.json()
      setNotebooks(data)
    } catch (error) {
      console.error('Failed to fetch notebooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) return

    try {
      const response = await fetch('http://localhost:8080/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newNotebookName.trim(),
          color: newNotebookColor,
        }),
      })

      if (response.ok) {
        const newNotebook = await response.json()
        setNotebooks([...notebooks, { ...newNotebook, note_count: 0 }])
        setNewNotebookName('')
        setNewNotebookColor('#6366f1')
        setShowAddNotebook(false)
      }
    } catch (error) {
      console.error('Failed to create notebook:', error)
    }
  }

  const handleDeleteNotebook = async (notebookId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Delete this notebook? Notes in this notebook will not be deleted.')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/notebooks/${notebookId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotebooks(notebooks.filter(nb => nb.id !== notebookId))
        if (selectedNotebook === notebookId) {
          onNotebookClick?.(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete notebook:', error)
    }
  }

  const colorPresets = [
    '#6366f1', // Indigo
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
  ]

  return (
    <div className="px-2 mt-4 space-y-0.5">
      <div className="flex items-center justify-between mb-2 px-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notebooks</p>
        <button
          onClick={() => setShowAddNotebook(!showAddNotebook)}
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
          title="Add new notebook"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {showAddNotebook && (
        <div className="px-3 py-2 mb-2 glass-strong rounded-lg">
          <input
            type="text"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateNotebook()}
            placeholder="Notebook name..."
            className="w-full bg-transparent text-sm outline-none mb-2"
            autoFocus
          />

          <div className="flex gap-1 mb-2 flex-wrap">
            {colorPresets.map((color) => (
              <button
                key={color}
                onClick={() => setNewNotebookColor(color)}
                className={`w-5 h-5 rounded transition-all ${
                  newNotebookColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateNotebook}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-2 py-1.5 rounded transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowAddNotebook(false)
                setNewNotebookName('')
                setNewNotebookColor('#6366f1')
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1.5 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="px-3 py-2 text-xs text-gray-400">Loading notebooks...</div>
      ) : notebooks.length === 0 ? (
        <div className="px-3 py-2 text-xs text-gray-400">No notebooks yet</div>
      ) : (
        notebooks.map((notebook) => (
          <button
            key={notebook.id}
            onClick={() => onNotebookClick?.(notebook.id)}
            className={`group w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors ${
              selectedNotebook === notebook.id ? 'bg-white/10' : ''
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: notebook.color }}
            ></div>
            <span className="text-sm flex-1 text-left">{notebook.name}</span>
            <span className="text-xs text-gray-500">{notebook.note_count}</span>
            <button
              onClick={(e) => handleDeleteNotebook(notebook.id, e)}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
              title="Delete notebook"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </button>
        ))
      )}
    </div>
  )
}
