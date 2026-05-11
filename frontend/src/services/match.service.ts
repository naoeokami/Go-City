// src/services/match.service.ts
import api from './api'
import type { Match } from '../types'

export const matchService = {
  async listByChampionship(championshipId: string): Promise<Match[]> {
    const response = await api.get(`/matches/championship/${championshipId}`)
    return response.data
  },

  async create(data: Partial<Match>): Promise<Match> {
    const response = await api.post('/matches', data)
    return response.data
  },

  async updateScore(id: string, data: { 
    score1?: number; 
    score2?: number; 
    status?: string;
    isWalkover?: boolean;
    winnerId?: string;
  }): Promise<Match> {
    const response = await api.patch(`/matches/${id}/score`, data)
    return response.data
  }
}
