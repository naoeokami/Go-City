import { useState, useEffect } from 'react'
import { useParams, Link }  from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar, MapPin, Users, Trophy,
  ArrowLeft, Clock, Shield, Info, Swords, ShieldCheck
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR }   from 'date-fns/locale'
import toast      from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { TeamSearchSelector } from '../components/team/TeamSearchSelector'
import { useAuthStore } from '../store/useAuthStore'
import { championshipService } from '../services/championship.service'

import { socket } from '../services/socket'

export function ChampionshipDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { user }  = useAuthStore()
  const [activeTab, setActiveTab] = useState<'info' | 'matches' | 'management' | 'registrations'>('info')
  const [regType, setRegType] = useState<'INDIVIDUAL' | 'TEAM'>('INDIVIDUAL')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [isTeamLeader, setIsTeamLeader] = useState(false)

  const { data: championship, isLoading } = useQuery({
    queryKey: ['championship', id],
    queryFn:  () => championshipService.getById(id!),
  })

  useEffect(() => {
    if (!id) return
    socket.connect()
    socket.emit('join-championship', id)
    socket.on('match-updated', () => {
      toast.success(`Placar atualizado ao vivo!`)
      queryClient.invalidateQueries({ queryKey: ['championship', id] })
    })
    return () => {
      socket.off('match-updated')
      socket.disconnect()
    }
  }, [id, queryClient])

  const registerMutation = useMutation({
    mutationFn: () => championshipService.register(id!, {
      teamId: regType === 'TEAM' ? selectedTeamId : undefined
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['championship', id] })
      toast.success('Inscrição realizada com sucesso! ✅')
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) =>
      toast.error(err.response?.data?.error || 'Erro ao se inscrever'),
  })

  const requestRegistrationMutation = useMutation({
    mutationFn: () => championshipService.requestRegistration(id!, selectedTeamId),
    onSuccess: () => {
      toast.success('Solicitação enviada ao líder com sucesso! 📩')
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) =>
      toast.error(err.response?.data?.error || 'Erro ao enviar solicitação'),
  })

  const isOrganizer = user?.id === championship?.organizerId

  if (isLoading) return <div className="p-20 text-center">Carregando campeonato...</div>
  if (!championship) return <div className="p-20 text-center">Não encontrado</div>
  const c = championship

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
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
              <span className="bg-blue-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">{c.sport}</span>
              <span className="bg-orange-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">{c.format}</span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm ${c.status === 'OPEN' ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>{c.status}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">{c.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        <div className="lg:col-span-8 space-y-8 min-w-0">
          <div className="flex gap-2 p-1.5 bg-gray-100/50 dark:bg-navy-800/50 rounded-2xl w-full md:w-fit overflow-hidden">
            {[
              { id: 'info', label: 'Sobre', icon: Info },
              { id: 'matches', label: 'Partidas', icon: Swords },
              { id: 'registrations', label: 'Participantes', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === tab.id ? 'bg-white dark:bg-navy-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div className="card !p-8 bg-white dark:bg-navy-800 border-none shadow-sm text-left animate-in fade-in duration-500">
               <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Sobre o Torneio</h3>
               <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{c.description || 'Sem descrição.'}</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-navy-900 rounded-2xl">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Local</p>
                     <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> {c.location}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-navy-900 rounded-2xl">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inscrição</p>
                     <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><Trophy className="w-4 h-4 text-orange-500" /> {c.registrationFee === 0 ? 'Grátis' : `R$ ${c.registrationFee.toFixed(2)}`}</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-4 animate-in fade-in duration-500">
               {c.matches?.length === 0 ? (
                 <div className="py-20 text-center card bg-white dark:bg-navy-800 border-none">
                    <p className="text-gray-400 font-black uppercase tracking-widest">Partidas ainda não geradas</p>
                 </div>
               ) : (
                 c.matches?.map(m => (
                    <div key={m.id} className="card !p-4 sm:!p-6 bg-white dark:bg-navy-800 border-none shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                       <div className="w-full sm:flex-1 text-center sm:text-right sm:pr-6 font-black text-sm text-gray-900 dark:text-white">{m.team1?.name || m.player1?.name || '---'}</div>
                       <div className="flex items-center gap-4 bg-gray-50 dark:bg-navy-900 px-6 py-2 rounded-2xl border border-gray-100 dark:border-navy-700">
                          <span className="text-xl font-black text-gray-900 dark:text-white">{m.score1}</span>
                          <span className="text-gray-300 font-bold">vs</span>
                          <span className="text-xl font-black text-gray-900 dark:text-white">{m.score2}</span>
                       </div>
                       <div className="w-full sm:flex-1 text-center sm:text-left sm:pl-6 font-black text-sm text-gray-900 dark:text-white">{m.team2?.name || m.player2?.name || '---'}</div>
                    </div>
                 ))
               )}
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-500">
               {c.registrations?.map(reg => (
                 <div key={reg.id} className="card !p-4 flex items-center gap-3 bg-white dark:bg-navy-800 border-none shadow-sm text-left">
                    <Avatar src={reg.user?.avatarUrl} name={reg.user?.name || 'U'} size="sm" />
                    <div>
                       <p className="font-black text-sm text-gray-900 dark:text-white leading-none mb-1">{reg.teamName || reg.user?.name || '---'}</p>
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">@{reg.user?.username || '---'}</p>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* O painel admin agora está fixo na barra lateral para o organizador */}
        </div>

        <div className="lg:col-span-4 space-y-6 text-left">
          {isOrganizer && (
            <div className="bg-blue-600 !p-6 rounded-[2rem] shadow-xl shadow-blue-500/20 mb-6 text-white overflow-hidden relative group animate-in slide-in-from-right duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-20 h-20" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter mb-1">Painel do Organizador</h3>
              <p className="text-xs text-blue-100 mb-4 font-medium">Você tem acesso total às ferramentas de gestão deste campeonato.</p>
              <Link 
                to={`/championships/${c.id}/admin`}
                className="bg-white text-blue-600 w-full py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
              >
                Gerenciar Torneio
              </Link>
            </div>
          )}
          {c.status === 'OPEN' && !isOrganizer && (
            <div className="bg-white dark:bg-navy-800 !p-8 rounded-[2rem] border-none shadow-2xl shadow-blue-200/20 dark:shadow-none animate-in bounce-in duration-500">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Inscreva-se</h3>
              <div className="space-y-6">
                <div className="flex gap-2 p-1 bg-gray-50 dark:bg-navy-900 rounded-2xl">
                  <button onClick={() => setRegType('INDIVIDUAL')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${regType === 'INDIVIDUAL' ? 'bg-white dark:bg-navy-800 text-blue-600 dark:text-blue-400 shadow-md' : 'text-gray-400 dark:text-gray-500'}`}>Solo</button>
                  <button onClick={() => setRegType('TEAM')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${regType === 'TEAM' ? 'bg-white dark:bg-navy-800 text-blue-600 dark:text-blue-400 shadow-md' : 'text-gray-400 dark:text-gray-500'}`}>Time</button>
                </div>
                {regType === 'TEAM' && <TeamSearchSelector myTeams={true} sport={c.sport} onSelect={(teamId, isLeader) => { setSelectedTeamId(teamId); setIsTeamLeader(!!isLeader); }} label="Sua Equipe" />}
                <Button 
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-base font-black rounded-2xl" 
                  onClick={() => {
                    if (regType === 'TEAM' && !isTeamLeader) {
                      requestRegistrationMutation.mutate()
                    } else {
                      registerMutation.mutate()
                    }
                  }} 
                  loading={registerMutation.isPending || requestRegistrationMutation.isPending} 
                  disabled={regType === 'TEAM' && !selectedTeamId}
                >
                  {regType === 'TEAM' && !isTeamLeader ? 'Solicitar Inscrição ao Líder' : 'Entrar no Torneio'}
                </Button>
              </div>
            </div>
          )}

          <div className="card !p-6 bg-white dark:bg-navy-800 border-none shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Organização</h3>
            <Link to={`/profile/${c.organizer.username}`} className="flex items-center gap-3">
              <Avatar src={c.organizer.avatarUrl} name={c.organizer.name} size="md" />
              <div>
                <p className="font-black text-sm text-gray-900 dark:text-white">{c.organizer.name}</p>
                <p className="text-[10px] text-gray-500">@{c.organizer.username}</p>
              </div>
            </Link>
          </div>

          <div className="card !p-6 bg-white dark:bg-navy-800 border-none shadow-sm">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Datas</h3>
             <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <Calendar className="w-4 h-4 text-blue-500" />
                   <p className="text-xs font-bold text-gray-900 dark:text-white">{format(new Date(c.startDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
                <div className="flex items-center gap-3">
                   <Clock className="w-4 h-4 text-red-500" />
                   <p className="text-xs font-bold text-gray-900 dark:text-white">Deadline: {format(new Date(c.registrationDeadline), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}