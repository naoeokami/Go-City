// src/pages/Profile.tsx
import { useParams, useNavigate }         from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Calendar, UserPlus, MessageSquare, Trophy } from 'lucide-react'
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
  const navigate        = useNavigate()
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/messages', { state: { selectedUser: profile } })}
              >
                <MessageSquare className="w-4 h-4" />
                Mensagem
              </Button>
              <Button
                variant={profile.isFollowing ? "outline" : "primary"}
                size="sm"
                onClick={() => followMutation.mutate()}
                loading={followMutation.isPending}
              >
                {profile.isFollowing ? (
                  <>Seguindo</>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Seguir
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
            {profile.isVerified && (
              <span className="text-blue-500 dark:text-blue-400 text-xs bg-blue-50 dark:bg-blue-500/10
                               px-2 py-0.5 rounded-full">
                ✓ Verificado
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">@{profile.username}</p>
          <span className="text-xs bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300
                           px-2 py-0.5 rounded-full mt-1 inline-block">
            {userTypeLabels[profile.userType as keyof typeof userTypeLabels]}
          </span>
        </div>

        {profile.bio && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{profile.bio}</p>
        )}

        {/* Esportes */}
        {profile.sport?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {profile.sport.map((s: string) => (
              <span key={s} className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400
                                       px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-navy-700">
          <div className="text-center">
            <p className="font-bold text-gray-900 dark:text-white">{profile._count?.posts ?? 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 dark:text-white">{profile._count?.followers ?? 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 dark:text-white">{profile._count?.following ?? 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Seguindo</p>
          </div>
          <div className="text-center px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <p className="font-bold text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              {profile.score ?? 0}
            </p>
            <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Score</p>
          </div>
        </div>
      </div>

      {/* Badges & Achievements (Gamification) */}
      {profile.gamification && (
        <>
          <div className="card !p-5 mb-6 mx-4 md:mx-0">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Conquistas & Badges</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {profile.gamification.badges.map((badge: any) => (
                <div key={badge.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-transform ${
                    badge.color === 'yellow' ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-yellow-500/20' :
                    badge.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/20' :
                    'bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/20'
                  }`}>
                    {badge.icon === 'Trophy' && <Trophy className="w-6 h-6 text-white" />}
                    {badge.icon === 'Calendar' && <Calendar className="w-6 h-6 text-white" />}
                    {badge.icon === 'UserPlus' && <UserPlus className="w-6 h-6 text-white" />}
                  </div>
                  <span className="text-[10px] font-black text-gray-900 dark:text-white text-center leading-tight">
                    {badge.title.split(' ').map((word: string, i: number) => <span key={i}>{word}<br/></span>)}
                  </span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2 min-w-[80px] opacity-40 grayscale">
                <div className="w-14 h-14 bg-gray-200 dark:bg-navy-700 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-[10px] font-black text-gray-500 text-center leading-tight">Campeão<br/>Nacional</span>
              </div>
            </div>
          </div>

          {/* Advanced Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 mx-4 md:mx-0">
            <div className="card !p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl shadow-blue-600/20">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Win Rate</p>
                <p className="text-3xl font-black mb-2">{profile.gamification.winRate}%</p>
                <div className="w-full bg-blue-900/50 rounded-full h-1.5 mb-1">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: `${profile.gamification.winRate}%` }}></div>
                </div>
                <p className="text-[9px] text-blue-200">De {profile.gamification.matchesPlayed} partidas registradas</p>
            </div>
            <div className="card !p-5 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Desempenho</p>
                <div className="flex items-end gap-1 h-12 mb-2">
                  {profile.gamification.recentPerformance.map((result: string, i: number) => (
                    <div 
                      key={i}
                      className={`w-full rounded-t-sm ${
                        result === 'win' ? 'bg-green-500 h-[100%]' : 
                        result === 'loss' ? 'bg-red-400 h-[30%]' : 
                        'bg-gray-300 dark:bg-navy-600 h-[60%]'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400">Últimos {profile.gamification.recentPerformance.length} jogos</p>
            </div>
          </div>
        </>
      )}

      {/* Posts do usuário */}
      <div className="mx-4 md:mx-0">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Publicações Recentes</h2>
        {posts?.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 font-bold">
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