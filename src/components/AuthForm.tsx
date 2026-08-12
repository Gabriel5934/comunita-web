import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import type { ReactNode } from 'react'
import { z } from 'zod'

const authSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must have at least 8 characters'),
})

export type AuthValues = z.infer<typeof authSchema>

type AuthFormProps = {
  title: string
  submitLabel: string
  error?: string
  onSubmit: (values: AuthValues) => Promise<void>
  footer: ReactNode
}

export function AuthForm({ title, submitLabel, error, onSubmit, footer }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthValues>({ resolver: zodResolver(authSchema) })

  return (
    <Card sx={{ width: '100%', maxWidth: 440 }}>
      <CardContent>
        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography component="h1" variant="h4">{title}</Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete={title === 'Create account' ? 'new-password' : 'current-password'}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : submitLabel}
          </Button>
          {footer}
        </Stack>
      </CardContent>
    </Card>
  )
}
