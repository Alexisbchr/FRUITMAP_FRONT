import axios, { AxiosError } from 'axios'
import type {
  FruitTree,
  Comment,
  User,
  AuthResponse,
  PaginatedResponse,
  TreeFilters,
  CreateTreePayload,
  ApiError,
} from '../types'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  withCredentials: true,
})

httpClient.interceptors.request.use((config) => {
  const authToken = localStorage.getItem('fruitmap_token')
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

httpClient.interceptors.response.use(
  (successResponse) => successResponse,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fruitmap_token')
      localStorage.removeItem('fruitmap_user')
    }
    return Promise.reject(error)
  }
)

// Auth
export async function registerUser(email: string, password: string, username: string): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/api/auth/register', { email, password, username })
  return data
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/api/auth/login', { email, password })
  return data
}

// Trees
export async function fetchTrees(filters: TreeFilters): Promise<PaginatedResponse<FruitTree>> {
  const { data } = await httpClient.get<PaginatedResponse<FruitTree>>('/api/trees', { params: filters })
  return data
}

export async function fetchTreeById(treeId: string): Promise<FruitTree> {
  const { data } = await httpClient.get<FruitTree>(`/api/trees/${treeId}`)
  return data
}

export async function createTree(treePayload: CreateTreePayload, photoFiles: File[]): Promise<FruitTree> {
  const formData = new FormData()
  Object.entries(treePayload).forEach(([fieldName, fieldValue]) => {
    if (Array.isArray(fieldValue)) {
      formData.append(fieldName, JSON.stringify(fieldValue))
    } else {
      formData.append(fieldName, String(fieldValue))
    }
  })
  photoFiles.forEach((photoFile) => formData.append('photos', photoFile))

  const { data } = await httpClient.post<FruitTree>('/api/trees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function confirmTree(treeId: string): Promise<void> {
  await httpClient.post(`/api/trees/${treeId}/confirm`)
}

export async function reportTree(treeId: string): Promise<void> {
  await httpClient.post(`/api/trees/${treeId}/report`)
}

// Comments
export async function fetchComments(treeId: string, page = 1): Promise<PaginatedResponse<Comment>> {
  const { data } = await httpClient.get<PaginatedResponse<Comment>>(
    `/api/trees/${treeId}/comments`,
    { params: { page } }
  )
  return data
}

export async function addComment(treeId: string, content: string): Promise<Comment> {
  const { data } = await httpClient.post<Comment>(`/api/trees/${treeId}/comments`, { content })
  return data
}

export async function deleteComment(treeId: string, commentId: string): Promise<void> {
  await httpClient.delete(`/api/trees/${treeId}/comments/${commentId}`)
}

// Users
export async function fetchMyProfile(): Promise<User> {
  const { data } = await httpClient.get<User>('/api/users/me')
  return data
}

export async function fetchMyContributions(page = 1): Promise<PaginatedResponse<FruitTree>> {
  const { data } = await httpClient.get<PaginatedResponse<FruitTree>>('/api/users/me/contributions', { params: { page } })
  return data
}

export async function fetchMyFavorites(): Promise<FruitTree[]> {
  const { data } = await httpClient.get<FruitTree[]>('/api/users/me/favorites')
  return data
}

export async function toggleFavorite(treeId: string): Promise<{ favorited: boolean }> {
  const { data } = await httpClient.post<{ favorited: boolean }>(`/api/users/me/favorites/${treeId}`)
  return data
}

// Admin
export async function fetchPendingTrees(page = 1): Promise<PaginatedResponse<FruitTree>> {
  const { data } = await httpClient.get<PaginatedResponse<FruitTree>>('/api/admin/trees/pending', { params: { page } })
  return data
}

export async function verifyTree(treeId: string): Promise<FruitTree> {
  const { data } = await httpClient.patch<FruitTree>(`/api/admin/trees/${treeId}/verify`)
  return data
}

export async function adminDeleteTree(treeId: string): Promise<void> {
  await httpClient.delete(`/api/admin/trees/${treeId}`)
}

export async function adminDeleteComment(commentId: string): Promise<void> {
  await httpClient.delete(`/api/admin/comments/${commentId}`)
}

export async function banUser(userId: string): Promise<void> {
  await httpClient.post(`/api/admin/users/${userId}/ban`)
}

export async function fetchAdminStats(): Promise<{
  totalTrees: number
  totalUsers: number
  totalComments: number
  topCities: { city: string; count: number }[]
}> {
  const { data } = await httpClient.get('/api/admin/stats')
  return data
}
