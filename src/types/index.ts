export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN'
export type Accessibility = 'public' | 'semi-public' | 'private'
export type TreeCondition = 'healthy' | 'sick' | 'unknown'

export interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string
  role: UserRole
  favorites: string[]
  createdAt: string
}

export interface FruitTree {
  id: string
  species: string
  fruitType: string
  description: string
  lat: number
  lng: number
  address?: string
  city: string
  accessibility: Accessibility
  harvestMonths: number[]
  condition: TreeCondition
  photos: string[]
  createdById: string
  createdBy?: Pick<User, 'id' | 'username' | 'avatarUrl'>
  confirmations: number
  createdAt: string
  updatedAt: string
  isVerified: boolean
  isActive: boolean
  _count?: {
    comments: number
    confirmationRecords?: number
  }
}

export interface Comment {
  id: string
  treeId: string
  userId: string
  user: Pick<User, 'id' | 'username' | 'avatarUrl'>
  content: string
  createdAt: string
}

export interface PaginatedResponse<DataType> {
  data: DataType[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TreeFilters {
  fruitType?: string
  accessibility?: Accessibility
  condition?: TreeCondition
  harvestMonth?: number
  lat?: number
  lng?: number
  radiusKm?: number
  city?: string
  page?: number
  limit?: number
}

export interface CreateTreePayload {
  species: string
  fruitType: string
  description: string
  lat: number
  lng: number
  address?: string
  city: string
  accessibility: Accessibility
  harvestMonths: number[]
  condition: TreeCondition
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiError {
  error: string
  details?: { field: string; message: string }[]
}
