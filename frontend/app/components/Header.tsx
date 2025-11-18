import SearchBar from './SearchBar'
import ViewToggle from './ViewToggle'
import SortDropdown from './SortDropdown'

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClear: () => void;
  isSearching: boolean;
  viewMode: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export default function Header({ 
  searchQuery, onSearchChange, onSearchClear, isSearching, 
  viewMode, onViewChange, 
  sortBy, onSortChange 
}: HeaderProps) {
  return (
    <header className="glass-strong border-b border-white/5 sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Recently Added</h2>
            <p className="text-xs text-gray-400 mt-0.5">24 notes • Last 7 days</p>
          </div>
          
          <SearchBar 
            value={searchQuery}
            onChange={onSearchChange}
            onClear={onSearchClear}
            isLoading={isSearching}
          />

          <div className="flex items-center gap-2">
            <ViewToggle view={viewMode} onChange={onViewChange} />
            <SortDropdown sortBy={sortBy} onChange={onSortChange} />
          </div>
        </div>
      </div>
    </header>
  )
}
