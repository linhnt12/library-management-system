'use client';

import { BookFilterParams, BookFilterState } from '@/components/books/BookFilterDialog';
import { useCallback, useState } from 'react';

export interface UseBookFiltersReturn {
  // Filter dialog state
  isFilterDialogOpen: boolean;
  openFilterDialog: () => void;
  closeFilterDialog: () => void;

  // Filter state
  filterState: BookFilterState;
  updateFilterState: (newState: Partial<BookFilterState>) => void;

  // Applied filters
  appliedFilters: BookFilterParams;
  setAppliedFilters: (filters: BookFilterParams) => void;

  // Actions
  applyFilters: () => void;
  clearFilters: () => void;
}

export const useBookFilters = (): UseBookFiltersReturn => {
  // Filter dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Filter state
  const [filterState, setFilterState] = useState<BookFilterState>({
    selectedAuthors: [],
    selectedCategories: [],
    publishYearFrom: '',
    publishYearTo: '',
    selectedStatus: '',
  });

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState<BookFilterParams>({});

  const openFilterDialog = useCallback(() => {
    setIsFilterDialogOpen(true);
  }, []);

  const closeFilterDialog = useCallback(() => {
    setIsFilterDialogOpen(false);
  }, []);

  const updateFilterState = useCallback((newState: Partial<BookFilterState>) => {
    setFilterState(prev => ({ ...prev, ...newState }));
  }, []);

  const applyFilters = useCallback(() => {
    const filterParams: BookFilterParams = {
      authorIds:
        filterState.selectedAuthors.length > 0
          ? filterState.selectedAuthors.map(author => Number(author.value))
          : undefined,
      categoryIds:
        filterState.selectedCategories.length > 0
          ? filterState.selectedCategories.map(category => Number(category.value))
          : undefined,
      publishYearFrom: filterState.publishYearFrom
        ? Number(filterState.publishYearFrom)
        : undefined,
      publishYearTo: filterState.publishYearTo ? Number(filterState.publishYearTo) : undefined,
      status: filterState.selectedStatus || undefined,
    };

    setAppliedFilters(filterParams);
    setIsFilterDialogOpen(false);
  }, [filterState]);

  const clearFilters = useCallback(() => {
    setFilterState({
      selectedAuthors: [],
      selectedCategories: [],
      publishYearFrom: '',
      publishYearTo: '',
      selectedStatus: '',
    });
    setAppliedFilters({});
  }, []);

  return {
    isFilterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    filterState,
    updateFilterState,
    appliedFilters,
    setAppliedFilters,
    applyFilters,
    clearFilters,
  };
};
