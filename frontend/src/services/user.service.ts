import api from './api';
import { User } from '../types';

export const userService = {
  async getProfile(username: string): Promise<User> {
    const response = await api.get(`/users/profile/${username}`);
    return response.data;
  },
  async search(query: string): Promise<User[]> {
    const response = await api.get(`/users/search?q=${query}`);
    return response.data;
  },
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  async toggleFollow(targetId: string): Promise<{ following: boolean }> {
    const response = await api.post(`/users/follow/${targetId}`);
    return response.data;
  },
  async getSuggestions(): Promise<User[]> {
    const response = await api.get('/users/suggestions');
    return response.data;
  }
};
