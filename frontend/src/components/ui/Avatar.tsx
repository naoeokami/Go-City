// src/components/ui/Avatar.tsx
interface AvatarProps {
  src?:  string
  name:  string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export type { AvatarProps }

const sizes = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-sm',
  xl: 'w-20 h-20 text-lg',
}

const colorGradients = [
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-fuchsia-700',
  'from-emerald-600 to-teal-700',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
]

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .filter(n => n.length > 0)
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '??'

  // Deterministic color based on name
  const colorIndex = name 
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorGradients.length
    : 0
  const gradient = colorGradients[colorIndex]

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 shadow-sm border border-gray-100 dark:border-navy-700 ${className}`}
      />
    )
  }

  return (
    <div className={`
      ${sizes[size]} rounded-full bg-gradient-to-br ${gradient} text-white
      flex items-center justify-center font-black flex-shrink-0 tracking-tighter shadow-sm ${className}
    `}>
      {initials}
    </div>
  )
}