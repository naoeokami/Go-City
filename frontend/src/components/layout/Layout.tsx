// src/components/layout/Layout.tsx
import { Outlet, useLocation }  from 'react-router-dom'
import { Navbar }      from './Navbar'
import { Sidebar }     from './Sidebar'
import { Suggestions } from './Suggestions'

export function Layout() {
  const location = useLocation()
  const isFeed = location.pathname === '/feed'

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-32 lg:pb-10">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 lg:col-span-3 hidden lg:block">
            <Sidebar />
          </aside>
          <main className={`col-span-12 ${isFeed ? 'lg:col-span-6' : 'lg:col-span-9'}`}>
            <Outlet />
          </main>
          {isFeed && (
            <aside className="col-span-12 lg:col-span-3 hidden xl:block">
              <Suggestions />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}