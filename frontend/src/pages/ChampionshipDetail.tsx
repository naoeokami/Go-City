// src/pages/ChampionshipDetail.tsx
import { useState } from 'react'
import { useParams, Link }  from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar, MapPin, Users, Trophy,
  ArrowLeft, Clock, Plus, Shield, Info, Swords, Box, UserPlus
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR }   from 'date-fns/locale'
import toast      from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { TeamSearchSelector } from '../components/team/TeamSearchSelector'
import { useAuthStore } from '../store/useAuthStore'
import { championshipService } from '../services/championship.service'
import { matchService } from '../services/match.service'

export function ChampionshipDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { user }  = useAuthStore()
  const [activeTab, setActiveTab] = useState<'info' | 'matches' | 'management' | 'registrations'>('info')
  const [mgmtTab, setMgmtTab] = useState<'setup' | 'brackets' | 'results'>('setup')
  const [showAddMatch, setShowAddMatch] = useState(false)
  const [matchForm, setMatchForm] = useState({
    team1Id: '', team2Id: '', date: '', phase: 'Rodada 1'
  })
  
  const { data: championship, isLoading } = useQuery({
    queryKey: ['championship', id],
    queryFn:  () => championshipService.getById(id!),
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

  const updateMatchScore = (matchId: string, data: any) => {
    matchService.updateScore(matchId, data).then(() => {
      queryClient.invalidateQueries({ queryKey: ['championship', id] })
    })
  }

  const isOrganizer = user?.id === championship?.organizerId

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-40 bg-gray-50 rounded-2xl animate-pulse" />
            <div className="h-80 bg-gray-50 rounded-2xl animate-pulse" />
          </div>
          <div className="h-60 bg-gray-50 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!championship) return null
  const c = championship

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      {/* Header & Cover */}
      <div className="relative mb-8 pt-4">
        <Link to="/championships" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-semibold transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Campeonatos
        </Link>

        <div className="relative h-64 md:h-80 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-200/50">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          {c.imageUrl ? (
            <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
              <Trophy className="w-24 h-24 text-white/20" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-left">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-blue-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                {c.sport}
              </span>
              <span className="bg-orange-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                {c.format}
              </span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm ${
                c.status === 'OPEN' ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
              }`}>
                {c.status}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">{c.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8 min-w-0">
          
          {/* Custom Tabs */}
          <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit overflow-x-auto no-scrollbar">
            {[
              { id: 'info', label: 'Sobre', icon: Info },
              { id: 'matches', label: 'Partidas', icon: Swords },
              { id: 'registrations', label: 'Participantes', icon: Users },
              ...(isOrganizer ? [{ id: 'management', label: 'Painel Admin', icon: Shield }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
              <div className="card !p-10">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-black text-gray-900">Detalhes do Evento</h2>
                   <div className="flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                         Inscrições até {format(new Date(c.registrationDeadline), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                   </div>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base font-medium">{c.description || 'Nenhuma descrição fornecida para este torneio.'}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-400 uppercase mb-2 tracking-widest">📋 Regulamento</p>
                    <p className="text-sm text-blue-900">{c.rules || 'Regras padrão da categoria.'}</p>
                  </div>
                  <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/50">
                    <p className="text-[10px] font-black text-purple-400 uppercase mb-2 tracking-widest">🥇 Premiação</p>
                    <p className="text-sm text-purple-900">{c.prizes || 'Troféu e medalhas especiais.'}</p>
                  </div>
                </div>
              </div>

              {/* Data & Local Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card !p-6 flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Início</p>
                  <p className="text-lg font-black text-gray-900">{format(new Date(c.startDate), "dd 'de' MMM", { locale: ptBR })}</p>
                </div>
                <div className="card !p-6 flex flex-col items-center text-center">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Localização</p>
                  <p className="text-sm font-black text-gray-900">{c.city}, {c.state}</p>
                </div>
                <div className="card !p-6 flex flex-col items-center text-center">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Atletas</p>
                  <p className="text-lg font-black text-gray-900">{c._count?.registrations || 0} / {c.maxParticipants || '∞'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {c.matches?.length === 0 ? (
                <div className="card py-20 text-center bg-gray-50/50 border-dashed">
                  <Swords className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">Gerando confrontos...</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">Em breve as partidas serão sorteadas e aparecerão aqui!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {(c?.matches || []).map(match => (
                    <div key={match.id} className="card !p-0 overflow-hidden group hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all border-none shadow-sm bg-white">
                      <div className="p-3 bg-gray-50/80 flex items-center justify-between border-b border-gray-100">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                           <Shield className="w-3 h-3" />
                           {match.phase}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {format(new Date(match.date), "dd/MM/yyyy · HH:mm'h'", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="p-8 grid grid-cols-11 items-center gap-4">
                        <div className="col-span-4 flex flex-col items-center text-center group/team">
                          <Avatar src={match.team1?.logoUrl} name={match.team1?.name || 'A DEFINIR'} size="lg" className="mb-3 ring-4 ring-gray-50 group-hover/team:ring-blue-100 transition-all" />
                          <p className="text-[13px] font-black text-gray-900 truncate w-full">{match.team1?.name || 'A DEFINIR'}</p>
                        </div>
                        <div className="col-span-3 flex flex-col items-center">
                          <div className="flex items-center gap-4">
                            <span className="text-4xl font-black text-gray-900 tracking-tighter">{match.score1}</span>
                            <span className="text-gray-200 font-light text-3xl">-</span>
                            <span className="text-4xl font-black text-gray-900 tracking-tighter">{match.score2}</span>
                          </div>
                          {match.status === 'LIVE' && (
                            <div className="mt-3 bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">AO VIVO</span>
                            </div>
                          )}
                          {match.status === 'FINISHED' && (
                            <span className="mt-3 text-[9px] font-black text-gray-300 uppercase tracking-tighter">Finalizado</span>
                          )}
                        </div>
                        <div className="col-span-4 flex flex-col items-center text-center group/team">
                          <Avatar src={match.team2?.logoUrl} name={match.team2?.name || 'A DEFINIR'} size="lg" className="mb-3 ring-4 ring-gray-50 group-hover/team:ring-blue-100 transition-all" />
                          <p className="text-[13px] font-black text-gray-900 truncate w-full">{match.team2?.name || 'A DEFINIR'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {c.registrations?.map((reg: any) => (
                     <div key={reg.id} className="card !p-4 flex items-center gap-3 bg-white">
                        <Avatar src={reg.team?.logoUrl || reg.user?.avatarUrl} name={reg.team?.name || reg.user?.name} size="sm" />
                        <div className="text-left">
                           <p className="text-sm font-bold text-gray-900">{reg.team?.name || reg.user?.name}</p>
                           <p className="text-[10px] text-gray-500 font-medium tracking-tighter italic">Confirmado em {format(new Date(reg.createdAt), "dd/MM/yy")}</p>
                        </div>
                     </div>
                  ))}
                  {c.registrations?.length === 0 && (
                     <p className="col-span-full text-center py-20 text-gray-400 font-bold">Nenhum inscrito ainda.</p>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'management' && isOrganizer && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
              <div className="bg-white rounded-[2.5rem] border-2 border-orange-100 shadow-xl shadow-orange-100/20 overflow-hidden">
                <div className="p-6 bg-orange-50 border-b-2 border-orange-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-200">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-orange-900">Gerenciamento</h2>
                      <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Painel do Organizador</p>
                    </div>
                  </div>
                </div>

                <div className="flex border-b border-orange-100 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'setup', label: 'Inscrições', icon: UserPlus },
                    { id: 'brackets', label: 'Sorteio', icon: Box },
                    { id: 'results', label: 'Resultados', icon: Swords }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setMgmtTab(tab.id as any)}
                      className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${
                        mgmtTab === tab.id ? 'bg-orange-600 text-white' : 'text-orange-900/40 hover:bg-orange-50/50'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {mgmtTab === 'setup' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                        <div>
                          <p className="text-sm font-black text-gray-900 mb-1">Status do Campeonato</p>
                          <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">Mude o status para controlar a visibilidade e inscrições.</p>
                        </div>
                        <select 
                          className="bg-white border-2 border-orange-200 text-orange-900 rounded-2xl px-6 py-3 font-black text-xs outline-none focus:ring-4 focus:ring-orange-100 transition-all appearance-none cursor-pointer"
                          value={c.status}
                          onChange={e => {
                            championshipService.updateStatus(c.id, e.target.value)
                              .then(() => {
                                 toast.success('Status atualizado!')
                                 queryClient.invalidateQueries({ queryKey: ['championship', id] })
                              })
                          }}
                        >
                          <option value="DRAFT">Rascunho</option>
                          <option value="OPEN">Inscrições Abertas</option>
                          <option value="ONGOING">Em Andamento</option>
                          <option value="FINISHED">Finalizado</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {mgmtTab === 'brackets' && (
                    <div className="space-y-6 text-center">
                      <div className="p-12 border-4 border-dashed border-gray-100 rounded-[3.5rem] bg-gray-50/30">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-gray-200/50 flex items-center justify-center mx-auto mb-6">
                           <Box className="w-10 h-10 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Gerar Confrontos</h3>
                        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto font-medium">
                          O sistema irá sortear automaticamente as partidas com base nos inscritos atuais.
                        </p>
                        
                        {c.status === 'OPEN' ? (
                          <Button 
                            className="bg-orange-600 hover:bg-orange-700 px-10 py-5 rounded-[1.5rem] h-auto text-sm font-black shadow-xl shadow-orange-200"
                            onClick={() => {
                              if (confirm('Gerar o sorteio agora? O status do torneio mudará para EM ANDAMENTO.')) {
                                championshipService.generate(c.id)
                                  .then(() => {
                                     toast.success('Sorteio realizado com sucesso!')
                                     queryClient.invalidateQueries({ queryKey: ['championship', id] })
                                     setActiveTab('matches')
                                  })
                              }
                            }}
                          >
                            Realizar Sorteio Aleatório
                          </Button>
                        ) : (
                          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 inline-block">
                             <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
                                Chaveamento já gerado ou inscrições fechadas.
                             </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {mgmtTab === 'results' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-6">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Painel de Resultados</p>
                        <button 
                          onClick={() => setShowAddMatch(!showAddMatch)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                        >
                          {showAddMatch ? 'Voltar' : 'Adicionar Partida Manual'}
                        </button>
                      </div>

                      {showAddMatch ? (
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4 animate-in slide-in-from-top-4">
                           <div className="grid grid-cols-2 gap-4">
                              <TeamSearchSelector label="Time 1" sport={c.sport} onSelect={id => setMatchForm(f => ({ ...f, team1Id: id }))} />
                              <TeamSearchSelector label="Time 2" sport={c.sport} onSelect={id => setMatchForm(f => ({ ...f, team2Id: id }))} />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Data/Hora</label>
                                 <input 
                                    type="datetime-local" 
                                    className="w-full bg-white border border-gray-100 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                                    onChange={e => setMatchForm(f => ({ ...f, date: e.target.value }))}
                                 />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Fase/Rodada</label>
                                 <input 
                                    type="text" 
                                    placeholder="Ex: Final"
                                    className="w-full bg-white border border-gray-100 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                                    onChange={e => setMatchForm(f => ({ ...f, phase: e.target.value }))}
                                 />
                              </div>
                           </div>
                           <Button 
                              className="w-full bg-orange-600 hover:bg-orange-700 h-12 rounded-xl text-xs font-black uppercase"
                              onClick={() => {
                                 matchService.create({ ...matchForm, championshipId: id! })
                                    .then(() => {
                                       toast.success('Partida adicionada!')
                                       queryClient.invalidateQueries({ queryKey: ['championship', id] })
                                       setShowAddMatch(false)
                                    })
                              }}
                           >
                              Confirmar Nova Partida
                           </Button>
                        </div>
                      ) : (
                        c.matches?.length === 0 ? (
                          <div className="py-12 text-center text-gray-400">
                             <p className="font-black text-sm uppercase tracking-widest mb-2">Sem partidas</p>
                             <p className="text-xs">Gere o chaveamento primeiro.</p>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                           {(c?.matches || []).filter(m => m.status !== 'FINISHED').map(m => (
                               <div key={m.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                 <div className="flex items-center justify-between mb-4">
                                    <span className="text-[9px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase tracking-tighter">{m.phase}</span>
                                    {m.status === 'FINISHED' && <span className="text-[9px] font-black text-green-600 uppercase">Encerrada</span>}
                                 </div>
                                 <div className="grid grid-cols-11 items-center gap-2">
                                   <div className="col-span-4 font-black text-[11px] text-gray-800 truncate">{m.team1?.name || '---'}</div>
                                   <div className="col-span-3 flex items-center justify-center gap-2">
                                     <input 
                                       type="number" 
                                       className="w-10 h-10 bg-gray-50 border-2 border-gray-100 rounded-xl text-center font-black text-sm outline-none focus:border-orange-500 transition-colors"
                                       defaultValue={m.score1}
                                       onBlur={e => updateMatchScore(m.id, { score1: parseInt(e.target.value) })}
                                     />
                                     <span className="text-gray-300 font-bold">vs</span>
                                     <input 
                                       type="number" 
                                       className="w-10 h-10 bg-gray-50 border-2 border-gray-100 rounded-xl text-center font-black text-sm outline-none focus:border-orange-500 transition-colors"
                                       defaultValue={m.score2}
                                       onBlur={e => updateMatchScore(m.id, { score2: parseInt(e.target.value) })}
                                     />
                                   </div>
                                   <div className="col-span-4 font-black text-[11px] text-gray-800 text-right truncate">{m.team2?.name || '---'}</div>
                                 </div>
                                 {m.status !== 'FINISHED' && (
                                   <div className="mt-4 flex justify-center border-t border-gray-50 pt-3">
                                     <button 
                                       onClick={() => {
                                          if (confirm('Deseja finalizar esta partida e atribuir os pontos?')) {
                                             matchService.updateScore(m.id, { status: 'FINISHED' })
                                                .then(() => {
                                                   toast.success('Partida encerrada!')
                                                   queryClient.invalidateQueries({ queryKey: ['championship', id] })
                                                })
                                          }
                                       }}
                                       className="text-[9px] font-black text-orange-600 uppercase hover:text-orange-900 flex items-center gap-1"
                                     >
                                        <Trophy className="w-3 h-3" />
                                        Finalizar e Atribuir Pontos
                                     </button>
                                   </div>
                                 )}
                               </div>
                             ))}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 text-left">
          {/* Registro Widget */}
          {c.status === 'OPEN' && !isOrganizer && (
            <div className="bg-white !p-8 rounded-[2rem] !border-4 !border-blue-600/10 shadow-2xl shadow-blue-200/40 animate-in bounce-in duration-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                 <Trophy className="w-20 h-20 text-blue-600" />
              </div>
              
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-none mb-1">Inscreva-se</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Garanta seu lugar</p>
                </div>
              </div>

              <div className="space-y-6 relative">
                <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
                  <button 
                    onClick={() => setRegType('INDIVIDUAL')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                      regType === 'INDIVIDUAL' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Eu Solo
                  </button>
                  <button 
                    onClick={() => setRegType('TEAM')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                      regType === 'TEAM' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Meu Time
                  </button>
                </div>

                {regType === 'TEAM' && (
                  <div className="animate-in slide-in-from-top-2">
                    <TeamSearchSelector 
                      sport={c.sport}
                      onSelect={setSelectedTeamId}
                      label="Selecione sua Equipe"
                    />
                  </div>
                )}

                <Button 
                  className="w-full !rounded-2xl h-16 bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-200 text-base font-black border-none"
                  onClick={() => registerMutation.mutate()}
                  loading={registerMutation.isPending}
                  disabled={regType === 'TEAM' && !selectedTeamId}
                >
                  Entrar no Torneio
                </Button>
                
                <div className="flex items-center justify-center gap-3 py-2 border-t border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Inscrição:</span>
                  <span className="text-sm font-black text-gray-900">
                    {c.registrationFee === 0 ? 'GRATUITA' : `R$ ${c.registrationFee.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Organizador Card */}
          <div className="card !p-6 !rounded-[2rem] bg-white border-none shadow-xl shadow-gray-200/50">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Organização</h3>
            <Link to={`/profile/${c.organizer.username}`} className="flex items-center gap-4 group p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
              <Avatar src={c.organizer.avatarUrl} name={c.organizer.name} size="md" className="ring-2 ring-white" />
              <div>
                <p className="font-black text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{c.organizer.name}</p>
                <div className="flex items-center gap-1.5 opacity-60">
                   <Shield className="w-3 h-3 text-blue-600" />
                   <p className="text-[10px] font-bold text-gray-500">@{c.organizer.username}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Calendário Resumo */}
          <div className="card !p-8 !rounded-[2rem] border-none shadow-lg shadow-gray-100 bg-white">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Checkpoints</h3>
             <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-tighter mb-1">Mata-mata / Inscrição</p>
                    <p className="text-sm font-black text-gray-800">{format(new Date(c.registrationDeadline), "dd/MM/yyyy · HH:mm'h'", { locale: ptBR })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-green-50 text-green-500 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-green-400 uppercase tracking-tighter mb-1">Início Real</p>
                    <p className="text-sm font-black text-gray-800">{format(new Date(c.startDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}