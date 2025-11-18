
import { ChevronDown } from 'lucide-react';

const sortOptions = [
  { label: 'Newest First', value: 'created_at_desc' },
  { label: 'Oldest First', value: 'created_at_asc' },
  { label: 'Title (A-Z)', value: 'title_asc' },
  { label: 'Title (Z-A)', value: 'title_desc' },
  { label: 'Starred First', value: 'starred_first' },
];

interface SortDropdownProps {
  sortBy: string;
  onChange: (sortBy: string) => void;
}

export default function SortDropdown({ sortBy, onChange }: SortDropdownProps) {
  return (
    <div className="relative inline-block text-left">
      <select
        value={sortBy}
        onChange={(e) => onChange(e.target.value)}
        className="glass rounded-lg px-3 py-1.5 text-xs bg-transparent outline-none cursor-pointer appearance-none pr-8"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value} className="bg-gray-800 text-white">
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}
