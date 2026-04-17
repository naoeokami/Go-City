// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom'
import {
  Home, Trophy,
  Compass, Bell,
  Users, MessageSquare,
  BarChart2, Sword
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { Avatar }       from '../ui/Avatar'

export function Sidebar() {
  const { user }   = useAuthStore()
  const { pathname } = useLocation()

  const links = [
    { to: '/feed',          icon: Home,          label: 'Feed' },
    { to: '/championships', icon: Trophy,        label: 'Campeonatos' },
    { to: '/matches/create', icon: Sword,         label: 'Registrar Partida' },
    { to: '/ranking',       icon: BarChart2,     label: 'Ranking' },
    { to: '/teams',         icon: Users,         label: 'Times' },
    { to: '/messages',      icon: MessageSquare, label: 'Mensagens' },
    { to: '/explore',       icon: Compass,       label: 'Explorar' },
    { to: '/notifications', icon: Bell,          label: 'Notificações' },
  ]

  return (
    <div className="space-y-2">
      {/* Perfil resumido */}
      {user && (
        <div className="card mb-4">
          <Link
            to={`/profile/${user.username}`}
            className="flex items-center gap-3"
          >
            <Avatar src={user.avatarUrl} name={user.name} size="md" />
            <div>
              <p className="font-semibold text-sm text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">@{user.username}</p>
            </div>
          </Link>
        </div>
      )}

      {/* Navegação */}
      <nav className="card space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-sm font-medium transition-colors
              ${pathname === to
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}