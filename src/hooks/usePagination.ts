import { useState, useMemo } from "react";

/**
 * usePagination Hook
 *
 * High-performance pagination hook with client-side data slicing.
 *
 * Features:
 * - Memoized calculations for optimal performance
 * - Automatic page reset when page size changes
 * - Safe page bounds checking
 * - Configurable initial page size
 *
 * Performance considerations:
 * - Uses useMemo to prevent unnecessary recalculations
 * - Only recalculates when data, currentPage, or pageSize changes
 * - Memory-efficient data slicing
 */

interface UsePaginationProps<T> {
  data: T[];
  initialPageSize?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedData: T[];
  startIndex: number;
  endIndex: number;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (newPageSize: number) => void;
  resetPagination: () => void;
}

export function usePagination<T>({
  data,
  initialPageSize = 50,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate pagination values with useMemo for performance
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, data.length);
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      paginatedData,
    };
  }, [data, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    pageSize,
    totalPages: paginationData.totalPages,
    paginatedData: paginationData.paginatedData,
    startIndex: paginationData.startIndex,
    endIndex: paginationData.endIndex,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  };
}
