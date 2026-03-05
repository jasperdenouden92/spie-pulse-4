import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface InfiniteScrollContainerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

/**
 * Container component that implements infinite scroll using IntersectionObserver
 * Triggers onLoadMore when the sentinel div becomes visible
 */
export default function InfiniteScrollContainer({
  onLoadMore,
  hasMore,
  isLoading,
  children
}: InfiniteScrollContainerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Load more when sentinel is visible and there's more data
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: '100px', // Start loading 100px before reaching the sentinel
        threshold: 0.1
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, hasMore, isLoading]);

  return (
    <>
      {children}

      {/* Sentinel div - triggers load when visible */}
      <Box
        ref={sentinelRef}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 3,
          minHeight: 80
        }}
      >
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        )}

        {!isLoading && !hasMore && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
            <CheckCircleOutlineIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              All items loaded
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}
