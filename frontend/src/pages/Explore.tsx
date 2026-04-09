// src/pages/Explore.tsx
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, Compass, Users } from 'lucide-react'
import { postService } from '../services/post.service'
import { userService } from '../services/user.service'
import { PostCard } from '../components/feed/PostCard'
import { Avatar } from '../components/ui/Avatar'
import { Link } from 'react-router-dom'

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState<'posts' | 'people'>('posts')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearchQuery(q)
  }, [searchParams])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    if (val) {
      setSearchParams({ q: val })
    } else {
      setSearchParams({})
    }
  }

  const { data: explorePosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['explore-posts'],
    queryFn: () => postService.getExplore(),
    enabled: activeTab === 'posts' && !searchQuery,
  })

  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => userService.search(searchQuery),
    enabled: !!searchQuery,
  })

  return (
    <div className="max-w-xl mx-auto">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Pesquisar atletas, times ou esportes..."
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      {!searchQuery && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'posts' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explorar Posts
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'people' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Sugestões
          </button>
        </div>
      )}

      {searchQuery ? (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">Resultados</h2>
          {isLoadingSearch ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="card h-16" />)}
            </div>
          ) : searchResults?.length === 0 ? (
            <div className="card text-center py-10 text-gray-500">Nenhum resultado encontrado.</div>
          ) : (
            searchResults?.map((user: any) => (
              <Link key={user.id} to={`/profile/${user.username}`} className="card flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatarUrl} name={user.name} size="md" />
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">
                  {user.userType}
                </div>
              </Link>
            ))
          )}
        </div>
      ) : activeTab === 'posts' ? (
        <div className="space-y-4">
          {isLoadingPosts ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map(i => <div key={i} className="card h-64" />)}
            </div>
          ) : (
            explorePosts?.map((post: any) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-500">
          <p>Encontre novas pessoas para seguir!</p>
        </div>
      )}
    </div>
  )
}
