// src/store/useAuthStore.ts
import { create }   from 'zustand'
import { persist }  from 'zustand/middleware'
import type { User }     from '../types'

interface AuthState {
  user:       User | null
  token:      string | null
  isLogged:   boolean
  setAuth:    (user: User, token: string) => void
  updateUser: (user: Partial<User>) => void
  logout:     () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:     null,
      token:    null,
      isLogged: false,

      setAuth: (user, token) =>
        set({ user, token, isLogged: true }),

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),

      logout: () =>
        set({ user: null, token: null, isLogged: false }),
    }),
    {
      name:       'sportconnect-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)