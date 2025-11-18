'use client'

import { useEffect } from 'react'

interface Note {
  id: string
  title: string
  content: string
  thumbnail_url?: string
  is_starred: boolean
  is_web_clip: boolean
  web_clip_url?: string
  created_at: string
  updated_at: string
}

interface NoteModalProps {
  note: Note | null
  onClose: () => void
  onDelete: (noteId: string) => void
}

export default function NoteModal({ note, onClose, onDelete }: NoteModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])
  if (!note) return null

  // Simple markdown to HTML converter for basic rendering
  const renderMarkdown = (markdown: string) => {
    let html = markdown
    // Handle images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded my-4" />')
    // Handle links  
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Handle headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-4 mb-2">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>')
    // Handle bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Handle line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-4">')
    html = '<p class="mb-4">' + html + '</p>'
    return html
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-6 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{note.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(note.updated_at).toLocaleDateString()}</span>
                {note.is_web_clip && note.web_clip_url && !note.web_clip_url.startsWith('en-cache://') && (
                  <a 
                    href={note.web_clip_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Original
                  </a>
                )}
                {note.is_web_clip && note.web_clip_url && note.web_clip_url.startsWith('en-cache://') && (
                  <span className="text-gray-500 flex items-center gap-1 text-sm italic">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Web clip from Evernote (original source unavailable)
                  </span>
                )}
              </div>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={() => onDelete(note.id)}
                className="p-2 hover:bg-red-900/50 rounded-lg transition-colors group"
                title="Delete note"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div 
              className="prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
