import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdmin } from '@/hooks/useAdmin';
import { Check, X, Eye, Flag, Archive } from 'lucide-react';
import { toast } from 'sonner';

export const ContentModerationPanel: React.FC = () => {
  const { getFactsForModeration, updateFactStatus, bulkUpdateFactStatus } = useAdmin();
  const [facts, setFacts] = useState<any[]>([]);
  const [selectedFacts, setSelectedFacts] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFacts();
  }, [statusFilter]);

  const loadFacts = async () => {
    try {
      setLoading(true);
      const data = await getFactsForModeration(statusFilter || undefined);
      setFacts(data);
    } catch (error) {
      console.error('Error loading facts:', error);
      toast.error('Failed to load facts for moderation');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (factId: string, status: string) => {
    try {
      await updateFactStatus(factId, status);
      toast.success(`Fact ${status} successfully`);
      loadFacts();
    } catch (error) {
      console.error('Error updating fact status:', error);
      toast.error('Failed to update fact status');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedFacts.size === 0) {
      toast.error('Please select facts to moderate');
      return;
    }

    try {
      await bulkUpdateFactStatus(Array.from(selectedFacts), action);
      toast.success(`${selectedFacts.size} facts ${action} successfully`);
      setSelectedFacts(new Set());
      loadFacts();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const toggleFactSelection = (factId: string) => {
    const newSelected = new Set(selectedFacts);
    if (newSelected.has(factId)) {
      newSelected.delete(factId);
    } else {
      newSelected.add(factId);
    }
    setSelectedFacts(newSelected);
  };

  const filteredFacts = facts.filter(fact =>
    fact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fact.location_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Content Moderation</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Input
            placeholder="Search facts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {selectedFacts.size > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground mb-2 sm:mb-0">
              {selectedFacts.size} facts selected
            </span>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('verified')}
                className="flex-1 sm:flex-none"
              >
                <Check className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Approve All</span>
                <span className="sm:hidden">Approve</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('rejected')}
                className="flex-1 sm:flex-none"
              >
                <X className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Reject All</span>
                <span className="sm:hidden">Reject</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('flagged')}
                className="flex-1 sm:flex-none"
              >
                <Flag className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Flag All</span>
                <span className="sm:hidden">Flag</span>
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        {loading ? (
          <div className="text-center py-8">Loading facts for moderation...</div>
        ) : filteredFacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No facts found matching your criteria
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">{/* Make space between cards smaller on mobile */}
            {filteredFacts.map((fact) => (
              <div key={fact.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedFacts.has(fact.id)}
                    onCheckedChange={() => toggleFactSelection(fact.id)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{fact.title}</h3>
                      <Badge variant={
                        fact.status === 'verified' ? 'default' :
                        fact.status === 'pending' ? 'secondary' :
                        fact.status === 'rejected' ? 'destructive' :
                        'outline'
                      }>
                        {fact.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {fact.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📍 {fact.location_name}</span>
                      <span>👤 {fact.profiles?.username || 'Anonymous'}</span>
                      <span>📊 {fact.vote_count_up} ↑ {fact.vote_count_down} ↓</span>
                      <span>{new Date(fact.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusUpdate(fact.id, 'verified')}
                      disabled={fact.status === 'verified'}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusUpdate(fact.id, 'rejected')}
                      disabled={fact.status === 'rejected'}
                      className="p-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusUpdate(fact.id, 'flagged')}
                      disabled={fact.status === 'flagged'}
                      className="p-2"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="p-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};