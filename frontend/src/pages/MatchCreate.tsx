// src/pages/MatchCreate.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Sword, Calendar, MapPin, Trophy, Users, User, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { matchService } from '../services/match.service'
import { Button } from '../components/ui/Button'
import { TeamSearchSelector } from '../components/team/TeamSearchSelector'
import { UserSearchSelector } from '../components/ui/UserSearchSelector'

export function MatchCreatePage() {
  const navigate = useNavigate()
  const [matchType, setMatchType] = useState<'TEAM' | 'INDIVIDUAL'>('TEAM')
  const isOfficial = false
  const [sport, setSport] = useState('Futebol')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  
  // Side 1
  const [team1Id, setTeam1Id] = useState('')
  const [side1UserIds, setSide1UserIds] = useState<string[]>([])
  
  // Side 2
  const [team2Id, setTeam2Id] = useState('')
  const [side2UserIds, setSide2UserIds] = useState<string[]>([])
  
  const [score1, setScore1] = useState(0)
  const [score2, setScore2] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [isWalkover, setIsWalkover] = useState(false)
  const [winnerId, setWinnerId] = useState('')

  const createMatchMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        date: new Date(date).toISOString(),
        location,
        isOfficial,
        status: isFinished ? 'FINISHED' : 'SCHEDULED'
      }

      if (matchType === 'TEAM') {
        payload.team1Id = team1Id
        payload.team2Id = team2Id
      } else {
        payload.side1UserIds = side1UserIds
        payload.side2UserIds = side2UserIds
      }

      const match = await matchService.create(payload)

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
      navigate('/feed')
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
    if (matchType === 'TEAM') {
      if (!team1Id || !team2Id) return toast.error('Selecione os dois times')
      if (team1Id === team2Id) return toast.error('Os times devem ser diferentes')
    } else {
      if (side1UserIds.length === 0 || side2UserIds.length === 0) return toast.error('Selecione atletas para ambos os lados')
    }
    if (!date) return toast.error('Selecione a data')
    
    createMatchMutation.mutate()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shadow-lg shadow-orange-100/20">
          <Sword className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Registrar Partida Casual</h1>
          <p className="text-gray-500 text-sm font-medium">Lançamento de resultados de amistosos e jogos rápidos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Partida */}
        <div className="grid grid-cols-1 gap-4">
          <div className="card !p-2 bg-white flex gap-1">
             <button 
               type="button"
               onClick={() => { setMatchType('TEAM'); setTeam1Id(''); setTeam2Id('') }}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 matchType === 'TEAM' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-gray-400 hover:bg-gray-50'
               }`}
             >
                <Users className="w-3 h-3" /> Times
             </button>
             <button 
               type="button"
               onClick={() => { setMatchType('INDIVIDUAL'); setSide1UserIds([]); setSide2UserIds([]) }}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 matchType === 'INDIVIDUAL' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-gray-400 hover:bg-gray-50'
               }`}
             >
                <User className="w-3 h-3" /> Individual (Mix)
             </button>
          </div>
          
          <div className="card !p-4 bg-orange-50/20 border-2 border-orange-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                   <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none mb-1">
                      Partida Amistosa (Não Oficial)
                   </p>
                   <p className="text-[9px] text-gray-400 font-bold">
                      Ganha metade dos pontos (50%) por participação e vitória.
                   </p>
                </div>
             </div>
             <div className="bg-orange-500 w-1.5 h-1.5 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="card !p-8 space-y-6 bg-white border-none shadow-sm">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Modalidade Esportiva</label>
            <div className="flex gap-2 flex-wrap">
              {sports.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSport(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                    sport === s
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                <Calendar className="w-3 h-3 inline mr-1.5 text-blue-500" /> Agendamento
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                <MapPin className="w-3 h-3 inline mr-1.5 text-blue-500" /> Local da Partida
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ex: Arena Beach"
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lado 1 */}
          <div className="card !p-6 space-y-4 bg-white border-none shadow-sm">
            {matchType === 'TEAM' ? (
              <TeamSearchSelector 
                label="Desafiante (Time 1)"
                sport={sport}
                onSelect={setTeam1Id}
              />
            ) : (
              <UserSearchSelector 
                label="Desafiante (Mistão 1)"
                multiple
                onSelect={setSide1UserIds}
                excludeIds={side2UserIds}
              />
            )}
            {isFinished && (
              <div className="pt-4 border-t border-gray-50 flex flex-col items-center">
                 <label className="text-[10px] font-black text-gray-300 uppercase mb-2">Pontuação</label>
                 <input
                    type="number"
                    value={score1}
                    onChange={e => setScore1(parseInt(e.target.value))}
                    className="w-24 h-16 bg-gray-50 border-none rounded-2xl text-center text-3xl font-black text-gray-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                 />
              </div>
            )}
          </div>

          {/* Lado 2 */}
          <div className="card !p-6 space-y-4 bg-white border-none shadow-sm">
            {matchType === 'TEAM' ? (
              <TeamSearchSelector 
                label="Oponente (Time 2)"
                sport={sport}
                onSelect={setTeam2Id}
              />
            ) : (
              <UserSearchSelector 
                label="Oponente (Mistão 2)"
                multiple
                onSelect={setSide2UserIds}
                excludeIds={side1UserIds}
              />
            )}
            {isFinished && (
              <div className="pt-4 border-t border-gray-50 flex flex-col items-center">
                 <label className="text-[10px] font-black text-gray-300 uppercase mb-2">Pontuação</label>
                 <input
                    type="number"
                    value={score2}
                    onChange={e => setScore2(parseInt(e.target.value))}
                    className="w-24 h-16 bg-gray-50 border-none rounded-2xl text-center text-3xl font-black text-gray-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                 />
              </div>
            )}
          </div>
        </div>

        <div className="card !p-8 space-y-6 bg-white border-none shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFinished"
                checked={isFinished}
                onChange={e => setIsFinished(e.target.checked)}
                className="w-5 h-5 rounded-lg text-orange-600 border-orange-200 outline-none"
              />
              <label htmlFor="isFinished" className="text-sm font-black text-orange-900 cursor-pointer select-none">
                Lançar resultado da partida agora
              </label>
            </div>
          </div>

          {isFinished && (
            <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center gap-3">
                 <input
                   type="checkbox"
                   id="isWalkover"
                   checked={isWalkover}
                   onChange={e => setIsWalkover(e.target.checked)}
                   className="w-5 h-5 rounded-lg text-red-600 border-red-200"
                 />
                 <label htmlFor="isWalkover" className="text-sm font-black text-red-900 cursor-pointer">
                   Declarar vitória por W.O.
                 </label>
               </div>

              {isWalkover && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Selecione o vencedor do W.O.</label>
                  <select
                    value={winnerId}
                    onChange={e => setWinnerId(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20"
                    required={isWalkover}
                  >
                    <option value="">Selecionar...</option>
                    {matchType === 'TEAM' ? (
                       <>
                          <option value={team1Id}>Time 1</option>
                          <option value={team2Id}>Time 2</option>
                       </>
                    ) : (
                       <>
                          <option value="side1">Lado 1 (Mistão 1)</option>
                          <option value="side2">Lado 2 (Mistão 2)</option>
                       </>
                    )}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-16 rounded-[2rem] text-base font-black border-none shadow-2xl bg-orange-500 hover:bg-orange-600 shadow-orange-200"
          loading={createMatchMutation.isPending}
        >
          {isFinished ? (
             <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Finalizar e Contabilizar Pontos
             </div>
          ) : 'Agendar Partida'}
        </Button>
      </form>
    </div>
  )
}
