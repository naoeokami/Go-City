// src/services/team.service.ts
import api from './api'
import type { Team } from '../types'

export const teamService = {
  async list(sport?: string, myTeams?: boolean): Promise<Team[]> {
    const response = await api.get('/teams', { params: { sport, myTeams: myTeams ? 'true' : undefined } })
    return response.data
  },

  async getById(id: string): Promise<Team> {
    const response = await api.get(`/teams/${id}`)
    return response.data
  },

  async create(data: Partial<Team>): Promise<Team> {
    const response = await api.post('/teams', data)
    return response.data
  },

  async addMember(teamId: string, userId: string): Promise<any> {
    const response = await api.post(`/teams/${teamId}/members`, { userId })
    return response.data
  },

  async respondToInvite(teamId: string, accept: boolean): Promise<any> {
    const response = await api.post(`/teams/${teamId}/respond`, { accept })
    return response.data
  },

  async removeFromTeam(teamId: string, userId: string): Promise<any> {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`)
    return response.data
  }
}
