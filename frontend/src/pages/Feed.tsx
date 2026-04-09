// src/pages/Feed.tsx
import { useState }       from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Image as ImageIcon, X }    from 'lucide-react'
import toast              from 'react-hot-toast'
import { PostCard }       from '../components/feed/PostCard'
import { Avatar }         from '../components/ui/Avatar'
import { Button }         from '../components/ui/Button'
import { useAuthStore }   from '../store/useAuthStore'
import { postService }    from '../services/post.service'
import { uploadService } from '../services/upload.service'
import { Stories }       from '../components/feed/Stories'

export function FeedPage() {
  const { user }        = useAuthStore()
  const queryClient     = useQueryClient()
  const [content, setContent]     = useState('')
  const [sport, setSport]         = useState('')
  const [imageUrl, setImageUrl]   = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const { data: posts, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn:  () => postService.getFeed(),
  })

  const createPostMutation = useMutation({
    mutationFn: () => postService.create({
      content,
      sport: sport || undefined,
      imageUrl: imageUrl || undefined,
    }),
    onSuccess: () => {
      setContent('')
      setSport('')
      setImageUrl('')
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      toast.success('Post publicado!')
    },
    onError: () => toast.error('Erro ao publicar post'),
  })

  const sports = [
    'Futebol', 'Basquete', 'Vôlei', 'Tênis',
    'Natação', 'Atletismo', 'Futsal', 'Handebol',
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const res = await uploadService.uploadImage(file)
      setImageUrl(res.url)
      toast.success('Imagem carregada!')
    } catch (err) {
      toast.error('Erro ao subir imagem')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <Stories />

      {/* Criar Post */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <Avatar
            src={user?.avatarUrl}
            name={user?.name || 'U'}
            size="md"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="O que está acontecendo no mundo esportivo? ⚽🏀🎾"
              rows={3}
              className="w-full resize-none outline-none text-gray-800
                         placeholder-gray-400 text-sm"
            />

            {/* Seletor de esporte */}
            {content && (
              <div className="flex gap-2 flex-wrap mt-2">
                {sports.map(s => (
                  <button
                    key={s}
                    onClick={() => setSport(sport === s ? '' : s)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      sport === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-600 hover:border-blue-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Preview da Imagem */}
            {imageUrl && (
              <div className="relative mt-3 inline-block">
                <img
                  src={imageUrl}
                  alt="Post preview"
                  className="max-h-60 rounded-lg border border-gray-100"
                />
                <button
                  onClick={() => setImageUrl('')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                             hover:bg-red-600 transition-colors shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-2
                            border-t border-gray-100">
              <div className="flex items-center gap-4">
                <label className={`cursor-pointer transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : 'text-gray-400 hover:text-blue-500'}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <ImageIcon className="w-5 h-5" />
                </label>
                <span className="text-xs text-gray-400">
                  {content.length}/500
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => createPostMutation.mutate()}
                disabled={!content.trim() || content.length > 500}
                loading={createPostMutation.isPending}
              >
                <Send className="w-3.5 h-3.5" />
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : posts?.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="font-semibold text-gray-700 mb-1">
            Seu feed está vazio
          </p>
          <p className="text-sm text-gray-500">
            Siga outros atletas e fãs para ver as publicações aqui!
          </p>
        </div>
      ) : (
        posts?.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  )
}