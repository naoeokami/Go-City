// src/services/chat.service.ts
import api from './api'
import type { Message } from '../types'

export const chatService = {
  async listConversations(): Promise<any[]> {
    const response = await api.get('/chat/conversations')
    return response.data
  },

  async getConversation(otherId: string): Promise<Message[]> {
    const response = await api.get(`/chat/${otherId}`)
    return response.data
  },

  async sendMessage(receiverId: string, content: string): Promise<Message> {
    const response = await api.post('/chat', { receiverId, content })
    return response.data
  },

  async markAsRead(otherId: string): Promise<void> {
    await api.put(`/chat/${otherId}/read`)
  },

  async getTeamMessages(teamId: string): Promise<Message[]> {
    const response = await api.get(`/chat/team/${teamId}`)
    return response.data
  },

  async sendTeamMessage(teamId: string, content: string): Promise<Message> {
    const response = await api.post('/chat', { teamId, content })
    return response.data
  }
}
