// src/components/team/TeamChat.tsx
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, MessageSquare } from 'lucide-react'
import { chatService } from '../../services/chat.service'
import { useAuthStore } from '../../store/useAuthStore'
import { Avatar } from '../ui/Avatar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TeamChatProps {
  teamId: string
}

export function TeamChat({ teamId }: TeamChatProps) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: messages, isLoading } = useQuery({
    queryKey: ['team-chat', teamId],
    queryFn: () => chatService.getTeamMessages(teamId),
    refetchInterval: 5000 // Polling for demo purposes
  })

  const sendMutation = useMutation({
    mutationFn: () => chatService.sendTeamMessage(teamId, content),
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['team-chat', teamId] })
    }
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    sendMutation.mutate()
  }

  return (
    <div className="card flex flex-col h-[500px] p-0 overflow-hidden border-2 border-blue-50">
      <div className="bg-blue-600 p-3 text-white flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        <h3 className="font-bold text-sm">Chat da Equipe</h3>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages?.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Nenhuma mensagem ainda.</p>
            <p className="text-xs text-blue-500">Comece o papo com sua equipe!</p>
          </div>
        ) : (
          messages?.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${msg.senderId === user?.id ? 'flex-row-reverse' : ''}`}
            >
              <Avatar src={msg.sender?.avatarUrl} name={msg.sender?.name || 'U'} size="sm" />
              <div className={`max-w-[70%] ${msg.senderId === user?.id ? 'items-end' : ''} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-gray-400">
                    {msg.sender?.name}
                  </span>
                  <span className="text-[9px] text-gray-300">
                    {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className={`px-3 py-2 rounded-2xl shadow-sm text-sm ${
                  msg.senderId === user?.id 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
        <button
          type="submit"
          disabled={!content.trim() || sendMutation.isPending}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
