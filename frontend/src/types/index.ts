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
  score:      number
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

export type ChampionshipFormat = 'KNOCKOUT' | 'ROUND_ROBIN' | 'GROUPS_PLUS_KNOCKOUT'
export type RegistrationType = 'INDIVIDUAL' | 'TEAM'

export interface Championship {
  id:                   string
  title:                string
  description:          string
  sport:                string
  imageUrl?:            string
  status:               ChampionshipStatus
  format:               ChampionshipFormat
  registrationType:     RegistrationType
  maxParticipants?:     number
  advancePerGroup?:     number
  groupsCount?:         number
  registrationFee:      number
  startDate:            string
  endDate:              string
  registrationDeadline: string
  location:             string
  city:                 string
  state:                string
  rules?:               string
  prizes?:              string
  organizerId:          string
  createdAt:            string

  organizer: {
    id:         string
    name:       string
    username:   string
    avatarUrl?: string
  }
  matches?: Match[]
  results?: Result[]
  registrations?: {
    id: string
    teamId?: string
    userId?: string
    createdAt: string
    team?: Team
    user?: User
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    teamName?: string
  }[]
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

export interface Team {
  id:          string
  name:        string
  description?: string
  logoUrl?:     string
  captainId:   string
  sport:       string
  city?:       string
  state?:      string
  createdAt:   string
  members:     TeamMember[]
  _count?: {
    members: number
  }
}

export interface TeamMember {
  id:       string
  teamId:   string
  userId:   string
  user: {
    id:         string
    name:       string
    username:   string
    avatarUrl?: string
  }
  role:     'CAPTAIN' | 'PLAYER' | 'COACH'
  joinedAt: string
}

export interface Match {
  id:             string
  championshipId?: string
  team1Id?:       string
  team1?:         Team
  team2Id?:       string
  team2?:         Team
  player1Id?:     string
  player1?:       User
  player2Id?:     string
  player2?:       User
  score1:         number
  score2:         number
  date:           string
  location?:      string
  phase?:         string
  status:         'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED'
  winnerId?:      string
  isWalkover?:    boolean
}

export interface Message {
  id:         string
  content:    string
  senderId:   string
  receiverId: string
  read:       boolean
  createdAt:  string
  sender?: {
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