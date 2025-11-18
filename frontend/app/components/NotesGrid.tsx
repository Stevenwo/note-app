import NoteCard from './NoteCard'

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

interface NotesGridProps {
  notes: Note[]
  onNoteClick: (note: Note) => void
  onStarNote: (noteId: string, e: React.MouseEvent) => void
  onDeleteNote: (noteId: string) => void
  isSearchMode?: boolean
  onClearSearch?: () => void
}

export default function NotesGrid({ notes, onNoteClick, onStarNote, onDeleteNote, isSearchMode, onClearSearch }: NotesGridProps) {
  if (notes.length === 0) {
    if (isSearchMode) {
      return (
        <div className="text-center text-gray-400 py-20">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg mb-2">No notes found matching your search.</p>
          {onClearSearch && (
            <button onClick={onClearSearch} className="text-purple-400 hover:underline">Clear search</button>
          )}
        </div>
      )
    }
    return (
      <div className="text-center text-gray-400 py-20">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg mb-2">No notes yet</p>
        <p className="text-sm">Create your first note to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {notes.map((note, index) => (
        <NoteCard 
          key={note.id} 
          note={note} 
          index={index}
          onClick={() => onNoteClick(note)}
          onStar={onStarNote}
          onDelete={onDeleteNote}
        />
      ))}
    </div>
  )
}
