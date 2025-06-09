import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../../ui/input";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Search bar for filtering conversations
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search conversations...",
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 [&::-webkit-search-cancel-button]:appearance-none"
      />
    </div>
  );
};
