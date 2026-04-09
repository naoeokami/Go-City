// src/components/ui/VideoModal.tsx
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-[110]"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-10">
        {/* Fundo desfocado para preencher tela */}
        <div 
          className="absolute inset-0 opacity-30 blur-3xl pointer-events-none"
          style={{ backgroundImage: `url(${videoUrl})`, backgroundSize: 'cover' }}
        />
        
        <video
          src={videoUrl}
          className="max-w-full max-h-full rounded-lg shadow-2xl relative z-index-10"
          controls
          autoPlay
          playsInline
        />
      </div>
    </div>
  )
}
