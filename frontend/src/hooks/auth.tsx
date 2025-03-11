import { api } from '@/services/api'
import { AxiosError } from 'axios'
import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface LoginProps {
  email: string
  password: string
}

export interface LoginResponse {
  status: boolean
  message: string
  token?: string
  roleType?: string
}
interface AuthContextType {
  user: User | null
  isLoading: boolean
  handleLogin: (data: LoginProps) => Promise<LoginResponse>
  handleLogout: () => Promise<void>
}

interface User {
  name: string
  cpf: string
  user_type: 'STUDENT' | 'ADMIN'
  email: string
  phone: string
  token: string
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function handleLogin(values: LoginProps): Promise<LoginResponse> {
    try {
      const { data } = await api.post<{
        message: string
        data: { user: User }
      }>('/login', values)

      const user = data?.data.user
      const token = user.token

      localStorage.setItem('token', JSON.stringify(token))
      api.defaults.headers.Authorization = `Bearer ${token}`

      setUser(user)

      return {
        status: true,
        message: data.message,
        roleType: user.user_type,
        token,
      }
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao realizar o login'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        if (!error.response?.data?.message && error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
      }

      return {
        status: false,
        message: errorMessage,
      }
    }
  }

  async function handleLogout() {
    try {
      await api.post('/logout')
      localStorage.removeItem('token')
      setUser(null)
    } catch {
      toast.error('Ocorreu um erro ao sair da aplicação')
    }
  }

  async function refreshToken() {
    setIsLoading(true)
    const token = localStorage.getItem('token')

    if (!token) {
      setIsLoading(false)
      return
    }

    if (token) {
      try {
        api.defaults.headers.Authorization = `Bearer ${JSON.parse(token)}`

        const { data } = await api.post<{
          message: string
          data: { user: User }
        }>('/refresh_token')

        const user = data?.data.user
        const refreshedToken = user.token

        api.defaults.headers.Authorization = `Bearer ${refreshedToken}`
        localStorage.setItem('token', JSON.stringify(refreshedToken))
        setUser(user)
      } catch {
        toast.error(
          'Ocorreu um erro ao tentar sincronizar o login. Por favor, faça o login novamente',
        )
        /*localStorage.removeItem('token');
        setUser(null);*/
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    refreshToken()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
