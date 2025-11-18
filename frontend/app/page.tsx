'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import NotesGrid from './components/NotesGrid'
import NotesList from './components/NotesList'
import Header from './components/Header'
import NoteModal from './components/NoteModal'

export default function Home() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('created_at_desc')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    const savedViewMode = localStorage.getItem('noteViewMode') as 'grid' | 'list';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
    const savedSortBy = localStorage.getItem('noteSortMode');
    if (savedSortBy) {
      setSortBy(savedSortBy);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const handler = setTimeout(() => {
        fetchSearchResults(searchQuery, sortBy);
      }, 300);
      return () => {
        clearTimeout(handler);
      };
    } else {
      setIsSearching(false);
      setSearchResults([]); // Clear search results when query is empty
      fetchNotes(sortBy); // Fetch all notes when search is cleared
    }
  }, [searchQuery, sortBy]);

  const fetchNotes = async (currentSortBy: string) => {
    try {
      const [sortField, sortOrder] = currentSortBy.split('_');
      const response = await fetch(`http://localhost:8080/api/notes?sort=${sortField}&order=${sortOrder}`)
      const data = await response.json()
      console.log('API data received:', data)
      setNotes(data)
      console.log('Notes state updated with:', data)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSearchResults = async (query: string, currentSortBy: string) => {
    try {
      const [sortField, sortOrder] = currentSortBy.split('_');
      const response = await fetch(`http://localhost:8080/api/notes/search?q=${query}&sort=${sortField}&order=${sortOrder}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Failed to fetch search results:', error)
    } finally {
      setIsSearching(false);
    }
  }

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleViewChange = (view: 'grid' | 'list') => {
    setViewMode(view);
    localStorage.setItem('noteViewMode', view);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    localStorage.setItem('noteSortMode', sort);
  };

  const handleStarNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    try {
      console.log('🌟 Starring note:', noteId)
      const url = `http://localhost:8080/api/notes/${noteId}/star`
      console.log('📡 Fetching:', url)
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📨 Response status:', response.status, response.ok)
      
      if (response.ok) {
        const updatedNote = await response.json()
        console.log('✅ Updated note:', updatedNote)
        
        // Update local state with the actual response from backend
        setNotes(notes.map(note => 
          note.id === noteId ? updatedNote : note
        ))
      } else {
        console.error('❌ Star failed with status:', response.status)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('❌ Failed to star note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      console.log('🗑️  Deleting note:', noteId)
      const url = `http://localhost:8080/api/notes/${noteId}`
      console.log('📡 Fetching:', url)

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📨 Response status:', response.status, response.ok)

      if (response.ok) {
        console.log('✅ Note deleted successfully')
        // Remove from local state
        setNotes(notes.filter(note => note.id !== noteId))
        setSelectedNote(null) // Close modal if open
      } else {
        console.error('❌ Delete failed with status:', response.status)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('❌ Failed to delete note:', error)
    }
  }

  const handleTagClick = (tagName: string) => {
    // Toggle tag filter - if clicking the same tag, clear the filter
    setSelectedTag(selectedTag === tagName ? null : tagName)
    setSearchQuery('') // Clear search when filtering by tag
  }

  // Filter notes by selected tag (client-side for now)
  const getDisplayNotes = () => {
    if (searchQuery) {
      return searchResults
    }
    if (selectedTag) {
      // Note: This is client-side filtering. In production, you'd want to fetch from backend
      // For now, we'll show all notes until we fetch notes with their tags
      return notes
    }
    return notes
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar onTagClick={handleTagClick} selectedTag={selectedTag} />
        <main className="flex-1 overflow-y-auto">
          <Header 
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchClear={handleSearchClear}
            isSearching={isSearching}
            viewMode={viewMode}
            onViewChange={handleViewChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
          <div className="p-6">
            {loading ? (
              <div className="text-center text-gray-400 py-20">Loading notes...</div>
            ) : (
              searchQuery && searchResults.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                  <p className="text-lg mb-2">No results found for "{searchQuery}"</p>
                  <button onClick={handleSearchClear} className="text-purple-400 hover:underline">Clear search</button>
                </div>
              ) : (
                viewMode === 'grid' ? (
                  <NotesGrid
                    notes={getDisplayNotes()}
                    onNoteClick={(note) => setSelectedNote(note)}
                    onStarNote={handleStarNote}
                    onDeleteNote={handleDeleteNote}
                    isSearchMode={searchQuery.length > 0}
                    onClearSearch={handleSearchClear}
                  />
                ) : (
                  <NotesList
                    notes={getDisplayNotes()}
                    onNoteClick={(note) => setSelectedNote(note)}
                    onStarNote={handleStarNote}
                    onDeleteNote={handleDeleteNote}
                  />
                )
              )
            )}
          </div>
        </main>
      </div>
      
      <NoteModal 
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onDelete={handleDeleteNote}
      />
    </>
  )
}
