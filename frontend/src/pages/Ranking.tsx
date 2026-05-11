// src/pages/Ranking.tsx
import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/user.service'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { Link } from 'react-router-dom'

export function RankingPage() {
  const { data: ranking, isLoading } = useQuery({
    queryKey: ['ranking'],
    queryFn: () => userService.getRanking()
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-500" />
      case 1: return <Medal className="w-6 h-6 text-gray-400" />
      case 2: return <Award className="w-6 h-6 text-orange-400" />
      default: return <span className="font-bold text-gray-500">{index + 1}º</span>
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            Ranking Geral
          </h1>
          <p className="text-blue-100 opacity-90 max-w-md">
            Os atletas com maior pontuação na plataforma com base em suas vitórias e participações em campeonatos.
          </p>
        </div>
        <Trophy className="absolute right-[-20px] top-[-20px] w-64 h-64 text-white/10 rotate-12" />
      </div>

      <div className="card divide-y divide-gray-100 dark:divide-navy-700 shadow-sm overflow-x-auto">
        <div className="min-w-[400px]">
          <div className="flex items-center px-6 py-4 bg-gray-50 dark:bg-navy-900 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="w-12 text-center">Posição</div>
          <div className="flex-1 px-4">Atleta</div>
          <div className="w-24 text-right">Score</div>
        </div>

        {ranking?.map((user, index) => (
          <Link
            key={user.id}
            to={`/profile/${user.username}`}
            className="flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors group"
          >
            <div className="w-12 flex justify-center items-center">
              {getRankBadge(index)}
            </div>
            
            <div className="flex-1 px-4 flex items-center gap-4">
              <Avatar src={user.avatarUrl} name={user.name} size="md" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {user.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>@{user.username}</span>
                  {user.city && (
                    <>
                      <span>•</span>
                      <span>{user.city}, {user.state}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="w-24 text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                {user.score.toLocaleString()}
              </span>
            </div>
          </Link>
        ))}

        {!ranking?.length && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            Nenhum atleta ranqueado no momento.
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
