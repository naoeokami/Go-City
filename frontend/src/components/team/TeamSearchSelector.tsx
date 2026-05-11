// src/components/team/TeamSearchSelector.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Shield, ChevronRight } from 'lucide-react'
import { teamService } from '../../services/team.service'
import { Avatar } from '../ui/Avatar'

import { useAuthStore } from '../../store/useAuthStore'

interface TeamSearchSelectorProps {
  onSelect: (teamId: string, isCaptain?: boolean) => void
  label?: string
  sport?: string
  myTeams?: boolean
}

export function TeamSearchSelector({ onSelect, label, sport, myTeams }: TeamSearchSelectorProps) {
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  const { data: teams } = useQuery({
    queryKey: ['teams-search', sport, searchTerm, myTeams],
    queryFn: () => teamService.list(sport, myTeams),
    enabled: isOpen
  })

  const filteredTeams = teams?.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5)

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      
      {!selectedTeam ? (
        <div className="relative">
          <div 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 p-3 bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-all"
          >
            <div className="w-10 h-10 bg-gray-50 dark:bg-navy-800 rounded-lg flex items-center justify-center text-gray-400">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-400">Buscar ou selecionar time...</span>
            <Search className="w-4 h-4 text-gray-400 ml-auto" />
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 border-b border-gray-50 dark:border-navy-700">
                <input
                  autoFocus
                  type="text"
                  placeholder="Pesquisar..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-navy-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredTeams?.map(team => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setSelectedTeam(team)
                      onSelect(team.id, team.captainId === user?.id)
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-navy-700 rounded-lg transition-colors group"
                  >
                    <Avatar src={team.logoUrl} name={team.name} size="sm" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">{team.name}</p>
                      <p className="text-[10px] text-gray-500">{team.sport}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-300 ml-auto opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
                {filteredTeams?.length === 0 && (
                  <p className="text-[10px] text-center text-gray-400 py-4 font-medium">Nenhum time encontrado</p>
                )}
              </div>
              <div className="p-2 border-t border-gray-50 dark:border-navy-700 flex justify-end">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 rounded-xl relative group">
          <Avatar src={selectedTeam.logoUrl} name={selectedTeam.name} size="md" />
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{selectedTeam.name}</p>
            <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">{selectedTeam.sport}</p>
          </div>
          <button 
            onClick={() => {
              setSelectedTeam(null)
              onSelect('')
            }}
            className="text-[10px] bg-white dark:bg-navy-700 text-gray-400 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:text-red-500"
          >
            Trocar
          </button>
        </div>
      )}
    </div>
  )
}
