import { useState }       from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Image as ImageIcon, Video, X, Trophy }    from 'lucide-react'
import toast              from 'react-hot-toast'
import { Link }           from 'react-router-dom'
import { PostCard }       from '../components/feed/PostCard'
import { MatchHighlightCard } from '../components/feed/MatchHighlightCard'
import { Avatar }         from '../components/ui/Avatar'
import { Button }         from '../components/ui/Button'
import { useAuthStore }   from '../store/useAuthStore'
import { postService }    from '../services/post.service'
import { uploadService }  from '../services/upload.service'
import { championshipService } from '../services/championship.service'
import { Stories }        from '../components/feed/Stories'

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

  // Fetch highlighted championship for the Hero Card
  const { data: highlightChampionship } = useQuery({
    queryKey: ['championships', 'highlight'],
    queryFn: async () => {
      const res = await championshipService.list()
      return res.data?.find((c: { status: string }) => c.status === 'OPEN') || res.data?.[0]
    }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const res = await uploadService.uploadImage(file)
      setImageUrl(res.url)
      toast.success(file.type.startsWith('video/') ? 'Vídeo carregado!' : 'Imagem carregada!')
    } catch {
      toast.error('Erro ao subir arquivo')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Premium Hero Card */}
      {highlightChampionship && (
        <Link to={`/championships/${highlightChampionship.id}`} className="block relative overflow-hidden rounded-[2rem] shadow-2xl group transition-all hover:scale-[1.01] hover:shadow-blue-500/20 dark:shadow-none border border-transparent dark:border-navy-700">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 dark:from-navy-900 dark:via-blue-900/40 dark:to-navy-900 z-0">
             {highlightChampionship.imageUrl && (
                <img src={highlightChampionship.imageUrl} className="w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-700" alt="Highlight" />
             )}
          </div>
          <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
             <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                   <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/30">Destaque</span>
                   <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{highlightChampionship.sport}</span>
                </div>
                <h2 className="text-3xl font-black text-white leading-tight mb-2 group-hover:text-blue-100 transition-colors">{highlightChampionship.title}</h2>
                <p className="text-blue-100/80 text-sm font-medium line-clamp-2 max-w-md">{highlightChampionship.description || 'Inscreva-se agora e garanta sua vaga neste evento incrível.'}</p>
             </div>
             <div className="hidden md:flex bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-col items-center justify-center min-w-[120px] border border-white/20 group-hover:bg-white/20 transition-all">
                <Trophy className="w-8 h-8 text-yellow-400 mb-2 drop-shadow-md" />
                <span className="text-white font-black text-sm text-center leading-none">Ver<br/>Detalhes</span>
             </div>
          </div>
        </Link>
      )}

      <Stories />

      {/* Criar Post */}
      <div className="card !p-5">
        <div className="flex gap-4">
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
              className="w-full resize-none outline-none text-gray-800 dark:text-gray-100 bg-transparent
                         placeholder-gray-400 dark:placeholder-gray-500 text-sm"
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
                        : 'border-gray-300 text-gray-600 hover:border-blue-400 dark:border-navy-600 dark:text-gray-400 dark:hover:border-blue-500'
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
                  {imageUrl.endsWith('.mp4') || imageUrl.endsWith('.mov') || imageUrl.includes('/video/') ? (
                    <video
                      src={imageUrl}
                      controls
                      className="max-h-60 rounded-lg border border-gray-100 dark:border-navy-700"
                    />
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Post preview"
                      className="max-h-60 rounded-lg border border-gray-100 dark:border-navy-700"
                    />
                  )}
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
                            border-t border-gray-100 dark:border-navy-700">
              <div className="flex items-center gap-4">
                <label className={`cursor-pointer transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : 'text-gray-400 hover:text-blue-500'}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <ImageIcon className="w-5 h-5" />
                </label>
                <label className={`cursor-pointer transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : 'text-gray-400 hover:text-purple-500'}`}>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Video className="w-5 h-5" />
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
                <div className="w-10 h-10 bg-gray-200 dark:bg-navy-800 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-navy-800 rounded w-32" />
                  <div className="h-3 bg-gray-200 dark:bg-navy-800 rounded w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-navy-800 rounded" />
                <div className="h-3 bg-gray-200 dark:bg-navy-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : posts?.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Seu feed está vazio
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Siga outros atletas e fãs para ver as publicações aqui!
          </p>
        </div>
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        posts?.map((item: any) => (
          item.feedType === 'MATCH_HIGHLIGHT' 
            ? <MatchHighlightCard key={item.id} activity={item} />
            : <PostCard key={item.id} post={item} />
        ))
      )}
    </div>
  )
}