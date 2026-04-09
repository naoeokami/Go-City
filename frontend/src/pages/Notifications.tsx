// src/pages/Notifications.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Heart, MessageCircle, UserPlus, Trophy } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { notificationService } from '../services/notification.service'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

export function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Todas marcadas como lidas')
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const respondMutation = useMutation({
    mutationFn: ({ teamId, accept }: { teamId: string, accept: boolean }) => 
      api.post(`/teams/${teamId}/respond`, { accept }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success(variables.accept ? 'Você aceitou o convite!' : 'Convite recusado.')
    },
    onError: () => toast.error('Erro ao responder convite')
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'POST_LIKE': return <Heart className="w-4 h-4 text-red-500 fill-current" />
      case 'POST_COMMENT': return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'NEW_FOLLOWER': return <UserPlus className="w-4 h-4 text-green-500" />
      case 'NEW_CHAMPIONSHIP': return <Trophy className="w-4 h-4 text-yellow-500" />
      case 'TEAM_INVITE': return <UserPlus className="w-4 h-4 text-purple-500" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
        {notifications?.some((n: any) => !n.read) && (
          <button 
            onClick={() => markAllAsReadMutation.mutate()}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse h-20" />
          ))
        ) : notifications?.length === 0 ? (
          <div className="card text-center py-12">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma notificação por enquanto.</p>
          </div>
        ) : (
          notifications?.map((notif: any) => (
            <div
              key={notif.id}
              className={`card flex flex-col gap-3 transition-colors hover:bg-gray-50/50 ${!notif.read ? 'border-l-4 border-l-blue-500 bg-blue-50/5 shadow-blue-100/20' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar src={notif.sender?.avatarUrl} name={notif.sender?.name || 'System'} size="md" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={notif.link || '#'} 
                    onClick={() => !notif.read && markAsReadMutation.mutate(notif.id)}
                    className={`text-sm block leading-relaxed ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                  >
                    {notif.message}
                  </Link>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                )}
              </div>

              {!notif.read && notif.type === 'TEAM_INVITE' && notif.metadata?.teamId && (
                <div className="flex gap-2 ml-14 mt-1">
                  <Button 
                    size="xs" 
                    className="rounded-full px-4"
                    onClick={(e) => {
                        e.stopPropagation();
                        respondMutation.mutate({ teamId: notif.metadata.teamId, accept: true });
                        markAsReadMutation.mutate(notif.id);
                    }}
                    loading={respondMutation.isPending}
                  >
                    Aceitar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="xs" 
                    className="rounded-full px-4 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        respondMutation.mutate({ teamId: notif.metadata.teamId, accept: false });
                        markAsReadMutation.mutate(notif.id);
                    }}
                    loading={respondMutation.isPending}
                  >
                    Recusar
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
