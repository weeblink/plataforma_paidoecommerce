import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { AuthProvider } from './hooks/auth'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/hooks/theme-provider'

createRoot(document.getElementById('root')!).render(
  <>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
    <Toaster />
  </>,
)
