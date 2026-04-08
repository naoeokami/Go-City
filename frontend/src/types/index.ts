// src/types/index.ts
export type UserType =
  | 'FAN' | 'ATHLETE' | 'COACH'
  | 'REFEREE' | 'ORGANIZER' | 'JOURNALIST'

export type ChampionshipStatus =
  | 'DRAFT' | 'OPEN' | 'CLOSED'
  | 'ONGOING' | 'FINISHED' | 'CANCELLED'

export interface User {
  id:         string
  name:       string
  username:   string
  email:      string
  bio?:       string
  avatarUrl?: string
  coverUrl?:  string
  userType:   UserType
  sport:      string[]
  city?:      string
  state?:     string
  isVerified: boolean
  createdAt:  string
  _count?: {
    posts:     number
    followers: number
    following: number
  }
}

export interface Post {
  id:        string
  content:   string
  imageUrl?: string
  sport?:    string
  createdAt: string
  liked:     boolean
  author: {
    id:         string
    name:       string
    username:   string
    avatarUrl?: string
    userType:   UserType
    isVerified: boolean
  }
  _count: {
    likes:    number
    comments: number
  }
}

export interface Championship {
  id:                   string
  title:                string
  description:          string
  sport:                string
  imageUrl?:            string
  status:               ChampionshipStatus
  format:               string
  maxParticipants?:     number
  registrationFee:      number
  startDate:            string
  endDate:              string
  registrationDeadline: string
  location:             string
  city:                 string
  state:                string
  rules?:               string
  prizes?:              string
  createdAt:            string
  organizer: {
    id:         string
    name:       string
    username:   string
    avatarUrl?: string
  }
  results?: Result[]
  _count: {
    registrations: number
  }
}

export interface Result {
  id:             string
  championshipId: string
  phase:          string
  team1:          string
  team2:          string
  score1:         number
  score2:         number
  date:           string
  notes?:         string
}

export interface Comment {
  id:        string
  content:   string
  createdAt: string
  author: {
    id:         string
    name:       string
    username:   string
    avatarUrl?: string
  }
}

export interface AuthResponse {
  user:  User
  token: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total:      number
    page:       number
    limit:      number
    totalPages: number
  }
}