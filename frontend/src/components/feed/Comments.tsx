// src/components/feed/Comments.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { postService } from '../../services/post.service'
import { Avatar } from '../ui/Avatar'
import { useAuthStore } from '../../store/useAuthStore'

interface CommentsProps {
  postId: string
}

export function Comments({ postId }: CommentsProps) {
  const [content, setContent] = useState('')
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => postService.getComments(postId),
  })

  const addCommentMutation = useMutation({
    mutationFn: () => postService.addComment(postId, content),
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      toast.success('Comentário adicionado!')
    },
    onError: () => toast.error('Erro ao comentar'),
  })

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
      {/* Form */}
      <div className="flex gap-3 px-1">
        <Avatar src={user?.avatarUrl} name={user?.name || ''} size="sm" className="flex-shrink-0" />
        <div className="flex-1 flex gap-2 min-w-0">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva um comentário..."
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && content.trim()) {
                addCommentMutation.mutate()
              }
            }}
          />
          <button
            onClick={() => addCommentMutation.mutate()}
            disabled={!content.trim() || addCommentMutation.isPending}
            className="text-blue-600 disabled:opacity-50 flex-shrink-0 ml-1"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="animate-pulse flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
          </div>
        ) : (
          comments?.map((comment: any) => (
            <div key={comment.id} className="flex gap-2 group">
              <Avatar src={comment.author.avatarUrl} name={comment.author.name} size="sm" />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                  <p className="font-semibold text-xs text-gray-900">{comment.author.name}</p>
                  <p className="text-sm text-gray-800 break-words">{comment.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 ml-1">
                  <span className="text-[10px] text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
