import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy, Home, Bell, User, LogOut, Search, MessageSquare, Users, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../../services/notification.service'
import { chatService } from '../../services/chat.service'
import { userService } from '../../services/user.service'
import { Avatar }       from '../ui/Avatar'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate         = useNavigate()
  const queryClient      = useQueryClient()
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState('')
  const [showPredictions, setShowPredictions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           localStorage.getItem('theme') === 'dark'
  })
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

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

  const { data: searchResults } = useQuery({
    queryKey: ['search', search],
    queryFn: () => userService.search(search),
    enabled: search.trim().length > 1,
  })

  const unreadCount = notifications?.filter((n: { read: boolean }) => !n.read).length || 0
  const unreadMsgCount = conversations?.filter((c: { unreadCount: number }) => c.unreadCount > 0).length || 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      setShowPredictions(false)
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowPredictions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Top Navbar - Desktop & Mobile Header */}
      <nav className="bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-gray-100 dark:border-navy-700 sticky top-0 z-50 h-16 flex items-center transition-colors">
        <div className="max-w-6xl mx-auto px-4 w-full flex items-center justify-between">
          
          {/* Logo & Hamburger Menu */}
          <div className="flex items-center gap-2">
            <button 
              className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-full transition-colors outline-none"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle Mobile Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/feed" className="flex items-center gap-2">
              <Trophy className="w-7 h-7 text-blue-600 dark:text-blue-500" />
              <span className="text-xl font-black tracking-tight sm:block dark:text-white">
                GO<span className="text-blue-600 dark:text-blue-500">CITY</span>
              </span>
            </Link>
          </div>

          {/* Busca - Desktop Only */}
          <div ref={searchRef} className="hidden md:block relative w-80">
            <form 
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-gray-50 dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-full px-4 py-1.5 focus-within:border-blue-300 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 dark:focus-within:ring-blue-500/20 focus-within:bg-white dark:focus-within:bg-navy-900 transition-all"
            >
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Atletas, times ou eventos..."
                className="bg-transparent text-sm outline-none w-full dark:text-white dark:placeholder-gray-400"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setShowPredictions(true)
                }}
                onFocus={() => setShowPredictions(true)}
              />
            </form>

            {/* Predictive Search Dropdown */}
            {showPredictions && search.trim().length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-800 rounded-2xl shadow-xl dark:shadow-black/50 border border-gray-100 dark:border-navy-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {searchResults && searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto py-2">
                    {searchResults.map((user: { id: string, name: string, username: string, avatarUrl?: string }) => (
                      <Link 
                        key={user.id} 
                        to={`/profile/${user.username}`}
                        onClick={() => {
                          setShowPredictions(false)
                          setSearch('')
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
                      >
                        <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                        </div>
                      </Link>
                    ))}
                    <div className="px-4 py-2 border-t border-gray-50 dark:border-navy-700 mt-2">
                      <button 
                        onClick={handleSearch}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 w-full text-center hover:underline"
                      >
                        Ver todos os resultados
                      </button>
                    </div>
                  </div>
                ) : searchResults ? (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhum resultado encontrado
                  </div>
                ) : (
                  <div className="p-4 flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menu Direito */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-full transition-colors outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Ícones Desktop */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/feed" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-full transition-colors"><Home className="w-5 h-5" /></Link>
              <Link to="/explore" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-full transition-colors"><Search className="w-5 h-5" /></Link>
              <Link to="/teams" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-full transition-colors"><Users className="w-5 h-5" /></Link>
              <Link to="/championships" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-full transition-colors"><Trophy className="w-5 h-5" /></Link>
              <Link to="/messages" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-full transition-colors relative">
                <MessageSquare className="w-5 h-5" />
                {unreadMsgCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-navy-900" />}
              </Link>
            </div>

            {/* Notificações - Sempre Visível */}
            <Link to="/notifications" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border-2 border-white dark:border-navy-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Perfil */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center p-0.5 border-2 border-transparent hover:border-blue-100 dark:hover:border-blue-500/30 rounded-full transition-all">
                  <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-12 bg-white dark:bg-navy-800 rounded-2xl shadow-xl dark:shadow-black/50 border border-gray-100 dark:border-navy-700 p-2 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-navy-700 mb-1">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                    </div>
                    <Link to={`/profile/${user.username}`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700 rounded-xl transition-colors">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500" /> Meu Perfil
                    </Link>
                    <button onClick={() => { setShowDropdown(false); handleLogout(); }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors w-full">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-navy-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-navy-700 py-2 px-6 flex items-center justify-between z-50 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)] dark:shadow-black/20">
        <Link to="/feed" className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all outline-none">
          <Home className="w-6 h-6" />
        </Link>
        <Link to="/explore" className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all outline-none">
          <Search className="w-6 h-6" />
        </Link>
        <Link to="/teams" className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all outline-none">
          <Users className="w-6 h-6" />
        </Link>
        <Link to="/messages" className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all relative outline-none">
          <MessageSquare className="w-6 h-6" />
          {unreadMsgCount > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-navy-900" />}
        </Link>
        <Link to={user ? `/profile/${user.username}` : '/login'} className="p-0.5 active:scale-95 transition-all outline-none">
          <Avatar src={user?.avatarUrl} name={user?.name || ''} size="sm" className="w-8 h-8 border-2 border-transparent active:border-blue-500 transition-all" />
        </Link>
      </div>
      {/* Mobile Drawer Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <div className="relative w-64 max-w-sm bg-white dark:bg-navy-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-left-full duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-navy-700 flex items-center justify-between">
              <span className="text-xl font-black tracking-tight dark:text-white">
                GO<span className="text-blue-600 dark:text-blue-500">CITY</span>
              </span>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link to="/feed" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-xl font-medium">
                <Home className="w-5 h-5 text-gray-500" /> Feed
              </Link>
              <Link to="/championships" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-xl font-medium">
                <Trophy className="w-5 h-5 text-gray-500" /> Campeonatos
              </Link>
              <Link to="/matches/create" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-xl font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h5v5"/><path d="m19.5 4-5 5"/><path d="m15 15 4.5 4.5"/><path d="m14 14-5-5"/><path d="M9 9 4.5 4.5"/><path d="M9 4H4v5"/><path d="m4 4 5 5"/></svg>
                Registrar Partida
              </Link>
              <Link to="/ranking" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-xl font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
                Ranking
              </Link>
              <Link to="/teams" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-xl font-medium">
                <Users className="w-5 h-5 text-gray-500" /> Times
              </Link>
              <Link to="/messages" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-xl font-medium">
                <MessageSquare className="w-5 h-5 text-gray-500" /> Mensagens
              </Link>
              <Link to="/explore" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-xl font-medium">
                <Search className="w-5 h-5 text-gray-500" /> Explorar
              </Link>
            </div>
            {user && (
              <div className="p-4 border-t border-gray-100 dark:border-navy-700">
                <Link to={`/profile/${user.username}`} onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 mb-4">
                  <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </Link>
                <button onClick={() => { setShowMobileMenu(false); handleLogout(); }} className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors w-full font-bold">
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}