import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import type { AxiosError } from 'axios'
import type { ApiError } from '../types'

const loginFormSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const redirectPath = (location.state as { from?: string })?.from ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) })

  async function onFormSubmit(formValues: LoginFormValues) {
    try {
      setServerError(null)
      await login(formValues.email, formValues.password)
      navigate(redirectPath, { replace: true })
    } catch (submissionError) {
      const axiosError = submissionError as AxiosError<ApiError>
      setServerError(axiosError.response?.data?.error ?? 'Erreur de connexion')
    }
  }

  return (
    <div className="min-h-screen bg-bark-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍎</div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur FruitMap</h1>
          <p className="text-gray-500 mt-1">Connectez-vous pour contribuer</p>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          {serverError && (
            <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              placeholder="vous@exemple.fr"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-forest-600 text-white font-medium rounded-xl hover:bg-forest-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-forest-600 font-medium hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
