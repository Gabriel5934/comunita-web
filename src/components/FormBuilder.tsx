import {
  Alert, Button, Card, CardContent, FormControlLabel, IconButton,
  MenuItem, Stack, Switch, TextField, Typography,
} from '@mui/material'
import { useState } from 'react'
import type { FieldType, FormField } from '../lib/types'

const fieldTypes: Array<{ value: FieldType; label: string }> = [
  { value: 'name', label: 'Name' },
  { value: 'street', label: 'Street' },
  { value: 'rg', label: 'RG' },
  { value: 'cpf', label: 'CPF' },
]

type Props = {
  buildingId: number
  onSave: (form: { building: number; name: string; description: string; schema: FormField[] }) => Promise<void>
}

export function FormBuilder({ buildingId, onSave }: Props) {
  const [name, setName] = useState('Entrance form')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  function addField() {
    setFields((current) => [...current, {
      id: crypto.randomUUID(),
      label: 'New field',
      type: 'name',
      validation: { required: false },
    }])
  }

  function updateField(id: string, patch: Partial<FormField>) {
    setFields((current) => current.map((field) => field.id === id ? { ...field, ...patch } : field))
  }

  async function save() {
    setError(undefined)
    if (!name.trim() || fields.length === 0 || fields.some((field) => !field.label.trim())) {
      setError('Add a form name and at least one labeled field.')
      return
    }
    setSaving(true)
    try {
      await onSave({ building: buildingId, name: name.trim(), description: description.trim(), schema: fields })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save form')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h5">Form builder</Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField label="Form name" value={name} onChange={(event) => setName(event.target.value)} />
          <TextField label="Description" multiline value={description} onChange={(event) => setDescription(event.target.value)} />
          {fields.map((field) => (
            <Stack key={field.id} direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                fullWidth
                label="Field label"
                value={field.label}
                onChange={(event) => updateField(field.id, { label: event.target.value })}
              />
              <TextField
                select
                label="Type"
                value={field.type}
                onChange={(event) => updateField(field.id, { type: event.target.value as FieldType })}
                sx={{ minWidth: 150 }}
              >
                {fieldTypes.map((type) => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}
              </TextField>
              <FormControlLabel
                control={<Switch checked={field.validation.required} onChange={(event) => updateField(field.id, { validation: { required: event.target.checked } })} />}
                label="Required"
              />
              <IconButton aria-label={`Remove ${field.label}`} onClick={() => setFields((current) => current.filter((item) => item.id !== field.id))}>
                ×
              </IconButton>
            </Stack>
          ))}
          <Stack direction="row" spacing={2}>
            <Button onClick={addField}>Add field</Button>
            <Button variant="contained" onClick={save} disabled={saving || fields.length === 0}>
              {saving ? 'Saving…' : 'Save form'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
