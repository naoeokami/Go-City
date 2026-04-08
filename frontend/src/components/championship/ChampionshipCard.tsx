// src/components/championship/ChampionshipCard.tsx
import { Link }    from 'react-router-dom'
import { Calendar, MapPin, Users, Trophy } from 'lucide-react'
import { format }  from 'date-fns'
import { ptBR }    from 'date-fns/locale'
import type { Championship } from '../../types'

const statusColors = {
  DRAFT:     'bg-gray-100 text-gray-600',
  OPEN:      'bg-green-100 text-green-700',
  CLOSED:    'bg-red-100 text-red-700',
  ONGOING:   'bg-blue-100 text-blue-700',
  FINISHED:  'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
}

const statusLabels = {
  DRAFT:     'Rascunho',
  OPEN:      '🟢 Inscrições abertas',
  CLOSED:    '🔴 Encerrado',
  ONGOING:   '🔵 Em andamento',
  FINISHED:  '🏁 Finalizado',
  CANCELLED: 'Cancelado',
}

interface Props {
  championship: Championship
}

export function ChampionshipCard({ championship: c }: Props) {
  return (
    <Link to={`/championships/${c.id}`}>
      <div className="card hover:shadow-md transition-all duration-200
                      hover:-translate-y-0.5 cursor-pointer h-full">

        {/* Banner */}
        <div className="h-36 bg-gradient-to-br from-blue-500 to-purple-600
                        rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          {c.imageUrl ? (
            <img
              src={c.imageUrl}
              alt={c.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Trophy className="w-12 h-12 text-white opacity-40" />
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                            ${statusColors[c.status]}`}>
            {statusLabels[c.status]}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600
                           px-2 py-0.5 rounded-full">
            {c.sport}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
          {c.title}
        </h3>

        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {c.description}
        </p>

        {/* Infos */}
        <div className="space-y-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            {format(new Date(c.startDate), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            {c.city}, {c.state}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            {c._count.registrations}
            {c.maxParticipants ? ` / ${c.maxParticipants}` : ''} inscritos
          </div>
        </div>

        {/* Preço */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className={`text-sm font-semibold ${
            c.registrationFee === 0 ? 'text-green-600' : 'text-gray-700'
          }`}>
            {c.registrationFee === 0
              ? '✅ Gratuito'
              : `R$ ${c.registrationFee.toFixed(2)}`
            }
          </span>
        </div>
      </div>
    </Link>
  )
}