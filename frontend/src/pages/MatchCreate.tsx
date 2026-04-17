// src/pages/MatchCreate.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Sword, Trophy, Calendar, MapPin, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { teamService } from '../services/team.service'
import { matchService } from '../services/match.service'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'

export function MatchCreatePage() {
  const navigate = useNavigate()
  const [sport, setSport] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [team1Id, setTeam1Id] = useState('')
  const [team2Id, setTeam2Id] = useState('')
  const [score1, setScore1] = useState(0)
  const [score2, setScore2] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [isWalkover, setIsWalkover] = useState(false)
  const [winnerId, setWinnerId] = useState('')

  const { data: teams } = useQuery({
    queryKey: ['teams', sport],
    queryFn: () => teamService.list(sport),
    enabled: sport.length > 0
  })

  const createMatchMutation = useMutation({
    mutationFn: async () => {
      const match = await matchService.create({
        team1Id,
        team2Id,
        date: new Date(date).toISOString(),
        location,
        status: isFinished ? 'FINISHED' : 'SCHEDULED'
      })

      if (isFinished) {
        await matchService.updateScore(match.id, {
          score1,
          score2,
          status: 'FINISHED',
          isWalkover,
          winnerId: winnerId || undefined
        })
      }

      return match
    },
    onSuccess: () => {
      toast.success('Partida registrada com sucesso!')
      navigate('/ranking')
    },
    onError: () => {
      toast.error('Erro ao registrar partida')
    }
  })

  const sports = [
    'Futebol', 'Basquete', 'Vôlei', 'Tênis',
    'Futsal', 'Handebol', 'Beach Tennis', 'Padel'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!team1Id || !team2Id) return toast.error('Selecione os dois times')
    if (team1Id === team2Id) return toast.error('Os times devem ser diferentes')
    if (!date) return toast.error('Selecione a data')
    
    createMatchMutation.mutate()
  }

  const selectedTeam1 = teams?.find(t => t.id === team1Id)
  const selectedTeam2 = teams?.find(t => t.id === team2Id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Sword className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Nova Partida</h1>
          <p className="text-gray-500 text-sm">Crie uma partida e acumule pontos no ranking.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Esporte</label>
            <div className="flex gap-2 flex-wrap">
              {sports.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSport(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    sport === s
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" /> Data e Hora
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" /> Local
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ex: Arena Go City"
                className="input text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time 1 */}
          <div className="card text-center space-y-4">
            <h3 className="font-semibold text-gray-900">Time 1</h3>
            <div className="relative">
              <select
                value={team1Id}
                onChange={e => setTeam1Id(e.target.value)}
                className="input text-sm opacity-0 absolute inset-0 cursor-pointer z-10"
                required
              >
                <option value="">Selecionar Time</option>
                {teams?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 bg-gray-50">
                <Avatar src={selectedTeam1?.logoUrl} name={selectedTeam1?.name || '?'} size="lg" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedTeam1?.name || 'Clique para selecionar'}
                </span>
              </div>
            </div>
            {isFinished && (
              <input
                type="number"
                value={score1}
                onChange={e => setScore1(parseInt(e.target.value))}
                className="input text-center text-2xl font-bold w-20 mx-auto"
              />
            )}
          </div>

          {/* Time 2 */}
          <div className="card text-center space-y-4">
            <h3 className="font-semibold text-gray-900">Time 2</h3>
            <div className="relative">
              <select
                value={team2Id}
                onChange={e => setTeam2Id(e.target.value)}
                className="input text-sm opacity-0 absolute inset-0 cursor-pointer z-10"
                required
              >
                <option value="">Selecionar Time</option>
                {teams?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 bg-gray-50">
                <Avatar src={selectedTeam2?.logoUrl} name={selectedTeam2?.name || '?'} size="lg" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedTeam2?.name || 'Clique para selecionar'}
                </span>
              </div>
            </div>
            {isFinished && (
              <input
                type="number"
                value={score2}
                onChange={e => setScore2(parseInt(e.target.value))}
                className="input text-center text-2xl font-bold w-20 mx-auto"
              />
            )}
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFinished"
                checked={isFinished}
                onChange={e => setIsFinished(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <label htmlFor="isFinished" className="text-sm font-medium text-gray-700">
                Partida já realizada (Lançar resultado)
              </label>
            </div>
          </div>

          {isFinished && (
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isWalkover"
                  checked={isWalkover}
                  onChange={e => setIsWalkover(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600"
                />
                <label htmlFor="isWalkover" className="text-sm font-medium text-red-700">
                  W.O. (Uma das equipes não compareceu)
                </label>
              </div>

              {isWalkover && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencedor por W.O.</label>
                  <select
                    value={winnerId}
                    onChange={e => setWinnerId(e.target.value)}
                    className="input text-sm"
                    required={isWalkover}
                  >
                    <option value="">Selecionar Vencedor</option>
                    {selectedTeam1 && <option value={selectedTeam1.id}>{selectedTeam1.name}</option>}
                    {selectedTeam2 && <option value={selectedTeam2.id}>{selectedTeam2.name}</option>}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={createMatchMutation.isPending}
          disabled={!sport || !team1Id || !team2Id || !date}
        >
          {isFinished ? 'Registrar Resultado e Ganhar Pontos' : 'Agendar Partida'}
        </Button>
      </form>
    </div>
  )
}
