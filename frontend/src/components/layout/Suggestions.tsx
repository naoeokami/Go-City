// src/components/layout/Suggestions.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { UserPlus, Check } from 'lucide-react'
import api from '../../services/api'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import toast from 'react-hot-toast'

export function Suggestions() {
  const queryClient = useQueryClient()
  const { data: users, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => api.get('/users/suggestions').then(res => res.data)
  })

  const followMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/users/${userId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] })
      toast.success('Seguindo!')
    }
  })

  if (isLoading || !users || users.length === 0) return null

  return (
    <div className="card sticky top-24">
      <h3 className="font-bold text-gray-900 mb-4 px-1">Sugestões</h3>
      <div className="space-y-4">
        {users.map((user: any) => (
          <div key={user.id} className="flex items-center justify-between gap-3">
            <Link to={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar src={user.avatarUrl} name={user.name} size="md" />
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate leading-none mb-1">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
              </div>
            </Link>
            <Button
              size="xs"
              variant="outline"
              className="rounded-full px-3 h-7 text-[11px]"
              onClick={() => followMutation.mutate(user.id)}
              loading={followMutation.isPending}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Seguir
            </Button>
          </div>
        ))}
      </div>
      <Link to="/explore" className="text-xs text-blue-600 font-bold mt-4 block p-1 hover:underline">
        Ver mais sugestões
      </Link>
    </div>
  )
}
