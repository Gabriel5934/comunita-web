import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { routeTree } from './routeTree.gen'
import { AuthProvider, useAuth } from './lib/auth'

const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  context: { queryClient, auth: undefined! },
})
const theme = createTheme()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ queryClient, auth }} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
