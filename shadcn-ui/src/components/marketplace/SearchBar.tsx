/**
 * Suggestive Search Bar Component with Autocomplete
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Loader2, Package, Store, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { unifiedSearch, type UnifiedSearchResult } from '@/utils/search';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ 
  placeholder = "Search products, vendors...",
  className,
  onSearch 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<UnifiedSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update query from URL params when on products page
  useEffect(() => {
    if (location.pathname === '/products') {
      const params = new URLSearchParams(location.search);
      const searchParam = params.get('search');
      if (searchParam) {
        setQuery(searchParam);
      }
    }
  }, [location]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      const results = unifiedSearch(query, 8);
      setSuggestions(results);
      setShowSuggestions(true);
      setIsLoading(false);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    };
  }, [query]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(query.trim());
      }
    }
  };

  const handleSuggestionClick = (result: UnifiedSearchResult) => {
    let path = '';
    
    switch (result.type) {
      case 'product':
        path = `/product/${result.id}`;
        break;
      case 'vendor':
        path = `/vendors/${result.slug}`;
        break;
      case 'category':
        path = `/products?category=${result.id}`;
        break;
    }
    
    navigate(path);
    setShowSuggestions(false);
    setQuery('');
  };

  const handleSuggestionSelect = (index: number) => {
    if (index >= 0 && index < suggestions.length) {
      handleSuggestionClick(suggestions[index]);
    }
  };

  const getTypeIcon = (type: UnifiedSearchResult['type']) => {
    switch (type) {
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'vendor':
        return <Store className="h-4 w-4" />;
      case 'category':
        return <FolderOpen className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: UnifiedSearchResult['type']) => {
    switch (type) {
      case 'product':
        return 'Product';
      case 'vendor':
        return 'Vendor';
      case 'category':
        return 'Category';
    }
  };

  const formatMetadata = (result: UnifiedSearchResult) => {
    if (result.type === 'product') {
      const price = result.metadata?.price;
      const currency = result.metadata?.currency || 'KES';
      return price ? `${currency} ${price.toLocaleString()}` : '';
    }
    if (result.type === 'vendor') {
      const rating = result.metadata?.rating;
      return rating ? `${rating.toFixed(1)} ⭐` : '';
    }
    return result.description || '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionSelect(selectedIndex);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-netflix-dark-gray border-netflix-medium-gray pl-10 pr-10 text-white placeholder:text-gray-400 focus-visible:ring-netflix-red"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-400 hover:text-white"
            onClick={clearQuery}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-netflix-medium-gray bg-netflix-dark-gray shadow-lg max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="py-2">
              {/* Group suggestions by type */}
              {['product', 'vendor', 'category'].map((type) => {
                const typeResults = suggestions.filter((r) => r.type === type);
                if (typeResults.length === 0) return null;

                return (
                  <div key={type} className="mb-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {getTypeLabel(type as UnifiedSearchResult['type'])}s
                    </div>
                    {typeResults.map((result, idx) => {
                      const globalIndex = suggestions.findIndex((r) => r === result);
                      return (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleSuggestionClick(result)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            'w-full px-4 py-2.5 text-left hover:bg-netflix-medium-gray transition-colors flex items-center gap-3',
                            selectedIndex === globalIndex && 'bg-netflix-medium-gray'
                          )}
                        >
                          {result.image ? (
                            <img
                              src={result.image}
                              alt={result.name}
                              className="h-10 w-10 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-netflix-medium-gray flex items-center justify-center flex-shrink-0 text-gray-400">
                              {getTypeIcon(result.type)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-medium text-white truncate">
                                {result.name}
                              </p>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-netflix-red/20 text-netflix-red border-netflix-red/30 flex-shrink-0"
                              >
                                {getTypeLabel(result.type)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400 truncate">
                              {formatMetadata(result)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

