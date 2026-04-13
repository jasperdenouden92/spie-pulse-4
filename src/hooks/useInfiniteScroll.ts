import { useState, useCallback, useEffect } from 'react';

export interface UseInfiniteScrollOptions<T> {
  data: T[];
  pageSize: number;
  initialPage?: number;
}

export interface UseInfiniteScrollReturn<T> {
  visibleData: T[];
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  isLoading: boolean;
  initialLoading: boolean;
}

/**
 * Custom hook for implementing infinite scroll pagination
 * @param data - Full dataset to paginate
 * @param pageSize - Number of items per page
 * @param initialPage - Starting page (default: 1)
 */
export function useInfiniteScroll<T>({
  data,
  pageSize,
  initialPage = 1
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Reset to initial page when data changes
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [data, initialPage]);

  // Simulate initial data fetch delay
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  // Calculate visible data based on current page
  const visibleData = data.slice(0, currentPage * pageSize);

  // Check if there's more data to load
  const hasMore = currentPage * pageSize < data.length;

  // Load more data (with artificial delay for better UX)
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate loading delay (300ms)
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore]);

  // Reset pagination to initial state
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setIsLoading(false);
  }, [initialPage]);

  return {
    visibleData,
    hasMore,
    loadMore,
    reset,
    isLoading,
    initialLoading
  };
}
