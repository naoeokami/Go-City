// src/pages/TeamDetail.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Shield, Plus, UserPlus, ArrowLeft, Trash2, Mail } from 'lucide-react'
import { teamService } from '../services/team.service'
import { userService } from '../services/user.service'
import { useAuthStore } from '../store/useAuthStore'
import { Avatar } from '../components/ui/Avatar'
import toast from 'react-hot-toast'
import { TeamChat } from '../components/team/TeamChat'

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [searchUsername, setSearchUsername] = useState('')

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamService.getById(id!),
    enabled: !!id
  })

  const inviteMutation = useMutation({
    mutationFn: (userId: string) => teamService.addMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] })
      setSearchUsername('')
      toast.success('Convite enviado!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao convidar')
    }
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => teamService.removeFromTeam(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] })
      toast.success('Membro removido')
    },
    onError: () => toast.error('Erro ao remover membro')
  })

  const { data: searchResults } = useQuery({
    queryKey: ['search-users', searchUsername],
    queryFn: () => userService.search(searchUsername),
    enabled: searchUsername.length > 2
  })

  if (isLoading) return <div className="p-8 text-center">Carregando time...</div>
  if (!team) return <div className="p-8 text-center">Time não encontrado.</div>

  const isCaptain = team.captainId === currentUser?.id

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button 
        onClick={() => navigate('/teams')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar para meus times
      </button>

      {/* Header do Time */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6 p-4">
          <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
            <Shield className="w-12 h-12" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-gray-500 mt-1">{team.sport} · Criado em {new Date(team.createdAt).toLocaleDateString()}</p>
            <div className="flex items-center gap-2 mt-4 justify-center md:justify-start">
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-100 uppercase">
                {team.members?.length || 0} Atletas
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Membros */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Elenco do Time
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {team.members?.map((member: any) => (
              <div key={member.id} className="card flex items-center justify-between hover:border-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar src={member.user.avatarUrl} name={member.user.name} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{member.user.name}</p>
                      {member.user.id === team.captainId && (
                        <span className="bg-yellow-50 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded font-bold border border-yellow-200 uppercase">
                          Capitão
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">@{member.user.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        member.status === 'ACCEPTED' ? 'bg-green-50 text-green-600 border-green-100' :
                        member.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        'bg-red-50 text-red-600 border-red-100'
                    }`}>
                        {member.status === 'ACCEPTED' ? 'Ativo' : member.status === 'PENDING' ? 'Pendente' : 'Recusado'}
                    </span>
                    {isCaptain && member.user.id !== currentUser?.id && (
                        <button 
                          onClick={() => {
                            if (confirm('Deseja realmente remover este membro ou cancelar o convite?')) {
                              removeMemberMutation.mutate(member.user.id)
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-50"
                          disabled={removeMemberMutation.isPending}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat do Time */}
          {isMember && (
            <div className="mt-8">
              <TeamChat teamId={id!} />
            </div>
          )}
        </div>

        {/* Painel do Capitão - Convidar Membros */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Convidar
          </h2>
          
          {isCaptain ? (
            <div className="card">
              <p className="text-sm text-gray-600 mb-4 lh-relaxed">
                Adicione novos atletas ao seu time buscando pelo nome ou @username.
              </p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nome ou usuário..."
                  className="w-full border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-blue-500/20"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                />
                <Plus className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>

              {/* Resultados da busca */}
              {searchUsername.length > 2 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                   {searchResults?.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 py-2">Nenhum atleta encontrado</p>
                   ) : (
                      searchResults?.map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">@{user.username}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => inviteMutation.mutate(user.id)}
                            disabled={team.members.some((m: any) => m.userId === user.id) || inviteMutation.isPending}
                            className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-30 flex-shrink-0"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                   )}
                </div>
              )}
            </div>
          ) : (
            <div className="card bg-gray-50 border-dashed">
              <p className="text-sm text-gray-500 text-center py-4">
                Apenas o capitão pode convidar novos membros para o time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
