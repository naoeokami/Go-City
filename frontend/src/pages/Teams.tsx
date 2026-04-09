// src/pages/Teams.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Plus, Shield, MapPin, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { teamService } from '../services/team.service'
import { useAuthStore } from '../store/useAuthStore'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import toast from 'react-hot-toast'

export function TeamsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', sport: 'Futebol', description: '' })

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.list()
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => teamService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setShowCreateModal(false)
      toast.success('Time criado com sucesso!')
    },
    onError: () => toast.error('Erro ao criar time')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return toast.error('Nome é obrigatório')
    createMutation.mutate(formData)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <Users className="w-6 h-6 text-blue-600" />
          Seus Times
        </h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Time
        </Button>
      </div>

      {isLoading ? (
        <p>Carregando times...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams?.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12 card bg-gray-50 border-dashed">
              Você ainda não participa de nenhum time.
            </p>
          ) : (
            teams?.map(team => (
              <Link 
                key={team.id} 
                to={`/teams/${team.id}`}
                className="card hover:shadow-md transition-shadow block"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.sport}</p>
                    <p className="text-xs text-blue-600 font-medium">
                      {team._count?.members || 0} membro(s)
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Modal Criar Time (Simplificado) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4">Novo Time</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Time</label>
                <input
                  type="text"
                  className="w-full border-gray-200 rounded-lg p-2.5 mt-1"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Esporte</label>
                <select
                  className="w-full border-gray-200 rounded-lg p-2.5 mt-1"
                  value={formData.sport}
                  onChange={e => setFormData(prev => ({ ...prev, sport: e.target.value }))}
                >
                  {['Futebol', 'Basquete', 'Vôlei', 'Futsal', 'Tênis'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" loading={createMutation.isPending}>
                  Criar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
