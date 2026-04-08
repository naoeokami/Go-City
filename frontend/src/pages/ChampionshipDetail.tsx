// src/pages/ChampionshipDetail.tsx
import { useParams, Link }  from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Calendar, MapPin, Users, Trophy,
  ArrowLeft, Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR }   from 'date-fns/locale'
import toast      from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { championshipService } from '../services/championship.service'

export function ChampionshipDetailPage() {
  const { id }    = useParams<{ id: string }>()

  const { data: championship, isLoading } = useQuery({
    queryKey: ['championship', id],
    queryFn:  () => championshipService.getById(id!),
  })

  const registerMutation = useMutation({
    mutationFn: () => championshipService.register(id!),
    onSuccess: () => toast.success('Inscrição realizada com sucesso! ✅'),
    onError: (err: any) =>
      toast.error(err.response?.data?.error || 'Erro ao se inscrever'),
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-200 rounded-xl" />
        <div className="card h-40" />
      </div>
    )
  }

  if (!championship) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Campeonato não encontrado</p>
        <Link to="/championships" className="text-blue-600 text-sm mt-2 block">
          Voltar para campeonatos
        </Link>
      </div>
    )
  }

  const c = championship
  const deadlineDate  = new Date(c.registrationDeadline)
  const isDeadlinePast = deadlineDate < new Date()
  const canRegister   = c.status === 'OPEN' && !isDeadlinePast

  return (
    <div className="max-w-2xl mx-auto">

      {/* Voltar */}
      <Link
        to="/championships"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700
                   text-sm mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para campeonatos
      </Link>

      {/* Banner */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600
                      rounded-xl mb-6 flex items-center justify-center overflow-hidden">
        {c.imageUrl ? (
          <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
        ) : (
          <Trophy className="w-20 h-20 text-white opacity-30" />
        )}
      </div>

      {/* Info Principal */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="bg-blue-100 text-blue-700 text-xs
                           font-medium px-2 py-0.5 rounded-full">
            {c.sport}
          </span>
          <span className="bg-gray-100 text-gray-600 text-xs
                           px-2 py-0.5 rounded-full">
            {c.format}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{c.title}</h1>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {c.description}
        </p>

        {/* Grid de infos */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Início
            </div>
            <p className="font-semibold text-sm text-gray-800">
              {format(new Date(c.startDate), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Término
            </div>
            <p className="font-semibold text-sm text-gray-800">
              {format(new Date(c.endDate), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
              <MapPin className="w-3.5 h-3.5" />
              Local
            </div>
            <p className="font-semibold text-sm text-gray-800">
              {c.city}, {c.state}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
              <Users className="w-3.5 h-3.5" />
              Inscritos
            </div>
            <p className="font-semibold text-sm text-gray-800">
              {c._count.registrations}
              {c.maxParticipants ? ` / ${c.maxParticipants}` : ''}
            </p>
          </div>
        </div>

        {/* Prazo e inscrição */}
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
          isDeadlinePast
            ? 'bg-red-50 text-red-600'
            : 'bg-yellow-50 text-yellow-700'
        }`}>
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            {isDeadlinePast
              ? 'Prazo de inscrição encerrado'
              : `Inscrições até ${format(deadlineDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
            }
          </span>
        </div>

        {/* Botão de inscrição */}
        {canRegister && (
          <Button
            className="w-full"
            size="lg"
            onClick={() => registerMutation.mutate()}
            loading={registerMutation.isPending}
          >
            <Trophy className="w-4 h-4" />
            {c.registrationFee === 0
              ? 'Inscrever-se gratuitamente'
              : `Inscrever-se por R$ ${c.registrationFee.toFixed(2)}`
            }
          </Button>
        )}

        {!canRegister && c.status === 'ONGOING' && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm text-center">
            🔵 Este campeonato já está em andamento
          </div>
        )}

        {!canRegister && c.status === 'FINISHED' && (
          <div className="bg-purple-50 text-purple-700 p-3 rounded-lg text-sm text-center">
            🏁 Este campeonato foi finalizado
          </div>
        )}
      </div>

      {/* Organizador */}
      <div className="card mb-4">
        <h2 className="font-bold text-gray-800 mb-3">Organizado por</h2>
        <Link
          to={`/profile/${c.organizer.username}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={c.organizer.avatarUrl}
            name={c.organizer.name}
            size="md"
          />
          <div>
            <p className="font-semibold text-sm">{c.organizer.name}</p>
            <p className="text-gray-500 text-xs">@{c.organizer.username}</p>
          </div>
        </Link>
      </div>

      {/* Regras */}
      {c.rules && (
        <div className="card mb-4">
          <h2 className="font-bold text-gray-800 mb-3">📋 Regulamento</h2>
          <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
            {c.rules}
          </p>
        </div>
      )}

      {/* Premiação */}
      {c.prizes && (
        <div className="card mb-4">
          <h2 className="font-bold text-gray-800 mb-3">🥇 Premiação</h2>
          <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
            {c.prizes}
          </p>
        </div>
      )}

      {/* Resultados */}
      {c.results && c.results.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">📊 Resultados</h2>
          <div className="space-y-3">
            {c.results.map(result => (
              <div
                key={result.id}
                className="bg-gray-50 rounded-lg p-3"
              >
                <p className="text-xs text-gray-500 mb-2">{result.phase}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{result.team1}</span>
                  <span className="font-bold text-lg mx-3">
                    {result.score1} × {result.score2}
                  </span>
                  <span className="font-semibold text-sm">{result.team2}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}