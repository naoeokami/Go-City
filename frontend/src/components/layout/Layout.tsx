// src/components/layout/Layout.tsx
import { Outlet, useLocation }  from 'react-router-dom'
import { Navbar }      from './Navbar'
import { Sidebar }     from './Sidebar'
import { Suggestions } from './Suggestions'

export function Layout() {
  const location = useLocation()
  const isFeed = location.pathname === '/feed'

  const isMessages = location.pathname === '/messages'
  
  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-navy-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors">
      <Navbar />
      <div className={`flex-1 flex flex-col max-w-6xl mx-auto w-full pt-4 md:pt-6 pb-28 lg:pb-10 ${isMessages ? 'px-0 md:px-4' : 'px-4'}`}>
        <div className="grid grid-cols-12 gap-6 h-full flex-1">
          <aside className="col-span-12 lg:col-span-3 hidden lg:block h-full">
            <Sidebar />
          </aside>
          <main className={`col-span-12 ${isFeed ? 'lg:col-span-6' : 'lg:col-span-9'} flex flex-col h-full`}>
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