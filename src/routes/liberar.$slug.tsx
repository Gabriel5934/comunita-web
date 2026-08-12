import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Autocomplete, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { apiRequest } from '../lib/api'
import type { FormField, PublicBuildingForm } from '../lib/types'

export const Route = createFileRoute('/liberar/$slug')({ component: EntrancePage })

function schemaFor(fields: FormField[]): z.ZodType<Record<string, string>, Record<string, string>> {
  const shape: Record<string, z.ZodType<string>> = {}
  for (const field of fields) {
    let validator = z.string()
    if (field.validation.required) validator = validator.min(1, 'This field is required')
    if (field.type === 'name') validator = validator.refine((value) => !value || /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(value), 'Use one word containing letters only')
    if (field.type === 'rg') validator = validator.refine((value) => !value || /^[A-Za-z0-9]+$/.test(value), 'Use letters and numbers only')
    if (field.type === 'cpf') validator = validator.refine((value) => !value || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value), 'Use 000.000.000-00')
    shape[field.id] = validator
  }
  return z.object(shape) as z.ZodType<Record<string, string>, Record<string, string>>
}

function cpfMask(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function EntrancePage() {
  const { slug } = Route.useParams()
  const formQuery = useQuery({
    queryKey: ['public-form', slug],
    queryFn: () => apiRequest<PublicBuildingForm>(`/api/public/buildings/${slug}/form/`),
    retry: false,
  })

  if (formQuery.isPending) return <PageMessage message="Loading entrance form…" />
  if (formQuery.isError) return <PageMessage severity="error" message="No entrance form is available for this building." />
  return <EntranceForm form={formQuery.data} />
}

function EntranceForm({ form }: { form: PublicBuildingForm }) {
  const validationSchema = schemaFor(form.schema)
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Record<string, string>>({
    resolver: zodResolver(validationSchema),
    defaultValues: Object.fromEntries(form.schema.map((field) => [field.id, ''])),
  })
  const submission = useMutation({
    mutationFn: (data: Record<string, string>) => apiRequest('/api/public/submissions/', {
      method: 'POST',
      body: JSON.stringify({ form: form.id, data }),
    }),
    onSuccess: () => reset(),
  })

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Stack component="form" spacing={3} onSubmit={handleSubmit((data) => submission.mutate(data))}>
            <Box>
              <Typography color="text.secondary">{form.building}</Typography>
              <Typography component="h1" variant="h4">{form.name}</Typography>
              {form.description ? <Typography sx={{ mt: 1 }}>{form.description}</Typography> : null}
            </Box>
            {submission.isSuccess ? <Alert severity="success">Entry information saved.</Alert> : null}
            {submission.error ? <Alert severity="error">{submission.error.message}</Alert> : null}
            {form.schema.map((field) => (
              <Controller
                key={field.id}
                name={field.id}
                control={control}
                render={({ field: input }) => field.type === 'street' ? (
                  <Autocomplete
                    freeSolo
                    options={[]}
                    value={input.value}
                    onInputChange={(_, value) => input.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={field.label}
                        required={field.validation.required}
                        autoComplete="street-address"
                        error={Boolean(errors[field.id])}
                        helperText={errors[field.id]?.message}
                      />
                    )}
                  />
                ) : (
                  <TextField
                    {...input}
                    label={field.label}
                    required={field.validation.required}
                    error={Boolean(errors[field.id])}
                    helperText={errors[field.id]?.message}
                    inputProps={{ inputMode: field.type === 'cpf' ? 'numeric' : 'text' }}
                    onChange={(event) => input.onChange(field.type === 'cpf' ? cpfMask(event.target.value) : event.target.value)}
                  />
                )}
              />
            ))}
            <Button type="submit" variant="contained" disabled={submission.isPending}>
              {submission.isPending ? 'Saving…' : 'Submit'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}

function PageMessage({ message, severity = 'info' }: { message: string; severity?: 'info' | 'error' }) {
  return <Container maxWidth="sm" sx={{ py: 6 }}><Alert severity={severity}>{message}</Alert></Container>
}
