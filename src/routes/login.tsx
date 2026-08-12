import { Box, Link as MuiLink } from '@mui/material'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthForm, type AuthValues } from '../components/AuthForm'
import { apiRequest } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Tokens } from '../lib/types'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>()

  async function submit(values: AuthValues) {
    setError(undefined)
    try {
      const tokens = await apiRequest<Tokens>('/token', {
        method: 'POST',
        body: JSON.stringify(values),
      })
      auth.login(tokens)
      await navigate({ to: '/home' })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <AuthForm
        title="Sign in"
        submitLabel="Sign in"
        error={error}
        onSubmit={submit}
        footer={<MuiLink component={Link} to="/register">Create an account</MuiLink>}
      />
    </Box>
  )
}
