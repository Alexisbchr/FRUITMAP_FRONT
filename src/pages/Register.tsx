import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import type { AxiosError } from 'axios'
import type { ApiError } from '../types'

const registerFormSchema = z.object({
  username: z.string().min(3, 'Pseudo trop court (min. 3 caractères)').max(30),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court (min. 8 caractères)'),
  passwordConfirmation: z.string(),
}).refine((formData) => formData.password === formData.passwordConfirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConfirmation'],
})

type RegisterFormValues = z.infer<typeof registerFormSchema>

export function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) })

  async function onFormSubmit(formValues: RegisterFormValues) {
    try {
      setServerError(null)
      await registerUser(formValues.email, formValues.password, formValues.username)
      navigate('/')
    } catch (submissionError) {
      const axiosError = submissionError as AxiosError<ApiError>
      setServerError(axiosError.response?.data?.error ?? 'Erreur lors de l\'inscription')
    }
  }

  return (
    <div className="min-h-screen bg-bark-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="text-2xl font-bold text-gray-900">Rejoindre FruitMap</h1>
          <p className="text-gray-500 mt-1">Créez votre compte pour contribuer</p>
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
            <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">
              Pseudo
            </label>
            <input
              id="register-username"
              type="text"
              autoComplete="username"
              {...register('username')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              placeholder="jardinier42"
            />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              placeholder="vous@exemple.fr"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              placeholder="Min. 8 caractères"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="register-confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              {...register('passwordConfirmation')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              placeholder="••••••••"
            />
            {errors.passwordConfirmation && (
              <p className="mt-1 text-xs text-red-600">{errors.passwordConfirmation.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-forest-600 text-white font-medium rounded-xl hover:bg-forest-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Inscription…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-forest-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
