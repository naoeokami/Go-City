// src/pages/Championships.tsx
import { useState }            from 'react'
import { useQuery }            from '@tanstack/react-query'
import { Plus, Search, Trophy, Filter } from 'lucide-react'
import { Link }                from 'react-router-dom'
import { ChampionshipCard }    from '../components/championship/ChampionshipCard'
import { Button }              from '../components/ui/Button'
import { useAuthStore }        from '../store/useAuthStore'
import { championshipService } from '../services/championship.service'

const SPORTS = ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Natação', 'Futsal', 'Beach Tennis', 'Padel']

const STATUS_TABS = [
  { value: '',         label: 'Explorar' },
  { value: 'OPEN',     label: 'Em Aberto' },
  { value: 'ONGOING',  label: 'Em Andamento' },
  { value: 'FINISHED', label: 'Encerrados' },
]

export function ChampionshipsPage() {
  const { user }               = useAuthStore()
  const [sport, setSport]      = useState('')
  const [status, setStatus]    = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['championships', sport, status],
    queryFn:  () => championshipService.list({
      sport:  sport  || undefined,
      status: status || undefined,
    }),
  })

  const filteredData = data?.data.filter((c: any) => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* Hero Header */}
      <div className="relative mb-12 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-2">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
                   <Trophy className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Campeonatos</h1>
             </div>
             <p className="text-gray-500 font-medium max-w-lg">
                Seja o protagonista da sua história esportiva. Inscreva seu time ou jogue solo nos melhores torneios da região.
             </p>
           </div>

           {user?.userType === 'ORGANIZER' && (
             <Link to="/championships/create">
               <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-200 border-none">
                 <Plus className="w-5 h-5 mr-2" />
                 Lançar Novo Evento
               </Button>
             </Link>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Sidebar Filters */}
         <div className="lg:col-span-3 space-y-8">
            <div className="card !p-6 space-y-6 bg-white border-none shadow-sm">
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Busca Rápida</label>
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                     <input 
                        type="text" 
                        placeholder="Nome do torneio..."
                        className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                     />
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                     <Filter className="w-3 h-3" /> Categorias
                  </label>
                  <div className="flex flex-col gap-1">
                     <button
                        onClick={() => setSport('')}
                        className={`text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                           sport === '' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                     >
                        Todas as Categorias
                     </button>
                     {SPORTS.map(s => (
                        <button
                           key={s}
                           onClick={() => setSport(s)}
                           className={`text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                              sport === s ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'
                           }`}
                        >
                           {s}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Main Listing */}
         <div className="lg:col-span-9 space-y-6">
            {/* Horizontal Tabs for Status */}
            <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-full md:w-fit overflow-x-auto whitespace-nowrap scrollbar-hide">
               {STATUS_TABS.map(tab => (
                  <button
                     key={tab.value}
                     onClick={() => setStatus(tab.value)}
                     className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                        status === tab.value 
                           ? 'bg-white text-blue-600 shadow-sm' 
                           : 'text-gray-500 hover:text-gray-700'
                     }`}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>

            {/* Grid */}
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                     <div key={i} className="card !p-0 h-80 animate-pulse bg-gray-100 rounded-3xl" />
                  ))}
               </div>
            ) : filteredData?.length === 0 ? (
               <div className="card !p-20 text-center bg-gray-50/50 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6">
                     <Trophy className="w-8 h-8 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Puxa, nenhum evento aqui.</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 font-medium">Tente ajustar seus filtros ou buscar por outro esporte!</p>
                  <Button variant="outline" onClick={() => { setSport(''); setStatus(''); setSearchTerm(''); }}>Limpar Filtros</Button>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {filteredData?.map((c: any) => (
                     <ChampionshipCard key={c.id} championship={c} />
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  )
}