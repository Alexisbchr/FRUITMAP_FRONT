import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTrees, fetchTreeById, createTree, confirmTree, reportTree } from '../services/api'
import type { TreeFilters, CreateTreePayload, FruitTree } from '../types'

const MAP_PAGE_SIZE = 50

export function useAllTrees(filters: Omit<TreeFilters, 'page' | 'limit'>) {
  const firstPage = useQuery({
    queryKey: ['trees-map', 'p1', filters],
    queryFn: () => fetchTrees({ ...filters, page: 1, limit: MAP_PAGE_SIZE }),
    staleTime: 5 * 60 * 1000,
  })

  const totalPages = firstPage.data?.pagination.totalPages ?? 1

  const remainingPages = useQueries({
    queries: Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
      queryKey: ['trees-map', `p${i + 2}`, filters],
      queryFn: () => fetchTrees({ ...filters, page: i + 2, limit: MAP_PAGE_SIZE }),
      staleTime: 5 * 60 * 1000,
      enabled: totalPages > 1,
    })),
  })

  const trees: FruitTree[] = [
    ...(firstPage.data?.data ?? []),
    ...remainingPages.flatMap((q) => q.data?.data ?? []),
  ]

  return {
    trees,
    isLoading: firstPage.isLoading,
    isComplete: !firstPage.isLoading && remainingPages.every((q) => !q.isLoading),
    total: firstPage.data?.pagination.total ?? 0,
  }
}

export function useTrees(filters: TreeFilters) {
  return useQuery({
    queryKey: ['trees', filters],
    queryFn: () => fetchTrees(filters),
    staleTime: 60 * 1000,
  })
}

export function useTreeDetail(treeId: string) {
  return useQuery({
    queryKey: ['tree', treeId],
    queryFn: () => fetchTreeById(treeId),
    enabled: !!treeId,
  })
}

export function useCreateTree() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ treePayload, photoFiles }: { treePayload: CreateTreePayload; photoFiles: File[] }) =>
      createTree(treePayload, photoFiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] })
    },
  })
}

export function useConfirmTree(treeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => confirmTree(treeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree', treeId] })
    },
  })
}

export function useReportTree(treeId: string) {
  return useMutation({
    mutationFn: () => reportTree(treeId),
  })
}
