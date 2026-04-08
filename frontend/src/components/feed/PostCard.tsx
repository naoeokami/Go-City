// src/components/feed/PostCard.tsx
import { useState }            from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR }                from 'date-fns/locale'
import { Heart, MessageCircle, Share2, BadgeCheck } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Post }       from '../../types'
import { Avatar }     from '../ui/Avatar'
import { postService } from '../../services/post.service'
import toast          from 'react-hot-toast'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const queryClient = useQueryClient()

  const likeMutation = useMutation({
    mutationFn: () => postService.toggleLike(post.id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
    onError: () => toast.error('Erro ao curtir post'),
  })

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale:    ptBR,
  })

  return (
    <div className="card mb-4">
      {/* Header do post */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar
          src={post.author.avatarUrl}
          name={post.author.name}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">
              {post.author.name}
            </span>
            {post.author.isVerified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-gray-500 text-sm">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">@{post.author.username}</span>
            {post.sport && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5
                               rounded-full text-xs font-medium">
                {post.sport}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <p className="text-gray-800 text-sm leading-relaxed mb-3">
        {post.content}
      </p>

      {/* Imagem */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full rounded-lg mb-3 max-h-80 object-cover"
        />
      )}

      {/* Ações */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
        <button
          onClick={() => likeMutation.mutate()}
          className={`flex items-center gap-1.5 text-sm transition-colors
                      hover:scale-105 ${
                        post.liked
                          ? 'text-red-500'
                          : 'text-gray-500 hover:text-red-400'
                      }`}
        >
          <Heart className={`w-5 h-5 ${post.liked ? 'fill-current' : ''}`} />
          <span>{post._count.likes}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post._count.comments}</span>
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Link copiado!')
          }}
          className="flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-green-500 transition-colors ml-auto"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}