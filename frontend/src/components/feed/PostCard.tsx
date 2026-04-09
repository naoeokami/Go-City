// src/components/feed/PostCard.tsx
import { useState }            from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR }                from 'date-fns/locale'
import { Heart, MessageCircle, Share2, BadgeCheck, MoreHorizontal, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Post }       from '../../types'
import { Avatar }     from '../ui/Avatar'
import { ImageModal } from '../ui/ImageModal'
import { postService } from '../../services/post.service'
import { useAuthStore } from '../../store/useAuthStore'
import { Comments } from './Comments'
import toast          from 'react-hot-toast'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const deleteMutation = useMutation({
    mutationFn: () => postService.delete(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['user-posts'] })
      toast.success('Postagem excluída')
    },
    onError: () => toast.error('Erro ao excluir postagem'),
  })

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

        {user?.id === post.author.id && (
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1">
                <button
                  onClick={() => {
                    if (confirm('Deseja realmente excluir esta postagem?')) {
                      deleteMutation.mutate()
                    }
                    setShowOptions(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir postagem
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <p className="text-gray-800 text-sm leading-relaxed mb-3">
        {post.content}
      </p>

      {/* Imagem */}
      {post.imageUrl && (
        <>
          <div 
            className="cursor-pointer overflow-hidden rounded-lg mb-3 bg-gray-50 flex items-center justify-center group"
            onClick={() => setIsImageModalOpen(true)}
          >
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full h-full max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          
          <ImageModal 
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            imageUrl={post.imageUrl}
          />
        </>
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

      {showComments && <Comments postId={post.id} />}
    </div>
  )
}