#!/usr/bin/env python3
"""
Add Delete and Star functionality to frontend
Token-efficient implementation using str_replace patterns
"""

import subprocess
import sys

def run_mcp_command(tool, params):
    """Simulate MCP tool call via desktop-commander"""
    print(f"\n🔧 Running: {tool}")
    print(f"   Params: {params}")
    return True

def main():
    print("🚀 Adding Delete & Star Functionality")
    print("=" * 60)
    
    # Step 1: Update page.tsx with handlers
    print("\n📝 Step 1: Add handlers to page.tsx")
    
    page_changes = [
        {
            "description": "Add handleStarNote function",
            "old": """  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notes')
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }""",
            "new": """  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notes')
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStarNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    try {
      const response = await fetch(`http://localhost:8080/api/notes/${noteId}/star`, {
        method: 'PUT',
      })
      
      if (response.ok) {
        // Update local state
        setNotes(notes.map(note => 
          note.id === noteId ? { ...note, is_starred: !note.is_starred } : note
        ))
      }
    } catch (error) {
      console.error('Failed to star note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove from local state
        setNotes(notes.filter(note => note.id !== noteId))
        setSelectedNote(null) // Close modal if open
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }"""
        },
        {
            "description": "Pass handlers to NotesGrid",
            "old": """        <NotesGrid 
          notes={filteredNotes} 
          onNoteClick={setSelectedNote}
        />""",
            "new": """        <NotesGrid 
          notes={filteredNotes} 
          onNoteClick={setSelectedNote}
          onStarNote={handleStarNote}
          onDeleteNote={handleDeleteNote}
        />"""
        },
        {
            "description": "Pass onDeleteNote to NoteModal",
            "old": """      {selectedNote && (
        <NoteModal 
          note={selectedNote} 
          onClose={() => setSelectedNote(null)}
        />
      )}""",
            "new": """      {selectedNote && (
        <NoteModal 
          note={selectedNote} 
          onClose={() => setSelectedNote(null)}
          onDelete={handleDeleteNote}
        />
      )}"""
        }
    ]
    
    print("   ✅ Page handlers defined")
    
    # Step 2: Update NotesGrid.tsx
    print("\n📝 Step 2: Update NotesGrid to pass handlers")
    
    grid_changes = [
        {
            "description": "Add handler props to NotesGrid",
            "old": """interface NotesGridProps {
  notes: any[]
  onNoteClick: (note: any) => void
}""",
            "new": """interface NotesGridProps {
  notes: any[]
  onNoteClick: (note: any) => void
  onStarNote: (noteId: string, e: React.MouseEvent) => void
  onDeleteNote: (noteId: string) => void
}"""
        },
        {
            "description": "Destructure new props",
            "old": """export default function NotesGrid({ notes, onNoteClick }: NotesGridProps) {""",
            "new": """export default function NotesGrid({ notes, onNoteClick, onStarNote, onDeleteNote }: NotesGridProps) {"""
        },
        {
            "description": "Pass handlers to NoteCard",
            "old": """            <NoteCard 
              key={note.id}
              note={note}
              index={i}
              onClick={() => onNoteClick(note)}
            />""",
            "new": """            <NoteCard 
              key={note.id}
              note={note}
              index={i}
              onClick={() => onNoteClick(note)}
              onStar={onStarNote}
              onDelete={onDeleteNote}
            />"""
        }
    ]
    
    print("   ✅ Grid props updated")
    
    # Step 3: Update NoteCard.tsx
    print("\n📝 Step 3: Add handlers to NoteCard")
    
    card_changes = [
        {
            "description": "Add handler props to NoteCard",
            "old": """interface NoteCardProps {
  note: {
    id: string
    title: string
    content: string
    preview_text?: string
    image_count: number
    is_starred: boolean
    created_at: string
    updated_at: string
  }
  index: number
  onClick: () => void
}""",
            "new": """interface NoteCardProps {
  note: {
    id: string
    title: string
    content: string
    preview_text?: string
    image_count: number
    is_starred: boolean
    created_at: string
    updated_at: string
  }
  index: number
  onClick: () => void
  onStar: (noteId: string, e: React.MouseEvent) => void
  onDelete: (noteId: string) => void
}"""
        },
        {
            "description": "Destructure new props",
            "old": """export default function NoteCard({ note, index, onClick }: NoteCardProps) {""",
            "new": """export default function NoteCard({ note, index, onClick, onStar, onDelete }: NoteCardProps) {"""
        },
        {
            "description": "Add onClick to star button",
            "old": """        {/* Star button */}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 hover:bg-black/80 transition-all group-hover:opacity-100">""",
            "new": """        {/* Star button */}
        <button 
          onClick={(e) => onStar(note.id, e)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 hover:bg-black/80 transition-all group-hover:opacity-100 z-10"
          title={note.is_starred ? "Unstar note" : "Star note"}
        >"""
        }
    ]
    
    print("   ✅ Card handlers wired")
    
    # Step 4: Update NoteModal.tsx
    print("\n📝 Step 4: Add delete button to NoteModal")
    
    modal_changes = [
        {
            "description": "Add onDelete prop to NoteModal",
            "old": """interface NoteModalProps {
  note: any
  onClose: () => void
}""",
            "new": """interface NoteModalProps {
  note: any
  onClose: () => void
  onDelete: (noteId: string) => void
}"""
        },
        {
            "description": "Destructure onDelete prop",
            "old": """export default function NoteModal({ note, onClose }: NoteModalProps) {""",
            "new": """export default function NoteModal({ note, onClose, onDelete }: NoteModalProps) {"""
        },
        {
            "description": "Add delete button in modal header",
            "old": """          {/* Close button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>""",
            "new": """          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                onDelete(note.id)
              }}
              className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
              title="Delete note"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>"""
        }
    ]
    
    print("   ✅ Modal delete button added")
    
    print("\n" + "=" * 60)
    print("📋 IMPLEMENTATION SUMMARY")
    print("=" * 60)
    print("\n✅ Changes to make:")
    print("   1. page.tsx: Add 2 handler functions")
    print("   2. NotesGrid.tsx: Pass handlers to NoteCard")
    print("   3. NoteCard.tsx: Wire star button onClick")
    print("   4. NoteModal.tsx: Add delete button")
    print("\n🎯 Features:")
    print("   • Star/Unstar notes (card hover)")
    print("   • Delete notes (modal)")
    print("   • Optimistic UI updates")
    print("   • Confirmation dialog for delete")
    print("\n💡 Ready to apply with MCP str_replace calls!")
    print("\n📝 Next: Run the str_replace commands from this script")
    
    return True

if __name__ == "__main__":
    main()
