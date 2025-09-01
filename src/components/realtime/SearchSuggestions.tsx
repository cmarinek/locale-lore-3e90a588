
import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2 text-muted-foreground">Suggestions</h4>
      <div className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="ghost"
              className="w-full justify-start text-sm p-2 h-auto"
              onClick={() => onSelect(suggestion)}
            >
              <Search className="w-3 h-3 mr-2 text-muted-foreground" />
              {suggestion}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
