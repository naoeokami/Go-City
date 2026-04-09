// src/components/ui/Avatar.tsx
interface AvatarProps {
  src?:  string
  name:  string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export type { AvatarProps }

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div className={`
      ${sizes[size]} rounded-full bg-blue-600 text-white
      flex items-center justify-center font-semibold flex-shrink-0 ${className}
    `}>
      {initials}
    </div>
  )
}