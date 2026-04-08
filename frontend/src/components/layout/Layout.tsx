// src/components/layout/Layout.tsx
import { Outlet }  from 'react-router-dom'
import { Navbar }  from './Navbar'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-10">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-3 hidden lg:block">
            <Sidebar />
          </aside>
          <main className="col-span-12 lg:col-span-9">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}