// src/components/feed/Stories.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { storyService } from '../../services/story.service'
import { uploadService } from '../../services/upload.service'
import { Avatar } from '../ui/Avatar'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export function Stories() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedUserStories, setSelectedUserStories] = useState<any>(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)

  const { data: storyGroups } = useQuery({
    queryKey: ['stories'],
    queryFn: () => storyService.getStories(),
  })

  const uploadStoryMutation = useMutation({
    mutationFn: async (file: File) => {
      const { url } = await uploadService.uploadImage(file)
      return storyService.create(url)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] })
      toast.success('Story postado!')
    },
    onError: () => toast.error('Erro ao postar story'),
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadStoryMutation.mutate(file)
  }

  const openStories = (group: any) => {
    setSelectedUserStories(group)
    setCurrentStoryIndex(0)
  }

  const closeStories = () => {
    setSelectedUserStories(null)
  }

  const nextStory = () => {
    if (currentStoryIndex < selectedUserStories.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1)
    } else {
      closeStories()
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-6 no-scrollbar">
      {/* Botão de adicionar */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <label className="relative cursor-pointer group">
          <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
          <div className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-navy-700 p-1 flex items-center justify-center bg-white dark:bg-navy-800 group-hover:border-blue-500 transition-colors">
            <Avatar src={user?.avatarUrl} name={user?.name || ''} size="lg" className="border-2 border-white dark:border-navy-800" />
          </div>
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 border-2 border-white dark:border-navy-800 shadow-sm">
            <Plus className="w-3 h-3" />
          </div>
        </label>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Seu story</span>
      </div>

      {/* Lista de Stories */}
      {storyGroups?.map((group: any) => (
        <div 
          key={group.user.id} 
          className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
          onClick={() => openStories(group)}
        >
          <div className="w-16 h-16 rounded-full border-2 border-blue-500 p-0.5 animate-gradient-xy">
            <Avatar src={group.user.avatarUrl} name={group.user.name} size="lg" className="border-2 border-white dark:border-navy-900" />
          </div>
          <span className="text-[10px] text-gray-700 dark:text-gray-300 font-medium max-w-[64px] truncate">
            {group.user.name.split(' ')[0]}
          </span>
        </div>
      ))}

      {/* Visualizador de Story */}
      {selectedUserStories && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center touch-none">
          <div className="relative w-full max-w-lg aspect-[9/16] bg-black overflow-hidden lg:rounded-xl">
            {/* Barra de progresso */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              {selectedUserStories.stories.map((_: any, idx: number) => (
                <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-white transition-all duration-[5000ms] ease-linear`}
                    style={{ 
                      width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? '100%' : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Avatar src={selectedUserStories.user.avatarUrl} name={selectedUserStories.user.name} size="sm" />
                <span className="text-white text-sm font-semibold">{selectedUserStories.user.name}</span>
              </div>
              <button onClick={closeStories} className="text-white hover:bg-white/10 rounded-full p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do Story (Imagem ou Vídeo) */}
            {selectedUserStories.stories[currentStoryIndex].imageUrl.endsWith('.mp4') || 
             selectedUserStories.stories[currentStoryIndex].imageUrl.endsWith('.mov') || 
             selectedUserStories.stories[currentStoryIndex].imageUrl.includes('/video/') ? (
              <video
                src={selectedUserStories.stories[currentStoryIndex].imageUrl}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                onEnded={nextStory}
                onClick={nextStory}
              />
            ) : (
              <img 
                src={selectedUserStories.stories[currentStoryIndex].imageUrl} 
                alt="Story"
                className="w-full h-full object-contain"
                onClick={nextStory}
              />
            )}

            {/* Navegação Manual */}
            <div className="absolute inset-y-0 left-0 w-1/4" onClick={() => setCurrentStoryIndex(prev => Math.max(0, prev - 1))} />
            <div className="absolute inset-y-0 right-0 w-1/4" onClick={nextStory} />
          </div>
        </div>
      )}
    </div>
  )
}
