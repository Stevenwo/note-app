
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

interface NotesListProps {
  notes: Note[]
  onNoteClick: (note: Note) => void
  onStarNote: (noteId: string, e: React.MouseEvent) => void
  onDeleteNote: (noteId: string) => void
}

export default function NotesList({ notes, onNoteClick, onStarNote, onDeleteNote }: NotesListProps) {
  if (notes.length === 0) {
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
    <div className="space-y-2">
      {notes.map((note, index) => (
        <div key={note.id} onClick={() => onNoteClick(note)} className="flex items-center p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer">
          <img src={note.thumbnail_url || 'https://via.placeholder.com/60'} alt={note.title} className="w-16 h-16 object-cover rounded-md mr-4" />
          <div className="flex-1">
            <h3 className="text-sm font-bold truncate">{note.title}</h3>
            <p className="text-xs text-gray-400 line-clamp-2">{note.content}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button onClick={(e) => onStarNote(note.id, e)} className="p-2 rounded-full hover:bg-gray-700/50">
              <svg className={`w-4 h-4 ${note.is_starred ? 'fill-current text-yellow-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }} className="p-2 rounded-full hover:bg-gray-700/50">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
