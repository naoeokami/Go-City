// src/services/story.service.ts
import api from './api'

export const storyService = {
  async getStories() {
    const response = await api.get('/stories')
    return response.data
  },

  async create(imageUrl: string) {
    const response = await api.post('/stories', { imageUrl })
    return response.data
  },

  async delete(id: string) {
    const response = await api.delete(`/stories/${id}`)
    return response.data
  }
}
