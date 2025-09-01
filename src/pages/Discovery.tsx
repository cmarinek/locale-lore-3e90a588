
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { InfiniteFactList } from '@/components/discovery/InfiniteFactList';
import { FilterPanel } from '@/components/discovery/FilterPanel';
import { SearchBar } from '@/components/discovery/SearchBar';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useAnimations } from '@/hooks/useAnimations';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
import { useState } from 'react';

const Discovery = () => {
  const [showFilters, setShowFilters] = useState(false);
  const { pageVariants } = useAnimations();
  const { 
    facts, 
    loading, 
    error, 
    filters,
    selectedFact,
    modalOpen,
    setModalOpen,
    loadCategories,
    loadSavedFacts,
    searchFacts,
    setFilters
  } = useDiscoveryStore();

  useEffect(() => {
    loadCategories();
    loadSavedFacts();
    
    // Load initial facts with current filters
    const searchQuery = filters.search || '';
    searchFacts(searchQuery);
  }, [loadCategories, loadSavedFacts, searchFacts]);

  const handleSearch = async (query: string) => {
    setFilters({ search: query });
    await searchFacts(query);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container relative py-8"
    >
      <Helmet>
        <title>Discovery - Awesome Facts</title>
        <meta name="description" content="Discover awesome and interesting facts." />
      </Helmet>

      <div className="mb-6 flex items-center justify-between">
        <SearchBar onQueryChange={handleSearch} />
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? <Search className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          <span className="sr-only">Toggle filters</span>
        </Button>
      </div>

      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          <FilterPanel />
        </motion.div>
      )}

      {loading && <p>Loading facts...</p>}
      {error && <p>Error: {error}</p>}

      <InfiniteFactList />
      <FactPreviewModal 
        fact={selectedFact}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </motion.div>
  );
};

export default Discovery;
