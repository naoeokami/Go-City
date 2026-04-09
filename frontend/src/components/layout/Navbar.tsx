// src/components/layout/Navbar.tsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy, Home, Bell, User, LogOut, Search, MessageSquare, Users } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../../services/notification.service'
import { chatService } from '../../services/chat.service'
import { Avatar }       from '../ui/Avatar'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate         = useNavigate()
  const queryClient      = useQueryClient()
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    refetchInterval: 10000,
    enabled: !!user,
  })

  const { data: conversations } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: () => chatService.listConversations(),
    refetchInterval: 5000,
    enabled: !!user
  })

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0
  const unreadMsgCount = conversations?.filter((c: any) => c.unreadCount > 0).length || 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/explore?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate('/login')
  }

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
    <>
      {/* Top Navbar - Desktop & Mobile Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-6xl mx-auto px-4 w-full flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/feed" className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-black tracking-tight hidden sm:block">
              GO<span className="text-blue-600">CITY</span>
            </span>
          </Link>

          {/* Busca - Desktop Only */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 w-80 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 focus-within:bg-white transition-all"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Atletas, times ou eventos..."
              className="bg-transparent text-sm outline-none w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          {/* Menu Direito */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Ícones Desktop */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/feed" className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"><Home className="w-5 h-5" /></Link>
              <Link to="/explore" className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"><Search className="w-5 h-5" /></Link>
              <Link to="/teams" className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"><Users className="w-5 h-5" /></Link>
              <Link to="/championships" className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"><Trophy className="w-5 h-5" /></Link>
              <Link to="/messages" className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors relative">
                <MessageSquare className="w-5 h-5" />
                {unreadMsgCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />}
              </Link>
            </div>

            {/* Notificações - Sempre Visível */}
            <Link to="/notifications" className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Perfil */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center p-0.5 border-2 border-transparent hover:border-blue-100 rounded-full transition-all">
                  <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                    </div>
                    <Link to={`/profile/${user.username}`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                      <User className="w-4 h-4 text-gray-400" /> Meu Perfil
                    </Link>
                    <button onClick={() => { setShowDropdown(false); handleLogout(); }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full">
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 flex items-center justify-between z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <Link to="/feed" className="p-2 text-gray-400 hover:text-blue-600 active:scale-95 transition-all"><Home className="w-6 h-6" /></Link>
        <Link to="/explore" className="p-2 text-gray-400 hover:text-blue-600 active:scale-95 transition-all"><Search className="w-6 h-6" /></Link>
        <Link to="/teams" className="p-2 text-gray-400 hover:text-blue-600 active:scale-95 transition-all"><Users className="w-6 h-6" /></Link>
        <Link to="/messages" className="p-2 text-gray-400 hover:text-blue-600 active:scale-95 transition-all relative">
          <MessageSquare className="w-6 h-6" />
          {unreadMsgCount > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />}
        </Link>
        <Link to={user ? `/profile/${user.username}` : '/login'} className="p-0.5 active:scale-95 transition-all">
          <Avatar src={user?.avatarUrl} name={user?.name || ''} size="sm" className="w-7 h-7 border border-gray-200" />
        </Link>
      </div>
    </>
  )
}