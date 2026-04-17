// src/components/ui/UserSearchSelector.tsx
import { useState, useEffect } from 'react'
import { Search, Check, X, User } from 'lucide-react'
import { userService } from '../../services/user.service'
import { Avatar } from './Avatar'

interface UserSearchSelectorProps {
  label: string
  onSelect: (userIds: string[]) => void
  disabled?: boolean
  multiple?: boolean
  excludeIds?: string[] // IDs that cannot be selected (e.g., already selected in the other side)
}

export function UserSearchSelector({ 
  label, 
  onSelect, 
  disabled, 
  multiple = false,
  excludeIds = []
}: UserSearchSelectorProps) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setUsers([])
        return
      }
      setLoading(true)
      try {
        const res = await userService.search(search)
        setUsers(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleSelect = (user: any) => {
    if (excludeIds.includes(user.id)) return // Already in the other side

    if (multiple) {
      if (selectedUsers.some(u => u.id === user.id)) {
         setIsOpen(false)
         return
      }
      const newSelected = [...selectedUsers, user]
      setSelectedUsers(newSelected)
      onSelect(newSelected.map(u => u.id))
      setSearch('')
    } else {
      setSelectedUsers([user])
      onSelect([user.id])
      setSearch('')
    }
    setIsOpen(false)
  }

  const removeUser = (userId: string) => {
    const newSelected = selectedUsers.filter(u => u.id !== userId)
    setSelectedUsers(newSelected)
    onSelect(newSelected.map(u => u.id))
  }

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center gap-2 px-1">
         <User className="w-3.5 h-3.5 text-blue-500" />
         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</label>
      </div>
      
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          placeholder={multiple ? "Adicionar atletas..." : "Buscar atleta..."}
          disabled={disabled}
          className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none transition-all shadow-sm"
        />
        
        {isOpen && (users.length > 0 || loading) && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-400 font-bold animate-pulse italic">Buscando na rede...</div>
            ) : (
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {users.map(u => {
                  const isExcluded = excludeIds.includes(u.id)
                  const isSelected = selectedUsers.some(su => su.id === u.id)
                  
                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={isExcluded}
                      onClick={() => handleSelect(u)}
                      className={`w-full flex items-center justify-between p-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${isExcluded ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                         <Avatar src={u.avatarUrl} name={u.name} size="sm" />
                         <div className="text-left">
                           <p className="text-xs font-black text-gray-900">{u.name}</p>
                           <p className="text-[10px] text-gray-400 font-bold">@{u.username}</p>
                         </div>
                      </div>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-blue-500" />
                      ) : isExcluded ? (
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Indisponível</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tags de Usuários Selecionados (Padronizado) */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
           {selectedUsers.map(u => (
             <div key={u.id} className="inline-flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-blue-50 shadow-sm hover:border-blue-100 transition-all">
                <Avatar src={u.avatarUrl} name={u.name} size="xs" />
                <span className="text-[10px] font-black text-gray-800 tracking-tight">{u.name}</span>
                <button 
                  type="button"
                  onClick={() => removeUser(u.id)}
                  className="ml-1 p-0.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-md transition-colors"
                >
                   <X className="w-3 h-3" />
                </button>
             </div>
           ))}
        </div>
      )}
      
      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
