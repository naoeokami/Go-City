// src/pages/ChampionshipDetail.tsx
import { useState } from 'react'
import { useParams, Link }  from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar, MapPin, Users, Trophy,
  ArrowLeft, Clock, Plus, Shield
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR }   from 'date-fns/locale'
import toast      from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { useAuthStore } from '../store/useAuthStore'
import { championshipService } from '../services/championship.service'
import { matchService } from '../services/match.service'
import { teamService } from '../services/team.service'

export function ChampionshipDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { user }  = useAuthStore()
  const [activeTab, setActiveTab] = useState<'info' | 'matches'>('info')
  const [showAddMatch, setShowAddMatch] = useState(false)
  const [matchForm, setMatchForm] = useState({
    team1Id: '', team2Id: '', date: '', phase: 'Rodada 1'
  })

  const { data: championship, isLoading } = useQuery({
    queryKey: ['championship', id],
    queryFn:  () => championshipService.getById(id!),
  })

  const { data: myTeams } = useQuery({
    queryKey: ['my-teams-simple'],
    queryFn: () => teamService.list(),
    enabled: !!user
  })

  const [regType, setRegType] = useState<'INDIVIDUAL' | 'TEAM'>('INDIVIDUAL')
  const [selectedTeamId, setSelectedTeamId] = useState('')

  const registerMutation = useMutation({
    mutationFn: () => championshipService.register(id!, {
      teamId: regType === 'TEAM' ? selectedTeamId : undefined
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['championship', id] })
      toast.success('Inscrição realizada com sucesso! ✅')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error || 'Erro ao se inscrever'),
  })

  const addMatchMutation = useMutation({
    mutationFn: () => matchService.create({ ...matchForm, championshipId: id! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['championship', id] })
      setShowAddMatch(false)
      toast.success('Partida adicionada!')
    },
    onError: () => toast.error('Erro ao adicionar partida')
  })

  const isOrganizer = user?.id === championship?.organizerId

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

      {/* Banner e Tabs */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600
                      rounded-xl mb-6 flex items-center justify-center overflow-hidden">
        {c.imageUrl ? (
          <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
        ) : (
          <Trophy className="w-20 h-20 text-white opacity-30" />
        )}
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-2 text-sm font-medium transition-all ${activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Informações
        </button>
        <button 
          onClick={() => setActiveTab('matches')}
          className={`pb-3 px-2 text-sm font-medium transition-all ${activeTab === 'matches' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Partidas ({c.matches?.length || 0})
        </button>
      </div>

      {activeTab === 'info' ? (
        <>
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

        {/* Seletor de Tipo de Inscrição */}
        {canRegister && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
            <h3 className="font-bold text-sm text-gray-700 mb-3">Como deseja se inscrever?</h3>
            <div className="flex gap-2 mb-4">
              <button
                full-width="true"
                onClick={() => setRegType('INDIVIDUAL')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${regType === 'INDIVIDUAL' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                Individual
              </button>
              <button
                full-width="true"
                onClick={() => setRegType('TEAM')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${regType === 'TEAM' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                Como Time
              </button>
            </div>

            {regType === 'TEAM' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Selecione seu Time</label>
                {myTeams?.length === 0 ? (
                  <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">Você não tem nenhum time criado. Crie um time primeiro na aba "Times".</p>
                ) : (
                  <select
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={selectedTeamId}
                    onChange={e => setSelectedTeamId(e.target.value)}
                  >
                    <option value="">Selecione um time...</option>
                    {myTeams?.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botão de inscrição */}
        {canRegister && (
          <Button
            className="w-full"
            size="lg"
            onClick={() => registerMutation.mutate()}
            loading={registerMutation.isPending}
            disabled={regType === 'TEAM' && !selectedTeamId}
          >
            <Trophy className="w-4 h-4" />
            {regType === 'INDIVIDUAL' 
              ? (c.registrationFee === 0 ? 'Inscrever-se Gratuitamente' : `Pagar R$ ${c.registrationFee.toFixed(2)} e Entrar`)
              : 'Inscrever Time no Torneio'
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

          <div className="card mb-4 bg-orange-50 border-orange-100">
            <h2 className="font-bold text-orange-800 mb-3 text-sm uppercase tracking-wider">⚙️ Gerenciamento</h2>
            <div className="flex flex-col gap-2">
              {c.status === 'OPEN' && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  onClick={() => {
                    if (confirm('Deseja gerar o chaveamento automático do torneio? isso mudará o status para EM ANDAMENTO.')) {
                      championshipService.generate(c.id)
                        .then(() => {
                          toast.success('Chaveamento gerado com sucesso!')
                          queryClient.invalidateQueries({ queryKey: ['championship', id] })
                        })
                        .catch(err => toast.error(err.response?.data?.error || 'Erro ao gerar chaveamento'))
                    }
                  }}
                >
                  <Users className="w-4 h-4" />
                  Gerar Chaveamento (Sorteio)
                </Button>
              )}
              {c.status === 'ONGOING' && (
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white w-full"
                  onClick={() => {
                    const championId = prompt('ID do Time Campeão:')
                    const runnerUpId = prompt('ID do Time Vice-Campeão:')
                    if (championId) {
                      championshipService.finish(c.id, { championId, runnerUpId })
                        .then(() => {
                          toast.success('Campeonato finalizado e pontos atribuídos!')
                          queryClient.invalidateQueries({ queryKey: ['championship', id] })
                        })
                    }
                  }}
                >
                  Finalizar e Atribuir Pontos
                </Button>
              )}
              {c.status === 'DRAFT' && (
                <Button 
                  className="w-full"
                  onClick={() => championshipService.updateStatus(c.id, 'OPEN')
                    .then(() => queryClient.invalidateQueries({ queryKey: ['championship', id] }))
                  }
                >
                  Abrir Inscrições
                </Button>
              )}
            </div>
          </div>

          {/* Organizador */}
          <div className="card mb-4">
            <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Organizado por</h2>
            <Link to={`/profile/${c.organizer.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar src={c.organizer.avatarUrl} name={c.organizer.name} size="md" />
              <div>
                <p className="font-semibold text-sm">{c.organizer.name}</p>
                <p className="text-gray-500 text-xs">@{c.organizer.username}</p>
              </div>
            </Link>
          </div>

          {/* Regras e Premiação */}
          {(c.rules || c.prizes) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {c.rules && (
                <div className="card">
                  <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">📋 Regulamento</h2>
                  <p className="text-gray-600 text-xs whitespace-pre-wrap leading-relaxed">{c.rules}</p>
                </div>
              )}
              {c.prizes && (
                <div className="card">
                  <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">🥇 Premiação</h2>
                  <p className="text-gray-600 text-xs whitespace-pre-wrap leading-relaxed">{c.prizes}</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {isOrganizer && (
            <div className="card border-dashed bg-gray-50 flex flex-col items-center py-6">
              {/* {championship.organizerId === user?.id && (
            <Button onClick={() => setShowMatchModal(true)}>
              <Trophy className="w-4 h-4 mr-2" />
              Criar Partida
            </Button>
          )} */}
              {!showAddMatch ? (
                <Button variant="outline" onClick={() => setShowAddMatch(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Gerar Nova Partida
                </Button>
              ) : (
                <div className="w-full space-y-4">
                  <h3 className="font-bold text-center">Nova Partida</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="datetime-local" 
                      className="border rounded-lg p-2 text-sm"
                      value={matchForm.date}
                      onChange={e => setMatchForm(f => ({ ...f, date: e.target.value }))}
                    />
                    <input 
                      type="text" 
                      placeholder="Fase (ex: Final)"
                      className="border rounded-lg p-2 text-sm"
                      value={matchForm.phase}
                      onChange={e => setMatchForm(f => ({ ...f, phase: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => addMatchMutation.mutate()}>Salvar</Button>
                    <Button variant="outline" onClick={() => setShowAddMatch(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {c.matches?.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Nenhuma partida agendada.</p>
          ) : (
            c.matches?.map(match => (
              <div key={match.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {match.phase}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {format(new Date(match.date), "dd MMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-xs font-bold text-center truncate w-full px-1">
                      {match.team1?.name || 'A definir'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-4">
                      {isOrganizer && match.status !== 'FINISHED' ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="w-12 border rounded p-1 text-center font-bold"
                            defaultValue={match.score1}
                            onBlur={(e) => {
                              const score1 = parseInt(e.target.value)
                              matchService.updateScore(match.id, { score1 })
                                .then(() => toast.success('Placar atualizado'))
                            }}
                          />
                          <span className="text-gray-300">×</span>
                          <input 
                            type="number" 
                            className="w-12 border rounded p-1 text-center font-bold"
                            defaultValue={match.score2}
                            onBlur={(e) => {
                              const score2 = parseInt(e.target.value)
                              matchService.updateScore(match.id, { score2 })
                                .then(() => toast.success('Placar atualizado'))
                            }}
                          />
                        </div>
                      ) : (
                        <>
                          <span className="text-2xl font-black text-gray-900">{match.score1}</span>
                          <span className="text-gray-300 font-light">×</span>
                          <span className="text-2xl font-black text-gray-900">{match.score2}</span>
                        </>
                      )}
                    </div>
                    {isOrganizer && match.status !== 'FINISHED' && (
                      <button 
                        onClick={() => {
                          if (confirm('Finalizar partida e atribuir pontos?')) {
                            matchService.updateScore(match.id, { status: 'FINISHED' })
                              .then(() => {
                                toast.success('Partida finalizada!')
                                queryClient.invalidateQueries({ queryKey: ['championship', id] })
                              })
                          }
                        }}
                        className="text-[10px] text-blue-600 font-bold mt-2 hover:underline"
                      >
                        Finalizar Partida
                      </button>
                    )}
                    {match.status === 'LIVE' && (
                      <span className="text-[10px] text-red-500 animate-pulse font-bold mt-1">● AO VIVO</span>
                    )}
                  </div>


                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-xs font-bold text-center truncate w-full px-1">
                      {match.team2?.name || 'A definir'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}