// src/pages/auth/Register.tsx
import { useForm }     from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }           from 'zod'
import { Link }        from 'react-router-dom'
import { Trophy }      from 'lucide-react'
import { useAuth }     from '../../hooks/useAuth'
import { Button }      from '../../components/ui/Button'
import { Input }       from '../../components/ui/Input'

const schema = z.object({
  name:     z.string().min(2,  'Nome muito curto'),
  username: z.string().min(3,  'Username muito curto')
                      .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _'),
  email:    z.string().email('Email inválido'),
  password: z.string().min(6,  'Mínimo 6 caracteres'),
  userType: z.enum(['FAN','ATHLETE','COACH','REFEREE','ORGANIZER','JOURNALIST']),
})

type FormData = z.infer<typeof schema>

const userTypeOptions = [
  { value: 'FAN',        label: '🏟️ Fã / Torcedor' },
  { value: 'ATHLETE',    label: '🏃 Atleta' },
  { value: 'COACH',      label: '📋 Técnico / Treinador' },
  { value: 'REFEREE',    label: '🟨 Árbitro' },
  { value: 'ORGANIZER',  label: '🏆 Organizador de Eventos' },
  { value: 'JOURNALIST', label: '📰 Jornalista Esportivo' },
]

export function RegisterPage() {
  const { register: registerUser, isLoadingRegister } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver:     zodResolver(schema),
    defaultValues: { userType: 'FAN' },
  })

  const onSubmit = (data: FormData) => registerUser(data)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100
                    flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                      p-8 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            Sport<span className="text-blue-600">Connect</span>
          </span>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 text-center mb-1">
          Crie sua conta
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Junte-se à comunidade esportiva!
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('name')}
            label="Nome completo"
            placeholder="Seu nome"
            error={errors.name?.message}
          />

          <Input
            {...register('username')}
            label="Username"
            placeholder="seuusername"
            error={errors.username?.message}
          />

          <Input
            {...register('email')}
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
          />

          <Input
            {...register('password')}
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Você é...
            </label>
            <select
              {...register('userType')}
              className="input"
            >
              {userTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.userType && (
              <p className="text-red-500 text-xs mt-1">
                {errors.userType.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isLoadingRegister}
          >
            Criar minha conta
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}