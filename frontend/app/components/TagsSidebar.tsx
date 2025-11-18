'use client'

import { useState, useEffect } from 'react'
import { TagWithCount } from '../types'

interface TagsSidebarProps {
  onTagClick?: (tagName: string) => void
  selectedTag?: string | null
}

export default function TagsSidebar({ onTagClick, selectedTag }: TagsSidebarProps) {
  const [tags, setTags] = useState<TagWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTag, setShowAddTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#8B5CF6')

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tags')
      const data = await response.json()
      setTags(data)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const response = await fetch('http://localhost:8080/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      })

      if (response.ok) {
        const newTag = await response.json()
        setTags([...tags, { ...newTag, note_count: 0 }])
        setNewTagName('')
        setNewTagColor('#8B5CF6')
        setShowAddTag(false)
      } else if (response.status === 409) {
        alert('A tag with this name already exists')
      }
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  const handleDeleteTag = async (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Delete this tag? It will be removed from all notes.')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/tags/${tagId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTags(tags.filter(tag => tag.id !== tagId))
        if (selectedTag && tags.find(t => t.id === tagId)?.name === selectedTag) {
          onTagClick?.('')
        }
      }
    } catch (error) {
      console.error('Failed to delete tag:', error)
    }
  }

  const colorPresets = [
    '#8B5CF6', // Purple
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
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</p>
        <button
          onClick={() => setShowAddTag(!showAddTag)}
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
          title="Add new tag"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {showAddTag && (
        <div className="px-3 py-2 mb-2 glass-strong rounded-lg">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            placeholder="Tag name..."
            className="w-full bg-transparent text-sm outline-none mb-2"
            autoFocus
          />

          <div className="flex gap-1 mb-2 flex-wrap">
            {colorPresets.map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                className={`w-5 h-5 rounded transition-all ${
                  newTagColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateTag}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-2 py-1.5 rounded transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowAddTag(false)
                setNewTagName('')
                setNewTagColor('#8B5CF6')
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1.5 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="px-3 py-2 text-xs text-gray-400">Loading tags...</div>
      ) : tags.length === 0 ? (
        <div className="px-3 py-2 text-xs text-gray-400">No tags yet</div>
      ) : (
        tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagClick?.(tag.name)}
            className={`group w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors ${
              selectedTag === tag.name ? 'bg-white/10' : ''
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: tag.color }}
            ></div>
            <span className="text-sm flex-1 text-left">{tag.name}</span>
            <span className="text-xs text-gray-500">{tag.note_count}</span>
            <button
              onClick={(e) => handleDeleteTag(tag.id, e)}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
              title="Delete tag"
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
