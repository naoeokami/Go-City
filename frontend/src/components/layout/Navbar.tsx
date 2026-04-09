// src/components/layout/Navbar.tsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy, Home, Bell, User, LogOut, Search, X } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useQuery } from '@tanstack/react-query'
import { notificationService } from '../../services/notification.service'
import { Avatar }       from '../ui/Avatar'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate         = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    refetchInterval: 30000, // Atualiza a cada 30s
    enabled: !!user,
  })

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/explore?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/feed" className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold hidden sm:block">
              Sport<span className="text-blue-600">Connect</span>
            </span>
          </Link>

          {/* Busca - centro */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-72"
          >
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar atletas, campeonatos..."
              className="bg-transparent text-sm outline-none w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          {/* Menu direito */}
          <div className="flex items-center gap-3">
            <Link
              to="/feed"
              className="text-gray-600 hover:text-blue-600 transition-colors p-1"
            >
              <Home className="w-5 h-5" />
            </Link>

            <Link
              to="/championships"
              className="text-gray-600 hover:text-blue-600 transition-colors p-1"
            >
              <Trophy className="w-5 h-5" />
            </Link>

            <Link 
              to="/notifications"
              className="text-gray-600 hover:text-blue-600 relative p-1"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white
                               text-[10px] font-bold px-1.5 py-0.5 rounded-full
                               min-w-[18px] text-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Avatar com dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center"
                >
                  <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-12 bg-white rounded-xl
                                  shadow-lg border border-gray-100 p-2
                                  min-w-[180px] z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="font-medium text-sm text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>

                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm
                                 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </Link>

                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm
                                 text-red-600 hover:bg-red-50 rounded-lg w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}