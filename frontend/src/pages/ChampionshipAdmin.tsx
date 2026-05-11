import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Trophy, Users, Settings, BarChart2, 
  Swords, Plus, 
  Trash2, Check, X, LayoutGrid, 
  History, ShieldCheck
} from 'lucide-react'
import { championshipService } from '../services/championship.service'
import { matchService } from '../services/match.service'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'

import toast from 'react-hot-toast'
import { format } from 'date-fns'


type AdminTab = 'overview' | 'registrations' | 'groups' | 'brackets' | 'results' | 'stats'

export function ChampionshipAdminPage() {
    const { id } = useParams<{ id: string }>()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<AdminTab>('overview')
    const [participantsPerGroup, setParticipantsPerGroup] = useState(4)
    const [advancePerGroup, setAdvancePerGroup] = useState(2)


    const { data: championship, isLoading } = useQuery({
        queryKey: ['championship-admin', id],
        queryFn: () => championshipService.getById(id!)
    })

    const { data: standings } = useQuery({
        queryKey: ['championship-standings', id],
        queryFn: () => championshipService.getStandings(id!),
        enabled: activeTab === 'groups'
    })

    const generateGroupsMutation = useMutation({
        mutationFn: (params: { participantsPerGroup: number, advancePerGroup: number }) => championshipService.generateGroups(id!, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['championship-admin', id] })
            queryClient.invalidateQueries({ queryKey: ['championship-standings', id] })
            toast.success('Grupos gerados com sucesso! 🏆')
        }
    })

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => championshipService.updateStatus(id!, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['championship-admin', id] })
            toast.success(`Status atualizado para ${data.status}!`)
        }
    })

    const generateBracketsMutation = useMutation({
        mutationFn: () => championshipService.generateBrackets(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['championship-admin', id] })
            toast.success('Chaves de mata-mata geradas! ⚔️')
        }
    })

    const updateRegStatusMutation = useMutation({
        mutationFn: ({ regId, status }: { regId: string, status: 'APPROVED' | 'REJECTED' }) => 
            championshipService.updateRegistrationStatus(regId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['championship-admin', id] })
            toast.success('Status da inscrição atualizado!')
        }
    })

    const deleteRegMutation = useMutation({
        mutationFn: (regId: string) => championshipService.deleteRegistration(regId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['championship-admin', id] })
            toast.success('Inscrição removida')
        }
    })

    const updateMatchMutation = useMutation({
        mutationFn: ({ matchId, score1, score2, status }: { matchId: string, score1: number, score2: number, status?: 'SCHEDULED' | 'FINISHED' }) =>
            matchService.updateScore(matchId, { score1, score2, status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['championship-admin', id] })
            toast.success('Placar atualizado!')
        }
    })

    const updateMatchScore = (matchId: string, score1: number, score2: number, status: 'SCHEDULED' | 'FINISHED' = 'SCHEDULED') => {
        updateMatchMutation.mutate({ matchId, score1, score2, status })
    }

    if (isLoading) return <div className="p-8 text-center">Carregando painel de controle...</div>
    if (!championship) return <div className="p-8 text-center">Campeonato não encontrado</div>

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-navy-900 text-gray-900 dark:text-white flex flex-col">
            {/* Admin Header */}
            <header className="bg-white dark:bg-navy-800 border-b border-gray-100 dark:border-navy-700 px-8 py-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link to={`/championships/${id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-xl transition-colors">
                        <Trophy className="w-6 h-6 text-blue-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">
                            {championship.title}
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Settings className="w-3 h-3" /> Painel de Gerenciamento Profissional
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                        {championship.status}
                    </span>
                    <Link 
                        to={`/championships/${id}`}
                        className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Ver como Usuário
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 shrink-0 bg-white dark:bg-navy-800 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-navy-700 p-4 lg:p-6 flex flex-row lg:flex-col gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap z-10">
                    {[
                        { id: 'overview',      label: 'Visão Geral',    icon: LayoutGrid },
                        { id: 'registrations', label: 'Inscrições',     icon: Users },
                        { id: 'groups',        label: 'Fase de Grupos', icon: BarChart2 },
                        { id: 'brackets',      label: 'Mata-Mata',      icon: Trophy },
                        { id: 'results',       label: 'Lançar Placares', icon: Swords },
                        { id: 'stats',         label: 'Estatísticas',   icon: History }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AdminTab)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 ${
                                activeTab === tab.id 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-navy-700'
                            }`}
                        >
                            <tab.icon className={`w-5 h-5 shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Main View Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                                <div className="card !p-6 bg-white dark:bg-navy-800 border-none shadow-sm flex flex-col items-center text-center">
                                    <Users className="w-8 h-8 text-blue-500 mb-2" />
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">{championship.registrations?.length || 0}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inscritos</p>
                                </div>
                                <div className="card !p-6 bg-white dark:bg-navy-800 border-none shadow-sm flex flex-col items-center text-center">
                                    <Swords className="w-8 h-8 text-orange-500 mb-2" />
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">{championship.matches?.length || 0}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partidas</p>
                                </div>
                                <div className="card !p-6 bg-white dark:bg-navy-800 border-none shadow-sm flex flex-col items-center text-center">
                                    <ShieldCheck className="w-8 h-8 text-green-500 mb-2" />
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {championship.registrations?.filter(r => r.status === 'APPROVED').length || 0}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aprovados</p>
                                </div>
                                <div className="card !p-6 bg-white dark:bg-navy-800 border-none shadow-sm flex flex-col items-center text-center">
                                    <History className="w-8 h-8 text-purple-500 mb-2" />
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {championship.matches?.filter(m => m.status === 'FINISHED').length || 0}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Concluídas</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                                <div className="card !p-8 bg-white dark:bg-navy-800 border-none shadow-sm">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Informações Rápidas</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-navy-700">
                                            <span className="text-xs font-bold text-gray-500">Esporte</span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white">{championship.sport}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-navy-700">
                                            <span className="text-xs font-bold text-gray-500">Formato</span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white">{championship.format}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-navy-700">
                                            <span className="text-xs font-bold text-gray-500">Localização</span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white">{championship.location}, {championship.city}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card !p-8 bg-white dark:bg-navy-800 border-none shadow-sm">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Ações de Status</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Button 
                                            className="bg-green-600 hover:bg-green-700 h-12 text-[10px] font-black uppercase"
                                            onClick={() => updateStatusMutation.mutate('OPEN')}
                                            loading={updateStatusMutation.isPending}
                                        >
                                            Abrir Inscrições
                                        </Button>
                                        <Button 
                                            className="bg-red-600 hover:bg-red-700 h-12 text-[10px] font-black uppercase"
                                            onClick={() => updateStatusMutation.mutate('CLOSED')}
                                            loading={updateStatusMutation.isPending}
                                        >
                                            Fechar Inscrições
                                        </Button>
                                        <Button 
                                            className="bg-orange-600 hover:bg-orange-700 h-12 text-[10px] font-black uppercase"
                                            onClick={() => updateStatusMutation.mutate('ONGOING')}
                                            loading={updateStatusMutation.isPending}
                                        >
                                            Iniciar Torneio
                                        </Button>
                                        <Button 
                                            className="bg-gray-800 hover:bg-black h-12 text-[10px] font-black uppercase"
                                            onClick={() => updateStatusMutation.mutate('FINISHED')}
                                            loading={updateStatusMutation.isPending}
                                        >
                                            Finalizar Tudo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'registrations' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Gerenciar Inscritos</h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Aprove ou recuse participantes</p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {championship.registrations?.map(reg => (
                                    <div key={reg.id} className="card !p-6 bg-white dark:bg-navy-800 border-none shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <Avatar src={reg.user?.avatarUrl} name={reg.user?.name || 'U'} size="md" />
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white">{reg.teamName || reg.user?.name || '---'}</p>
                                                <p className="text-xs text-gray-500 font-bold">@{reg.user?.username || '---'} • {format(new Date(reg.createdAt), 'dd/MM/yyyy')}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {reg.status === 'PENDING' ? (
                                                <>
                                                    <button 
                                                        onClick={() => updateRegStatusMutation.mutate({ regId: reg.id, status: 'APPROVED' })}
                                                        className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => updateRegStatusMutation.mutate({ regId: reg.id, status: 'REJECTED' })}
                                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                        reg.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {reg.status}
                                                    </span>
                                                    <button 
                                                        onClick={() => deleteRegMutation.mutate(reg.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Fase de Grupos</h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Gerencie chaves e classificações</p>
                                </div>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Times p/ grupo:</label>
                                        <input type="number" min="2" value={participantsPerGroup} onChange={e => setParticipantsPerGroup(Number(e.target.value))} className="w-14 h-10 bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl text-center font-black text-sm outline-none focus:border-blue-500 transition-colors" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Classificam:</label>
                                        <input type="number" min="1" value={advancePerGroup} onChange={e => setAdvancePerGroup(Number(e.target.value))} className="w-14 h-10 bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl text-center font-black text-sm outline-none focus:border-blue-500 transition-colors" />
                                    </div>
                                    <Button 
                                        className="bg-blue-600 hover:bg-blue-700 px-6 h-10 rounded-xl font-black uppercase text-[10px] tracking-widest"
                                        onClick={() => generateGroupsMutation.mutate({ participantsPerGroup, advancePerGroup })}
                                        loading={generateGroupsMutation.isPending}
                                    >
                                        Gerar Grupos
                                    </Button>
                                </div>
                            </div>

                            {standings?.length === 0 ? (
                                <div className="py-20 text-center card bg-white dark:bg-navy-800 border-dashed dark:border-navy-700">
                                    <BarChart2 className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-400 font-black uppercase tracking-widest">Nenhum grupo gerado ainda</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {standings?.map(group => (
                                        <div key={group.id} className="card !p-0 bg-white dark:bg-navy-800 border-none shadow-sm overflow-hidden">
                                            <div className="bg-gray-50 dark:bg-navy-900 px-6 py-4 border-b border-gray-100 dark:border-navy-700 flex justify-between items-center">
                                                <h3 className="font-black text-blue-600 uppercase tracking-widest text-xs">{group.name}</h3>
                                                <span className="text-[10px] font-bold text-gray-400">{group.table.length} Equipes</span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-navy-700">
                                                            <th className="px-6 py-4">#</th>
                                                            <th className="px-6 py-4">Equipe</th>
                                                            <th className="px-6 py-4 text-center">P</th>
                                                            <th className="px-6 py-4 text-center">J</th>
                                                            <th className="px-6 py-4 text-center">V</th>
                                                            <th className="px-6 py-4 text-center">SG</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {group.table.map((row: { id: string, name: string, points: number, played: number, won: number, goalDifference: number }, idx: number) => (
                                                            <tr key={row.id} className="border-b border-gray-50/50 dark:border-navy-700 hover:bg-gray-50/30 dark:hover:bg-navy-700 transition-colors">
                                                                <td className="px-6 py-4 text-xs font-black text-gray-400">{idx + 1}</td>
                                                                <td className="px-6 py-4 text-xs font-bold text-gray-900 dark:text-white">{row.name}</td>
                                                                <td className="px-6 py-4 text-center text-xs font-black text-blue-600">{row.points}</td>
                                                                <td className="px-6 py-4 text-center text-xs font-bold text-gray-500">{row.played}</td>
                                                                <td className="px-6 py-4 text-center text-xs font-bold text-green-600">{row.won}</td>
                                                                <td className="px-6 py-4 text-center text-xs font-bold text-gray-500">{row.goalDifference}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'brackets' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Mata-Mata</h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Chaveamento eliminatório</p>
                                </div>
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700 px-8 rounded-2xl font-black uppercase text-xs"
                                    onClick={() => generateBracketsMutation.mutate()}
                                    loading={generateBracketsMutation.isPending}
                                >
                                    Gerar Chaves Automáticas
                                </Button>
                            </div>

                            {championship.matches?.filter(m => m.phase !== 'GROUP').length === 0 ? (
                                <div className="py-20 text-center card bg-white dark:bg-navy-800 border-dashed dark:border-navy-700">
                                    <Trophy className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-400 font-black uppercase tracking-widest">Nenhuma chave gerada ainda</p>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {/* Exibir chaves aqui ou um aviso que estão no modo usuário */}
                                    <div className="p-12 text-center bg-white dark:bg-navy-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-navy-700">
                                        <p className="text-gray-400 font-bold mb-4">As chaves interativas estão disponíveis na página pública</p>
                                        <Link to={`/championships/${id}`} className="text-blue-600 font-black uppercase text-xs hover:underline">Ver Chaveamento Completo</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'results' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                             <div className="flex justify-between items-center">
                                 <div>
                                     <h2 className="text-2xl font-black text-gray-900 dark:text-white">Lançamento de Resultados</h2>
                                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Controle total sobre as partidas do torneio</p>
                                 </div>
                                 <Link 
                                     to={`/matches/create?championshipId=${id}&isOfficial=true`}
                                     className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
                                 >
                                     <Plus className="w-4 h-4" /> Nova Partida
                                 </Link>
                            </div>

                            <div className="grid gap-4">
                                {championship.matches?.map(match => (
                                    <div key={match.id} className="card !p-6 bg-white dark:bg-navy-800 border-none shadow-sm flex flex-col gap-6 group">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg uppercase tracking-widest">
                                                    {match.phase}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {format(new Date(match.date), "dd/MM/yyyy HH:mm'h'")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {match.status === 'FINISHED' ? (
                                                    <span className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1">
                                                        <Check className="w-3 h-3" /> Encerrada
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => updateMatchScore(match.id, match.score1, match.score2, 'FINISHED')}
                                                        className="text-[10px] font-black text-orange-600 hover:text-orange-900 uppercase border border-orange-200 px-3 py-1.5 rounded-xl transition-all"
                                                    >
                                                        Finalizar Partida
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:grid sm:grid-cols-11 items-center gap-4">
                                            <div className="w-full sm:col-span-4 flex flex-col items-center sm:items-end gap-2 text-center sm:text-right">
                                                <p className="font-black text-sm text-gray-900 dark:text-white">{match.team1?.name || match.player1?.name || '---'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Mandante</p>
                                            </div>

                                            <div className="w-full sm:col-span-3 flex items-center justify-center gap-4">
                                                <input 
                                                    type="number" 
                                                    className="w-14 h-14 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 dark:text-white rounded-[1.25rem] text-center font-black text-2xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-navy-800 transition-all shadow-inner"
                                                    defaultValue={match.score1}
                                                    onChange={e => updateMatchScore(match.id, parseInt(e.target.value), match.score2)}
                                                />
                                                <span className="text-gray-300 font-black">X</span>
                                                <input 
                                                    type="number" 
                                                    className="w-14 h-14 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 dark:text-white rounded-[1.25rem] text-center font-black text-2xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-navy-800 transition-all shadow-inner"
                                                    defaultValue={match.score2}
                                                    onChange={e => updateMatchScore(match.id, match.score1, parseInt(e.target.value))}
                                                />
                                            </div>

                                            <div className="w-full sm:col-span-4 flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
                                                <p className="font-black text-sm text-gray-900 dark:text-white">{match.team2?.name || match.player2?.name || '---'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Visitante</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'stats' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Estatísticas e Liderança</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Desempenho técnico do campeonato</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="card bg-white dark:bg-navy-800 border-none shadow-sm">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-yellow-500" /> Melhores Ataques
                                    </h3>
                                    <div className="space-y-4">
                                        {standings?.flatMap(g => g.table)
                                            .sort((a, b) => b.goalsFor - a.goalsFor)
                                            .slice(0, 5)
                                            .map((team, idx) => (
                                                <div key={team.id} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-navy-700 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-gray-300">#{idx + 1}</span>
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{team.name}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-blue-600">{team.goalsFor} Gols</span>
                                                </div>
                                            ))}
                                        {(!standings || standings.length === 0) && (
                                            <p className="text-xs text-gray-400 text-center py-8">Aguardando geração de grupos</p>
                                        )}
                                    </div>
                                </div>

                                <div className="card bg-white dark:bg-navy-800 border-none shadow-sm">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-500" /> Melhores Defesas
                                    </h3>
                                    <div className="space-y-4">
                                        {standings?.flatMap(g => g.table)
                                            .sort((a, b) => a.goalsAgainst - b.goalsAgainst)
                                            .slice(0, 5)
                                            .map((team, idx) => (
                                                <div key={team.id} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-navy-700 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-gray-300">#{idx + 1}</span>
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{team.name}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-green-600">{team.goalsAgainst} Gols</span>
                                                </div>
                                            ))}
                                        {(!standings || standings.length === 0) && (
                                            <p className="text-xs text-gray-400 text-center py-8">Aguardando geração de grupos</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
