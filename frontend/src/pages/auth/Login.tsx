// src/pages/auth/Login.tsx
import { useForm }       from 'react-hook-form'
import { zodResolver }   from '@hookform/resolvers/zod'
import { z }             from 'zod'
import { Link }          from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { useAuth }       from '../../hooks/useAuth'
import { Button }        from '../../components/ui/Button'
import { Input }         from '../../components/ui/Input'

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const { login, isLoadingLogin } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => login(data)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-navy-900 dark:to-navy-950
                    flex items-center justify-center p-4">
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700
                      p-6 sm:p-8 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Go<span className="text-blue-600 dark:text-blue-400">City</span>
          </span>
        </div>

        <h1 className="text-xl font-black text-gray-900 dark:text-white text-center mb-1">
          Bem-vindo de volta!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
          Entre na sua conta para continuar
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="••••••"
            error={errors.password?.message}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isLoadingLogin}
          >
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Não tem uma conta?{' '}
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  )
}