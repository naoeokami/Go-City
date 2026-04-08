// src/pages/Championships.tsx
import { useState }            from 'react'
import { useQuery }            from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Link }                from 'react-router-dom'
import { ChampionshipCard }    from '../components/championship/ChampionshipCard'
import { Button }              from '../components/ui/Button'
import { useAuthStore }        from '../store/useAuthStore'
import { championshipService } from '../services/championship.service'

const SPORTS = ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Natação', 'Futsal']

const STATUS_OPTIONS = [
  { value: '',         label: 'Todos' },
  { value: 'OPEN',     label: '🟢 Inscrições abertas' },
  { value: 'ONGOING',  label: '🔵 Em andamento' },
  { value: 'FINISHED', label: '🏁 Finalizados' },
]

export function ChampionshipsPage() {
  const { user }               = useAuthStore()
  const [sport, setSport]      = useState('')
  const [status, setStatus]    = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['championships', sport, status],
    queryFn:  () => championshipService.list({
      sport:  sport  || undefined,
      status: status || undefined,
    }),
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏆 Campeonatos</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Encontre e inscreva-se em campeonatos esportivos
          </p>
        </div>

        {user?.userType === 'ORGANIZER' && (
          <Link to="/championships/create">
            <Button>
              <Plus className="w-4 h-4" />
              Criar Campeonato
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros por status */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium
                        transition-colors border ${
              status === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-600 hover:border-blue-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filtros por esporte */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSport('')}
          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
            sport === ''
              ? 'bg-gray-800 text-white border-gray-800'
              : 'border-gray-300 text-gray-500 hover:border-gray-500'
          }`}
        >
          Todos os esportes
        </button>
        {SPORTS.map(s => (
          <button
            key={s}
            onClick={() => setSport(sport === s ? '' : s)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              sport === s
                ? 'bg-gray-800 text-white border-gray-800'
                : 'border-gray-300 text-gray-500 hover:border-gray-500'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grid de campeonatos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse h-64" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="font-semibold text-gray-700">
            Nenhum campeonato encontrado
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tente mudar os filtros de busca
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.data.map(c => (
            <ChampionshipCard key={c.id} championship={c} />
          ))}
        </div>
      )}
    </div>
  )
}