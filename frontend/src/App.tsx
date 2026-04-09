// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider }        from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import { Layout }                 from './components/layout/Layout'
import { LoginPage }              from './pages/auth/Login'
import { RegisterPage }           from './pages/auth/Register'
import { FeedPage }               from './pages/Feed'
import { ProfilePage }            from './pages/Profile'
import { ChampionshipsPage }      from './pages/Championships'
import { ChampionshipDetailPage } from './pages/ChampionshipDetail'
import { ChampionshipCreatePage } from './pages/ChampionshipCreate'
import { ExplorePage }            from './pages/Explore'
import { NotificationsPage }      from './pages/Notifications'
import { useAuthStore }           from './store/useAuthStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:               1,
      staleTime:           1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { isLogged } = useAuthStore()
  return isLogged ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactElement }) {
  const { isLogged } = useAuthStore()
  return !isLogged ? children : <Navigate to="/feed" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute><RegisterPage /></PublicRoute>
          } />

          <Route path="/" element={
            <PrivateRoute><Layout /></PrivateRoute>
          }>
            <Route index element={<Navigate to="/feed" replace />} />
            <Route path="feed"               element={<FeedPage />} />
            <Route path="championships"      element={<ChampionshipsPage />} />
            <Route path="championships/create" element={<ChampionshipCreatePage />} />
            <Route path="championships/:id"  element={<ChampionshipDetailPage />} />
            <Route path="explore"            element={<ExplorePage />} />
            <Route path="notifications"      element={<NotificationsPage />} />
            <Route path="profile/:username"  element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '8px' },
        }}
      />
    </QueryClientProvider>
  )
}