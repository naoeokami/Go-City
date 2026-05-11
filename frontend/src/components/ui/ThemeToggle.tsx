import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    
    // Dispatch a custom event to notify other components if needed
    window.dispatchEvent(new Event('theme-changed'))
  }, [isDark])

  // Listen for external theme changes (optional but good for consistency)
  useEffect(() => {
    const handleThemeChange = () => {
      const dark = document.documentElement.classList.contains('dark')
      if (dark !== isDark) setIsDark(dark)
    }
    window.addEventListener('theme-changed', handleThemeChange)
    return () => window.removeEventListener('theme-changed', handleThemeChange)
  }, [isDark])

  return (
    <button 
      onClick={() => setIsDark(!isDark)}
      className={`p-2 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-navy-700 outline-none focus:ring-2 focus:ring-blue-500/20 ${className}`}
      aria-label="Trocar Tema"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500 animate-in zoom-in spin-in-180 duration-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-500 animate-in zoom-in spin-in-180 duration-500" />
      )}
    </button>
  )
}
