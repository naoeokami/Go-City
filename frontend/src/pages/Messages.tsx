// src/pages/Messages.tsx
import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Send, ChevronLeft } from 'lucide-react'
import { chatService } from '../services/chat.service'
import { useAuthStore } from '../store/useAuthStore'
import { Avatar } from '../components/ui/Avatar'
import toast from 'react-hot-toast'

export function MessagesPage() {
  const { user } = useAuthStore()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<any>(location.state?.selectedUser || null)
  const [content, setContent] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: contacts, isLoading: isLoadingContacts } = useQuery<any[]>({
    queryKey: ['chat-conversations'],
    queryFn: () => chatService.listConversations(),
    refetchInterval: 5000
  })

  const markAsReadMutation = useMutation({
    mutationFn: (uid: string) => chatService.markAsRead(uid),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat-conversations'] })
    }
  })

  useEffect(() => {
    if (selectedUser) {
        markAsReadMutation.mutate(selectedUser.id)
    }
  }, [selectedUser])

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat-messages', selectedUser?.id],
    queryFn: () => chatService.getConversation(selectedUser!.id),
    enabled: !!selectedUser,
    refetchInterval: 5000 // Polling simplificado
  })

  const sendMutation = useMutation({
    mutationFn: (msg: string) => chatService.sendMessage(selectedUser.id, msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedUser.id] })
      setContent('')
    },
    onError: () => toast.error('Falha ao enviar')
  })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    sendMutation.mutate(content)
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex-1 flex bg-white dark:bg-navy-900 md:rounded-2xl border-x md:border border-gray-100 dark:border-navy-700 overflow-hidden md:shadow-sm h-full min-h-0">
      
      {/* Sidebar de contatos */}
      <div className={`w-full md:w-80 border-r border-gray-100 dark:border-navy-700 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-navy-700 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-500" />
          <h2 className="font-bold text-gray-900 dark:text-white">Mensagens</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoadingContacts ? (
             <p className="p-4">Carregando...</p>
          ) : contacts?.length === 0 ? (
            <p className="p-4 text-center text-gray-500 text-sm py-12">Nenhuma conversa ativa.</p>
          ) : (
            contacts?.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelectedUser(contact)}
                className={`w-full p-4 flex items-center gap-3 transition-colors text-left hover:bg-gray-50 dark:hover:bg-navy-800 ${selectedUser?.id === contact.id ? 'bg-blue-50/50 dark:bg-navy-800' : ''}`}
              >
                <Avatar src={contact.avatarUrl} name={contact.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{contact.name}</p>
                    {contact.unreadCount > 0 && (
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-sm shadow-blue-200 dark:shadow-none" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{contact.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Área da conversa */}
      <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-navy-900">
            <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm mb-4">
              <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-500 animate-pulse" />
            </div>
            <p className="font-medium text-gray-900 dark:text-white">Suas Mensagens</p>
            <p className="text-sm">Selecione uma pessoa para começar a conversar.</p>
          </div>
        ) : (
          <>
            {/* Header da conversa */}
            <div className="p-4 border-b border-gray-100 dark:border-navy-700 flex items-center gap-3 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md sticky top-0 z-10">
              <button onClick={() => setSelectedUser(null)} className="md:hidden p-1 text-gray-600 dark:text-gray-400">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <Avatar src={selectedUser.avatarUrl} name={selectedUser.name} size="sm" />
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white leading-none">{selectedUser.name}</p>
                <p className="text-xs text-green-500 font-medium mt-1">Online agora</p>
              </div>
            </div>

            {/* Mensagens */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/20 dark:bg-navy-900">
              {isLoadingMessages ? (
                <p>Carregando mensagens...</p>
              ) : messages?.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`
                    max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm
                    ${msg.senderId === user?.id 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200 dark:shadow-none' 
                        : 'bg-white dark:bg-navy-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-navy-700'
                    }
                  `}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input de mensagem */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 sticky bottom-0">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 dark:bg-navy-800 rounded-2xl flex items-center pr-2 border border-transparent focus-within:border-gray-200 dark:focus-within:border-navy-600">
                  <input
                    type="text"
                    placeholder="Escreva sua mensagem..."
                    className="flex-1 bg-transparent border-none outline-none text-sm p-3 px-4 min-w-0 dark:text-white dark:placeholder-gray-400"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                  />
                  {content.trim() && (
                    <button 
                       type="submit"
                       disabled={sendMutation.isPending}
                       className="text-blue-600 dark:text-blue-500 p-1.5 hover:bg-blue-50 dark:hover:bg-navy-700 rounded-full transition-colors flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {!content.trim() && (
                   <button 
                    type="button"
                    className="bg-gray-100 dark:bg-navy-800 text-gray-400 dark:text-gray-500 p-3 rounded-2xl flex-shrink-0"
                    disabled
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
