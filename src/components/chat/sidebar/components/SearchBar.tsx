import React, { forwardRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "../../../ui/input";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
}

/**
 * Search bar for filtering conversations with loading indicator
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({
  searchTerm,
  onSearchChange,
  placeholder = "Search conversations...",
  isSearching = false,
}, ref) => {
  return (
    <div className="relative">
      {isSearching ? (
        <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
      ) : (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      )}
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 [&::-webkit-search-cancel-button]:appearance-none"
      />
    </div>
  );
});

SearchBar.displayName = "SearchBar";
