// src/services/user.service.ts
import api from './api'
import type { User, Post } from '../types'

export const userService = {
  async getProfile(username: string): Promise<User> {
    const response = await api.get<User>(`/users/${username}`)
    return response.data
  },

  async getUserPosts(username: string): Promise<Post[]> {
    const response = await api.get<Post[]>(`/users/${username}/posts`)
    return response.data
  },

  async toggleFollow(userId: string): Promise<{ following: boolean }> {
    const response = await api.post(`/users/${userId}/follow`)
    return response.data
  },

  async search(query: string): Promise<User[]> {
    const response = await api.get<User[]>(`/users/search?q=${query}`)
    return response.data
  },

  async getRanking(sport?: string, category?: string): Promise<User[]> {
    const params = new URLSearchParams()
    if (sport) params.append('sport', sport)
    if (category) params.append('category', category)
    
    const response = await api.get<User[]>(`/users/ranking?${params.toString()}`)
    return response.data
  }
}
