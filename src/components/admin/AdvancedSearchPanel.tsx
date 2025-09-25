import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Download, Save, X } from 'lucide-react';

interface SearchFilter {
  field: string;
  operator: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'select';
}

export const AdvancedSearchPanel: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: '', value: '', type: 'text' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    setFilters(filters.map((filter, i) => i === index ? { ...filter, ...updates } : filter));
  };

  const executeSearch = async () => {
    setLoading(true);
    // Mock search execution
    setTimeout(() => {
      setSearchResults([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', created: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', created: '2024-02-20' }
      ]);
      setLoading(false);
    }, 1000);
  };

  const quickSearchTemplates = [
    { name: 'New Users (7 days)', filters: [{ field: 'created_at', operator: '>=', value: '7 days ago', type: 'date' }] },
    { name: 'Inactive Users', filters: [{ field: 'last_login', operator: '<', value: '30 days ago', type: 'date' }] },
    { name: 'Premium Users', filters: [{ field: 'subscription_tier', operator: '=', value: 'premium', type: 'select' }] },
    { name: 'Flagged Content', filters: [{ field: 'status', operator: '=', value: 'flagged', type: 'select' }] }
  ];

  const fieldOptions = {
    users: ['name', 'email', 'role', 'created_at', 'last_login', 'subscription_tier'],
    content: ['title', 'author', 'status', 'created_at', 'view_count', 'like_count'],
    payments: ['amount', 'status', 'method', 'created_at', 'user_id']
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Search</h1>
          <p className="text-muted-foreground">Complex queries across all platform data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Query
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query Builder</CardTitle>
              <CardDescription>Build complex queries with multiple filters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Templates */}
              <div>
                <Label className="text-sm font-medium">Quick Templates</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickSearchTemplates.map((template, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => setFilters(template.filters as SearchFilter[])}
                    >
                      {template.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Select value={filter.field} onValueChange={(value) => updateFilter(index, { field: value })}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions[activeTab as keyof typeof fieldOptions]?.map((field) => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filter.operator} onValueChange={(value) => updateFilter(index, { operator: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="=">Equals</SelectItem>
                        <SelectItem value="!=">Not Equals</SelectItem>
                        <SelectItem value=">">{'>'}</SelectItem>
                        <SelectItem value="<">{'<'}</SelectItem>
                        <SelectItem value=">=">{'>='}</SelectItem>
                        <SelectItem value="<=">{`<=`}</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, { value: e.target.value })}
                      className="flex-1"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" onClick={addFilter}>
                  <Filter className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </div>

              <Button onClick={executeSearch} disabled={loading || filters.length === 0}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({searchResults.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div key={result.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{result.name || result.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.email || result.author || `ID: ${result.id}`}
                          </p>
                        </div>
                        <Badge variant={result.role === 'admin' ? 'default' : 'secondary'}>
                          {result.role || result.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};