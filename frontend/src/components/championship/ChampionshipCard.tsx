// src/components/championship/ChampionshipCard.tsx
import { Link }    from 'react-router-dom'
import { Calendar, MapPin, Users, Trophy, ChevronRight } from 'lucide-react'
import { format }  from 'date-fns'
import { ptBR }    from 'date-fns/locale'
import type { Championship } from '../../types'

const statusThemes: any = {
  DRAFT:     { bg: 'bg-gray-50', text: 'text-gray-500', label: 'Rascunho' },
  OPEN:      { bg: 'bg-green-50', text: 'text-green-600', label: 'Inscrições Abertas' },
  ONGOING:   { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Em Andamento' },
  FINISHED:  { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Finalizado' },
}

interface Props {
  championship: Championship
}

export function ChampionshipCard({ championship: c }: Props) {
  const theme = statusThemes[c.status] || statusThemes.DRAFT

  return (
    <Link to={`/championships/${c.id}`} className="group block">
      <div className="card !p-0 overflow-hidden border-none shadow-sm group-hover:shadow-xl group-hover:shadow-blue-100/50 dark:group-hover:shadow-none transition-all duration-300 group-hover:-translate-y-1 bg-white dark:bg-navy-800/80">
        
        {/* Banner com Overlay */}
        <div className="relative h-44 overflow-hidden">
          {c.imageUrl ? (
            <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white/20" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute top-4 left-4">
             <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md shadow-sm border border-white/20 ${theme.bg} ${theme.text}`}>
                {theme.label}
             </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
             <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">{c.sport}</p>
             <h3 className="text-lg font-black text-white leading-tight line-clamp-1">{c.title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
           {/* Grid Infos */}
           <div className="grid grid-cols-2 gap-y-3">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-gray-50 dark:bg-navy-700 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                 </div>
                 <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    {format(new Date(c.startDate), "dd MMM", { locale: ptBR })}
                 </span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-gray-50 dark:bg-navy-700 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                 </div>
                 <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">
                    {c.city}
                 </span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-gray-50 dark:bg-navy-700 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                 </div>
                 <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    {c._count.registrations}/{c.maxParticipants || '∞'}
                 </span>
              </div>
              <div className="flex justify-end items-center">
                 <span className={`text-sm font-black ${c.registrationFee === 0 ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                    {c.registrationFee === 0 ? 'GRÁTIS' : `R$ ${c.registrationFee.toFixed(0)}`}
                 </span>
              </div>
           </div>

           <div className="pt-4 border-t border-gray-50 dark:border-navy-700 flex items-center justify-between group-hover/btn:text-blue-600">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ver Detalhes</span>
              <div className="p-1 bg-gray-50 dark:bg-navy-700 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <ChevronRight className="w-4 h-4" />
              </div>
           </div>
        </div>
      </div>
    </Link>
  )
}