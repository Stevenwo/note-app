import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

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

interface NoteCardProps {
  note: Note
  index: number
  onClick: () => void
  onStar: (noteId: string, e: React.MouseEvent) => void
  onDelete: (noteId: string) => void
}

export default function NoteCard({ note, index, onClick, onStar, onDelete }: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const timeAgo = formatDistanceToNow(new Date(note.created_at), { addSuffix: true })

  // Get a preview of the content (first 300 characters)
  const contentPreview = note.content ? note.content.slice(0, 300) + (note.content.length > 300 ? '...' : '') : ''

  return (
    <article 
      className="note-card fade-in cursor-pointer relative group"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Preview - Larger Version */}
      {isHovered && (
        <div className="absolute z-50 -top-4 left-1/2 -translate-x-1/2 w-96 max-w-[90vw] pointer-events-none">
          <div className="bg-gray-900 border border-purple-500/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Preview Header */}
            <div className="relative">
              {note.thumbnail_url ? (
                <img 
                  src={note.thumbnail_url} 
                  alt={note.title} 
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-indigo-900/60 to-purple-900/60 flex items-center justify-center">
                  <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              {note.is_web_clip && (
                <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-lg backdrop-blur-sm">
                  🌐 Web Clip
                </span>
              )}
              {note.is_starred && (
                <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-lg backdrop-blur-sm">
                  ⭐ Starred
                </span>
              )}
            </div>
            
            {/* Preview Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 text-white">{note.title}</h3>
              <p className="text-sm text-gray-400 mb-3">{timeAgo}</p>
              
              {/* Content Preview */}
              {contentPreview && (
                <div className="text-sm text-gray-300 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                  {contentPreview}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Original Card */}
      <div className="relative aspect-[3/4] transition-all duration-200 group-hover:scale-[0.98] group-hover:opacity-80">
        {/* Image or placeholder */}
        {note.thumbnail_url ? (
          <img 
            src={note.thumbnail_url} 
            alt={note.title} 
            className="card-image w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 to-purple-900/40 flex items-center justify-center p-4">
            <div className="text-center">
              <svg className="w-10 h-10 mx-auto mb-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xs text-gray-400">Note</p>
            </div>
          </div>
        )}
        
        {/* Badges */}
        {note.is_web_clip && (
          <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-lg backdrop-blur-sm">
            🌐 Web
          </span>
        )}
        
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
          {/* Star button */}
          <button 
            onClick={(e) => onStar(note.id, e)}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all"
            title={note.is_starred ? "Unstar note" : "Star note"}
          >
            <svg className={`w-4 h-4 ${note.is_starred ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} fill={note.is_starred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              {note.is_starred ? (
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              )}
            </svg>
          </button>
          
          {/* Delete button */}
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onDelete(note.id)
            }}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-red-600/80 transition-all"
            title="Delete note"
          >
            <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{note.title}</h3>
          <p className="text-xs text-gray-400">{timeAgo}</p>
        </div>
      </div>
    </article>
  )
}
