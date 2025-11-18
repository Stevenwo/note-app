
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search notes...',
  isLoading = false,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with prop value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) { // Only call onChange if internalValue has actually changed from the prop
        onChange(internalValue);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [internalValue, onChange, value]);

  // Keyboard shortcut (Cmd/Ctrl + K) to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleClearClick = () => {
    setInternalValue('');
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex items-center w-full max-w-md">
      <Search className="absolute left-3 text-gray-400 w-5 h-5" />
      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleClearClick();
          }
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-8 py-2 rounded-lg bg-gray-800/50 backdrop-blur-md border border-purple-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
      />
      {internalValue && (
        <button
          onClick={handleClearClick}
          className="absolute right-2 p-1 rounded-full text-gray-400 hover:bg-gray-700/50 focus:outline-none"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  );
};

export default SearchBar;
