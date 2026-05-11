// src/components/feed/MatchHighlightCard.tsx
import { Trophy, Shield, Swords, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR }   from 'date-fns/locale'
import { Avatar } from '../ui/Avatar'

interface MatchHighlightCardProps {
  activity: any
}

export function MatchHighlightCard({ activity }: MatchHighlightCardProps) {
  const { match } = activity
  
  if (!match) return null;
  const p1 = match.team1 || match.player1
  const p2 = match.team2 || match.player2
  const name1 = p1?.name || '---'
  const name2 = p2?.name || '---'
  const logo1 = p1?.logoUrl || p1?.avatarUrl
  const logo2 = p2?.logoUrl || p2?.avatarUrl

  return (
    <div className="card !p-0 overflow-hidden mb-6 border-2 border-blue-50 dark:border-navy-700 bg-gradient-to-b from-white to-blue-50/20 dark:from-navy-800 dark:to-navy-900/50 shadow-xl shadow-blue-100/20 dark:shadow-none animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header com context do campeonato se houver */}
      <div className="bg-blue-600 dark:bg-navy-800 dark:border-b dark:border-navy-700 p-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
           <Trophy className="w-4 h-4 text-orange-400" />
           <span className="text-[10px] font-black uppercase tracking-widest italic">Destaque da Partida</span>
        </div>
        <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest">
           {match.championship?.title || 'Partida Amistosa'}
        </span>
      </div>

      <div className="p-8">
        <div className="flex items-center justify-center gap-8 md:gap-12 relative">
          {/* Luz de destaque no fundo */}
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />

          {/* Player 1 */}
          <div className="flex flex-col items-center gap-3 z-10 w-24 md:w-32">
             <div className="relative group">
                <div className="absolute inset-0 bg-blue-200 dark:bg-blue-500/20 rounded-full blur group-hover:blur-md transition-all -z-10" />
                <Avatar src={logo1} name={name1} size="lg" className="ring-4 ring-white dark:ring-navy-800 shadow-xl" />
             </div>
             <p className="text-xs font-black text-gray-900 dark:text-gray-100 text-center uppercase tracking-tighter truncate w-full">{name1}</p>
          </div>

          {/* VS & Scores */}
          <div className="flex flex-col items-center gap-2 z-10">
             <div className="flex items-center gap-4">
                <span className="text-4xl md:text-5xl font-black text-blue-600 italic tracking-tighter drop-shadow-sm">{match.score1}</span>
                <div className="flex flex-col items-center opacity-30">
                   <Swords className="w-4 h-4 text-gray-400" />
                   <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent" />
                </div>
                <span className="text-4xl md:text-5xl font-black text-blue-600 italic tracking-tighter drop-shadow-sm">{match.score2}</span>
             </div>
             <div className="bg-blue-100/50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/20">
                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Encerrada</span>
             </div>
          </div>

          {/* Player 2 */}
          <div className="flex flex-col items-center gap-3 z-10 w-24 md:w-32">
             <div className="relative group">
                <div className="absolute inset-0 bg-blue-200 dark:bg-blue-500/20 rounded-full blur group-hover:blur-md transition-all -z-10" />
                <Avatar src={logo2} name={name2} size="lg" className="ring-4 ring-white dark:ring-navy-800 shadow-xl" />
             </div>
             <p className="text-xs font-black text-gray-900 dark:text-gray-100 text-center uppercase tracking-tighter truncate w-full">{name2}</p>
          </div>
        </div>
      </div>

      {/* Footer informacional */}
      <div className="p-4 bg-white/60 dark:bg-navy-800/60 border-t border-blue-50 dark:border-navy-700 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 grayscale opacity-60">
               <Shield className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
               <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{match.isOfficial ? 'Oficial' : 'Amistosa'}</span>
            </div>
            {match.phase && (
               <div className="flex items-center gap-1.5 opacity-60">
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{match.phase}</span>
               </div>
            )}
         </div>
         <div className="flex items-center gap-1.5 opacity-40">
            <Calendar className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{format(new Date(match.date), "dd/MM/yyyy", { locale: ptBR })}</span>
         </div>
      </div>
    </div>
  )
}
