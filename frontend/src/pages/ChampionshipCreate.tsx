// src/pages/ChampionshipCreate.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Trophy, Calendar, Info, DollarSign, ImageIcon, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { championshipService } from '../services/championship.service'
import { uploadService } from '../services/upload.service'

export function ChampionshipCreatePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: 'Futebol',
    location: '',
    city: '',
    state: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 16,
    registrationFee: 0,
    format: 'KNOCKOUT' as any,
    registrationType: 'INDIVIDUAL' as any,
    groupsCount: 4,
    advancePerGroup: 2,
    rules: '',
    prizes: '',
    imageUrl: '',
  })

  const [isUploading, setIsUploading] = useState(false)

  const mutation = useMutation({
    mutationFn: (data: any) => championshipService.create(data),
    onSuccess: () => {
      toast.success('Campeonato criado com sucesso!')
      navigate('/championships')
    },
    onError: (error: any) => {
      console.error('Erro na criação:', error.response?.data)
      const data = error.response?.data
      const message = data?.error || data?.message || 'Erro ao criar campeonato'
      
      if (data?.details && Array.isArray(data.details)) {
        const details = data.details
          .map((err: any) => `${err.path?.join('.')}: ${err.message}`)
          .join(', ')
        toast.error(`Validação falhou: ${details}`)
      } else if (data?.details) {
        toast.error(`${message}`)
      } else {
        toast.error(message)
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validations
    if (!formData.title || !formData.startDate || !formData.city || !formData.registrationDeadline) {
      return toast.error('Preencha os campos obrigatórios (*)')
    }

    const payload = {
      ...formData,
      maxParticipants: Number(formData.maxParticipants) || 16,
      registrationFee: Number(formData.registrationFee) || 0,
      startDate: new Date(formData.startDate).toISOString(),
      registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
      // Se endDate estiver vazio, usar startDate ou tornar opcional no backend
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(formData.startDate).toISOString(),
    }

    mutation.mutate(payload)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const res = await uploadService.uploadImage(file)
      setFormData(prev => ({ ...prev, imageUrl: res.url }))
      toast.success('Imagem carregada!')
    } catch (err) {
      toast.error('Erro ao subir imagem')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Campeonato</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="card space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Informações Básicas
          </h2>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título do Campeonato *</label>
            <input
              type="text"
              required
              className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Ex: Torneio Intermunicipal de Verão"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Esporte</label>
              <select
                className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5 outline-none"
                value={formData.sport}
                onChange={e => setFormData(prev => ({ ...prev, sport: e.target.value }))}
              >
                {['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Natação', 'Futsal', 'Truco', 'Outro'].map(s => (
                   <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Formato</label>
              <select
                className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5 outline-none"
                value={formData.format}
                onChange={e => setFormData(prev => ({ ...prev, format: e.target.value }))}
              >
                <option value="KNOCKOUT">Mata-mata</option>
                <option value="ROUND_ROBIN">Pontos Corridos</option>
                <option value="GROUPS_PLUS_KNOCKOUT">Grupos + Mata-mata</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Inscrição</label>
              <select
                className="w-full border-gray-200 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg p-2.5 outline-none font-semibold text-blue-600 bg-blue-50"
                value={formData.registrationType}
                onChange={e => setFormData(prev => ({ ...prev, registrationType: e.target.value }))}
              >
                <option value="INDIVIDUAL">Apenas Jogadores (Individual)</option>
                <option value="TEAM">Apenas Equipes (Capitão inscreve)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade Participantes</label>
              <input
                type="number"
                className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5"
                value={formData.maxParticipants}
                onChange={e => setFormData(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
              />
            </div>
          </div>

          {formData.format === 'GROUPS_PLUS_KNOCKOUT' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-navy-900 rounded-xl border border-gray-100 dark:border-navy-700 animate-in slide-in-from-top-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Qtd de Grupos</label>
                <input
                  type="number"
                  className="w-full border-gray-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white rounded-lg p-2"
                  value={formData.groupsCount}
                  onChange={e => setFormData(prev => ({ ...prev, groupsCount: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Passam por Grupo</label>
                <input
                  type="number"
                  className="w-full border-gray-200 dark:border-navy-600 dark:bg-navy-800 dark:text-white rounded-lg p-2"
                  value={formData.advancePerGroup}
                  onChange={e => setFormData(prev => ({ ...prev, advancePerGroup: Number(e.target.value) }))}
                />
              </div>
            </div>
          )}


          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição (Opcional)</label>
            <textarea
              className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 h-24"
              placeholder="Fale um pouco sobre o campeonato, premiações, etc."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </section>

        {/* Local e Data */}
        <section className="card space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Local e Data
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cidade *</label>
              <input
                type="text"
                required
                className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5"
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado *</label>
              <input
                type="text"
                required
                className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5"
                value={formData.state}
                onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço Completo</label>
            <input
              type="text"
              className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5"
              placeholder="Rua, Estádio, Quadra..."
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Início do Torneio *</label>
              <input
                type="date"
                required
                className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5 [color-scheme:light] dark:[color-scheme:dark]"
                value={formData.startDate}
                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fim do Torneio</label>
              <input
                type="date"
                className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5 [color-scheme:light] dark:[color-scheme:dark]"
                value={formData.endDate}
                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-red-600 font-bold">Prazo Final Inscrições *</label>
            <input
              type="date"
              required
              className="w-full border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100 rounded-lg p-2.5 [color-scheme:light] dark:[color-scheme:dark]"
              value={formData.registrationDeadline}
              onChange={e => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
            />
          </div>
        </section>

        {/* Inscrição e Imagem */}
        <section className="card space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            Inscrição e Imagem
          </h2>

          <div className="grid grid-cols-1">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Taxa de Inscrição (R$)</label>
              <input
                type="number"
                className="w-full border-gray-200 dark:border-navy-700 dark:bg-navy-900 dark:text-white rounded-lg p-2.5"
                value={formData.registrationFee}
                onChange={e => setFormData(prev => ({ ...prev, registrationFee: Number(e.target.value) }))}
              />
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Banner do Campeonato
            </label>
            <div className="flex items-center gap-4">
              <label className={`flex-1 border-2 border-dashed border-gray-200 dark:border-navy-700 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Banner" className="h-32 mx-auto rounded-lg" />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500">
                    <Plus className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Clique para subir uma imagem</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </section>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/championships')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            loading={mutation.isPending}
          >
            Criar Campeonato
          </Button>
        </div>
      </form>
    </div>
  )
}
