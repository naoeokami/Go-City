// src/pages/Ranking.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/user.service'
import { Trophy, Medal, Award, TrendingUp, Filter, Target, Crown } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export function RankingPage() {
  const [sport, setSport] = useState<string>('')
  const [category, setCategory] = useState<string>('')

  const { data: ranking, isLoading } = useQuery({
    queryKey: ['ranking', sport, category],
    queryFn: () => userService.getRanking(sport, category)
  })

  const sports = [
    { id: '', label: 'Todos' },
    { id: 'Futebol', label: 'Futebol' },
    { id: 'Basquete', label: 'Basquete' },
    { id: 'Vôlei', label: 'Vôlei' },
    { id: 'Tênis', label: 'Tênis' },
    { id: 'Futsal', label: 'Futsal' },
  ]

  const categories = [
    { id: '', label: 'Geral' },
    { id: 'CASUAL', label: 'Casual' },
    { id: 'COMPETITIVE', label: 'Competitivo' },
  ]

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return (
        <div className="relative">
          <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
          <Crown className="w-4 h-4 text-yellow-300 absolute -top-2 -right-1 rotate-12" />
        </div>
      )
      case 1: return <Medal className="w-7 h-7 text-gray-400 drop-shadow-[0_0_8px_rgba(156,163,175,0.5)]" />
      case 2: return <Award className="w-7 h-7 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
      default: return <span className="font-black text-gray-400 dark:text-gray-500 text-lg">#{index + 1}</span>
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-indigo-800 to-navy-900 p-10 text-white shadow-2xl">
        <div className="relative z-10 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest"
          >
            <Target className="w-3.5 h-3.5 text-blue-300" />
            Hall da Fama Go City
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight"
          >
            Ranking de Atletas
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100/80 max-w-lg text-lg font-medium leading-relaxed"
          >
            Acompanhe a elite do esporte urbano. Ganhe partidas, conquiste títulos e suba no ranking global.
          </motion.p>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute right-[-5%] top-[-10%] opacity-10 rotate-12 select-none pointer-events-none">
          <Trophy className="w-96 h-96" />
        </div>
        <div className="absolute left-[-2%] bottom-[-5%] w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card !p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest px-2">
            <Filter className="w-3 h-3" /> Filtrar por Modalidade
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sports.map(s => (
              <button
                key={s.id}
                onClick={() => setSport(s.id)}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  sport === s.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none scale-105' 
                  : 'bg-gray-100 dark:bg-navy-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-navy-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card !p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest px-2">
            <Award className="w-3 h-3" /> Nível de Competição
          </div>
          <div className="flex gap-2">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex-1 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  category === c.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105' 
                  : 'bg-gray-100 dark:bg-navy-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-navy-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking List */}
      <div className="relative">
        <div className="bg-white/40 dark:bg-navy-800/40 backdrop-blur-xl border border-white/20 dark:border-navy-700/30 rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="flex items-center px-8 py-5 bg-gray-50/50 dark:bg-navy-900/50 border-b border-gray-100 dark:border-navy-700/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <div className="w-16 text-center">Posição</div>
            <div className="flex-1 px-4 text-left">Atleta</div>
            <div className="w-24 text-right">Pontuação</div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-navy-700/50">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center px-8 py-6 animate-pulse">
                    <div className="w-16 flex justify-center">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-navy-700 rounded-full" />
                    </div>
                    <div className="flex-1 px-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-navy-700 rounded-full" />
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-gray-200 dark:bg-navy-700 rounded" />
                        <div className="w-20 h-3 bg-gray-100 dark:bg-navy-800 rounded" />
                      </div>
                    </div>
                    <div className="w-24 flex justify-end">
                      <div className="w-16 h-8 bg-gray-200 dark:bg-navy-700 rounded-full" />
                    </div>
                  </div>
                ))
              ) : ranking && ranking.length > 0 ? (
                ranking.map((user, index) => (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/profile/${user.username}`}
                      className="flex items-center px-8 py-6 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                    >
                      <div className="w-16 flex justify-center items-center">
                        {getRankBadge(index)}
                      </div>
                      
                      <div className="flex-1 px-4 flex items-center gap-5">
                        <div className="relative group-hover:scale-110 transition-transform duration-300">
                          <Avatar src={user.avatarUrl} name={user.name} size="lg" className="ring-2 ring-transparent group-hover:ring-blue-500/30" />
                          {index < 3 && (
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-navy-800 flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                            }`}>
                              <TrendingUp className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {user.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                            <span>@{user.username}</span>
                            {user.city && (
                              <>
                                <span className="text-gray-300 dark:text-navy-600">|</span>
                                <span className="text-blue-500/80">{user.city}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-24 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                            {user.score.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Pontos
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="p-20 text-center space-y-4">
                  <div className="text-6xl grayscale opacity-50">🏟️</div>
                  <div>
                    <p className="text-xl font-black text-gray-800 dark:text-gray-200">Nenhum atleta encontrado</p>
                    <p className="text-sm text-gray-400 font-bold">Tente mudar os filtros para encontrar outros competidores.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
