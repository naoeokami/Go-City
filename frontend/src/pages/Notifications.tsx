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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificações</h1>
        {notifications?.some((n: any) => !n.read) && (
          <button 
            onClick={() => markAllAsReadMutation.mutate()}
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <Check className="w-3 h-3" />
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
            <Bell className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma notificação por enquanto.</p>
          </div>
        ) : (
          notifications?.map((notif: any) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && markAsReadMutation.mutate(notif.id)}
              className={`card flex flex-col gap-3 transition-all duration-300 group relative ${
                !notif.read 
                  ? 'border-l-4 border-l-blue-500 bg-blue-50/10 dark:bg-blue-500/5 shadow-md shadow-blue-100/10 dark:shadow-none cursor-pointer' 
                  : 'opacity-70 grayscale-[0.5] hover:grayscale-0'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <Avatar src={notif.sender?.avatarUrl} name={notif.sender?.name || 'System'} size="md" />
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-navy-800 rounded-full p-1 shadow-sm border border-gray-100 dark:border-navy-700">
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-sm leading-relaxed ${!notif.read ? 'font-black text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                      {notif.message}
                    </p>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                    {notif.link && (
                      <Link 
                        to={notif.link}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase hover:underline"
                      >
                        Ver Detalhes
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {!notif.read && notif.type === 'TEAM_INVITE' && notif.metadata?.teamId && (
                <div className="flex gap-2 ml-14 mt-1">
                  <Button 
                    size="sm" 
                    className="rounded-xl px-6 h-9 text-[10px] font-black uppercase"
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
                    size="sm" 
                    className="rounded-xl px-6 h-9 text-[10px] font-black uppercase border-gray-200 dark:border-navy-600"
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
