// src/services/post.service.ts
import api  from './api'
import type { Post } from '../types'

export const postService = {
  async getFeed(page = 1): Promise<Post[]> {
    const response = await api.get<Post[]>(`/posts/feed?page=${page}`)
    return response.data
  },

  async create(data: { content: string; imageUrl?: string; sport?: string }): Promise<Post> {
    const response = await api.post<Post>('/posts', data)
    return response.data
  },

  async toggleLike(postId: string): Promise<{ liked: boolean }> {
    const response = await api.post(`/posts/${postId}/like`)
    return response.data
  },

  async getComments(postId: string) {
    const response = await api.get(`/posts/${postId}/comments`)
    return response.data
  },

  async addComment(postId: string, content: string) {
    const response = await api.post(`/posts/${postId}/comments`, { content })
    return response.data
  },

  async getExplore(page = 1): Promise<Post[]> {
    const response = await api.get<Post[]>(`/posts/explore?page=${page}`)
    return response.data
  },

  async delete(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`)
  },
}