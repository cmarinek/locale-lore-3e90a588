export interface SearchFilters {
  searchQuery: string;
  category: string;
  verificationStatus: 'all' | 'verified' | 'unverified' | 'disputed';
  sortBy: 'relevance' | 'recency' | 'popularity' | 'rating';
  timeRange: string;
  hasMedia: boolean;
}
