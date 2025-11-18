
import { Grid, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-800/50 backdrop-blur-md border border-purple-500/30">
      <button
        onClick={() => onChange('grid')}
        className={`px-3 py-1.5 rounded-md text-xs transition-colors duration-200 ${view === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`px-3 py-1.5 rounded-md text-xs transition-colors duration-200 ${view === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
