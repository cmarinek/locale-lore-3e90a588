import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Category</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">History</Button>
              <Button variant="outline" size="sm">Culture</Button>
              <Button variant="outline" size="sm">Nature</Button>
              <Button variant="outline" size="sm">Legend</Button>
            </div>
          </div>
          <Button onClick={onClose} className="w-full">
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};