// src/services/championship.service.ts
import api from './api'
import type { Championship, PaginatedResponse } from '../types'

export const championshipService = {
  async list(params?: any): Promise<PaginatedResponse<Championship>> {
    const response = await api.get('/championships', { params })
    return response.data
  },

  async getById(id: string): Promise<Championship> {
    const response = await api.get(`/championships/${id}`)
    return response.data
  },

  async create(data: any): Promise<Championship> {
    const response = await api.post('/championships', data)
    return response.data
  },

  async updateStatus(id: string, status: string): Promise<Championship> {
    const response = await api.patch(`/championships/${id}/status`, { status })
    return response.data
  },

  async register(championshipId: string, data?: any): Promise<any> {
    const response = await api.post('/registrations', { championshipId, ...data })
    return response.data
  },

  async addResult(championshipId: string, data: any): Promise<any> {
    const response = await api.post(`/championships/${championshipId}/results`, data)
    return response.data
  },

  async finish(championshipId: string, results: any): Promise<any> {
    const response = await api.post(`/championships/${championshipId}/finish`, results)
    return response.data
  },

  async generate(championshipId: string): Promise<any> {
    const response = await api.post(`/championships/${championshipId}/generate`)
    return response.data
  },

  async generateGroups(championshipId: string, groupsCount?: number): Promise<any> {
    const response = await api.post(`/championships/${championshipId}/generate-groups`, { groupsCount })
    return response.data
  },

  async generateBrackets(championshipId: string): Promise<any> {
    const response = await api.post(`/championships/${championshipId}/generate-brackets`)
    return response.data
  },

  async getStandings(championshipId: string): Promise<any[]> {
    const response = await api.get(`/championships/${championshipId}/standings`)
    return response.data
  },

  async updateRegistrationStatus(registrationId: string, status: 'APPROVED' | 'REJECTED'): Promise<any> {
    const response = await api.patch(`/registrations/${registrationId}/status`, { status })
    return response.data
  },

  async deleteRegistration(registrationId: string): Promise<any> {
    const response = await api.delete(`/registrations/${registrationId}`)
    return response.data
  }
}