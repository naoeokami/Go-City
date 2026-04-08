// src/hooks/useAuth.ts
import { useMutation }  from '@tanstack/react-query'
import { useNavigate }  from 'react-router-dom'
import toast            from 'react-hot-toast'
import { authService }  from '../services/auth.service'
import { useAuthStore } from '../store/useAuthStore'

export function useAuth() {
  const navigate = useNavigate()
  const { setAuth, logout, user, isLogged } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),

    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      toast.success(`Bem-vindo, ${user.name}! 🏆`)
      navigate('/feed')
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao fazer login')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: any) => authService.register(data),

    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      toast.success('Conta criada com sucesso! 🎉')
      navigate('/feed')
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar conta')
    },
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Até logo!')
  }

  return {
    user,
    isLogged,
    login:             loginMutation.mutate,
    register:          registerMutation.mutate,
    logout:            handleLogout,
    isLoadingLogin:    loginMutation.isPending,
    isLoadingRegister: registerMutation.isPending,
  }
}