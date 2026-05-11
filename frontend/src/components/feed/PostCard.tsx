// src/components/feed/PostCard.tsx
import { useState }            from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR }                from 'date-fns/locale'
import { Link }                   from 'react-router-dom'
import { Heart, MessageCircle, Share2, BadgeCheck, MoreHorizontal, Trash2, Search, Play } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Post }       from '../../types'
import { Avatar }     from '../ui/Avatar'
import { ImageModal } from '../ui/ImageModal'
import { VideoModal } from '../ui/VideoModal'
import { postService } from '../../services/post.service'
import { useAuthStore } from '../../store/useAuthStore'
import { Comments } from './Comments'
import toast          from 'react-hot-toast'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  if (!post || !post.author) return null;
  const [showComments, setShowComments] = useState(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
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
    onMutate: async () => {
      // Keys to update optimistically
      const queryKeys = [['feed'], ['user-posts'], ['explore-posts'], ['profile-posts', post.author.username]]
      
      // Cancel queries to avoid overwriting optimistic update
      for (const key of queryKeys) {
        await queryClient.cancelQueries({ queryKey: key })
      }
      
      // Snapshot previous values
      const snapshots = new Map()
      queryKeys.forEach(key => {
        snapshots.set(JSON.stringify(key), queryClient.getQueryData(key))
      })

      // Helper to update posts in a list
      const updatePostInList = (old: any) => {
        if (!old) return old
        // Handle both simple arrays and paginated objects
        
        const updateItem = (item: any) => {
          if (item.id === post.id) {
            const isLiking = !item.liked
            return {
              ...item,
              liked: isLiking,
              _count: {
                ...item._count,
                likes: (item._count?.likes || 0) + (isLiking ? 1 : -1)
              }
            }
          }
          return item
        }

        if (Array.isArray(old)) {
          return old.map(updateItem)
        } else if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: Array.isArray(page.data) ? page.data.map(updateItem) : page.map(updateItem)
            }))
          }
        } else if (old.data) {
          return { ...old, data: old.data.map(updateItem) }
        }
        return old
      }

      // Optimistically update all query keys
      queryKeys.forEach(key => {
        queryClient.setQueryData(key, updatePostInList)
      })

      return { snapshots }
    },
    onError: (_err, _variables, context) => {
      if (context?.snapshots) {
        context.snapshots.forEach((value: any, keyString: string) => {
          queryClient.setQueryData(JSON.parse(keyString), value)
        })
      }
      toast.error('Erro ao curtir post')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['user-posts'] })
      queryClient.invalidateQueries({ queryKey: ['explore-posts'] })
      queryClient.invalidateQueries({ queryKey: ['profile-posts', post.author.username] })
    },
  })

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale:    ptBR,
  })

  const isVideo = post.imageUrl?.endsWith('.mp4') || 
                  post.imageUrl?.endsWith('.mov') || 
                  post.imageUrl?.includes('/video/') ||
                  post.imageUrl?.includes('.mp4?')

  return (
    <div className="card mb-4 overflow-hidden">
      {/* Header do post */}
      <div className="flex items-start gap-3 mb-3">
        <Link to={`/profile/${post.author.username}`} className="shrink-0">
          <Avatar
            src={post.author.avatarUrl}
            name={post.author.name}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${post.author.username}`} className="group">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">
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
                                 rounded-full text-[10px] font-black uppercase">
                  {post.sport}
                </span>
              )}
            </div>
          </Link>
        </div>

        {user?.id === post.author.id && (
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-full transition-colors text-gray-400"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-lg shadow-lg z-10 py-1">
                <button
                  onClick={() => {
                    if (confirm('Deseja realmente excluir esta postagem?')) {
                      deleteMutation.mutate()
                    }
                    setShowOptions(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
      <p className="text-gray-800 dark:text-gray-100 text-sm leading-relaxed mb-3">
        {post.content}
      </p>

      {/* Mídia */}
      {post.imageUrl && (
        <div 
          className="cursor-pointer overflow-hidden rounded-xl mb-3 bg-black flex items-center justify-center group relative max-h-[600px]"
          onClick={() => setIsMediaModalOpen(true)}
        >
          {isVideo ? (
            <div className="relative w-full h-[450px] flex items-center justify-center bg-gray-900">
               <video
                src={post.imageUrl}
                className="w-full h-full object-cover pointer-events-none"
                muted
                loop
                playsInline
                onMouseOver={e => e.currentTarget.play()}
                onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                  <Play className="w-10 h-10 text-white fill-current" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <img
                src={post.imageUrl}
                alt="Post content"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                  <Search className="w-8 h-8 text-white" />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modais */}
      {post.imageUrl && (
        isVideo ? (
          <VideoModal 
            isOpen={isMediaModalOpen}
            onClose={() => setIsMediaModalOpen(false)}
            videoUrl={post.imageUrl}
          />
        ) : (
          <ImageModal 
            isOpen={isMediaModalOpen}
            onClose={() => setIsMediaModalOpen(false)}
            imageUrl={post.imageUrl}
          />
        )
      )}

      {/* Ações */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-100 dark:border-navy-700">
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
          <span>{post._count?.likes || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post._count?.comments || 0}</span>
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.host}/post/${post.id}`)
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