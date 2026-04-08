// src/pages/Profile.tsx
import { useParams }         from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Calendar, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR }   from 'date-fns/locale'
import toast      from 'react-hot-toast'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { PostCard } from '../components/feed/PostCard'
import { useAuthStore } from '../store/useAuthStore'
import api from '../services/api'

const userTypeLabels = {
  FAN:        '🏟️ Fã',
  ATHLETE:    '🏃 Atleta',
  COACH:      '📋 Técnico',
  REFEREE:    '🟨 Árbitro',
  ORGANIZER:  '🏆 Organizador',
  JOURNALIST: '📰 Jornalista',
}

export function ProfilePage() {
  const { username }    = useParams<{ username: string }>()
  const { user: me }    = useAuthStore()
  const queryClient     = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn:  () => api.get(`/users/${username}`).then(r => r.data),
  })

  const { data: posts } = useQuery({
    queryKey: ['profile-posts', username],
    queryFn:  () => api.get(`/users/${username}/posts`).then(r => r.data),
    enabled:  !!profile,
  })

  const followMutation = useMutation({
    mutationFn: () => api.post(`/users/${profile?.id}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] })
      toast.success('Ação realizada!')
    },
  })

  const isOwnProfile = me?.username === username

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="card h-40" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Usuário não encontrado</p>
      </div>
    )
  }

  return (
    <div>
      {/* Cover */}
      <div className="h-36 bg-gradient-to-r from-blue-500 via-purple-500
                      to-pink-500 rounded-xl mb-0" />

      {/* Card de perfil */}
      <div className="card -mt-8 mx-4 mb-4">
        <div className="flex items-end justify-between mb-4">
          <div className="-mt-12">
            <Avatar
              src={profile.avatarUrl}
              name={profile.name}
              size="xl"
            />
          </div>

          {!isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => followMutation.mutate()}
              loading={followMutation.isPending}
            >
              <UserPlus className="w-4 h-4" />
              Seguir
            </Button>
          )}
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
            {profile.isVerified && (
              <span className="text-blue-500 text-xs bg-blue-50
                               px-2 py-0.5 rounded-full">
                ✓ Verificado
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">@{profile.username}</p>
          <span className="text-xs bg-gray-100 text-gray-600
                           px-2 py-0.5 rounded-full mt-1 inline-block">
            {userTypeLabels[profile.userType as keyof typeof userTypeLabels]}
          </span>
        </div>

        {profile.bio && (
          <p className="text-gray-700 text-sm mb-3">{profile.bio}</p>
        )}

        {/* Esportes */}
        {profile.sport?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {profile.sport.map((s: string) => (
              <span key={s} className="text-xs bg-blue-50 text-blue-700
                                       px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          {profile.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {profile.city}
              {profile.state && `, ${profile.state}`}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Desde {format(new Date(profile.createdAt), "MMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>

        {/* Contadores */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="font-bold text-gray-900">{profile._count?.posts ?? 0}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900">{profile._count?.followers ?? 0}</p>
            <p className="text-xs text-gray-500">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900">{profile._count?.following ?? 0}</p>
            <p className="text-xs text-gray-500">Seguindo</p>
          </div>
        </div>
      </div>

      {/* Posts do usuário */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">Publicações</h2>
        {posts?.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 text-sm">
              {isOwnProfile
                ? 'Você ainda não publicou nada'
                : 'Este usuário ainda não publicou nada'
              }
            </p>
          </div>
        ) : (
          posts?.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  )
}