import {
  AppBar, Alert, Box, Button, Container, FormControl, InputLabel,
  MenuItem, Select, Stack, TextField, Toolbar, Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { FormBuilder } from '../components/FormBuilder'
import { apiRequest } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Building, BuildingForm } from '../lib/types'

export const Route = createFileRoute('/_authenticated/home')({ component: HomePage })

const SELECTED_BUILDING_KEY = 'comunita.selectedBuilding'

function HomePage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(() => Number(localStorage.getItem(SELECTED_BUILDING_KEY)) || 0)
  const [buildingName, setBuildingName] = useState('')
  const [cep, setCep] = useState('')

  const buildingsQuery = useQuery({
    queryKey: ['buildings'],
    queryFn: () => apiRequest<Building[]>('/api/buildings/', {}, auth),
  })
  const formsQuery = useQuery({
    queryKey: ['forms'],
    queryFn: () => apiRequest<BuildingForm[]>('/api/forms/', {}, auth),
  })

  const buildings = buildingsQuery.data ?? []
  const selectedBuilding = buildings.find((building) => building.id === selectedId) ?? buildings[0]
  const latestForm = formsQuery.data?.find((form) => form.building === selectedBuilding?.id)

  const createBuilding = useMutation({
    mutationFn: () => apiRequest<Building>('/api/buildings/', {
      method: 'POST',
      body: JSON.stringify({
        name: buildingName,
        addresses: cep ? [{ cep }] : [],
      }),
    }, auth),
    onSuccess: async (building) => {
      localStorage.setItem(SELECTED_BUILDING_KEY, String(building.id))
      setSelectedId(building.id)
      setBuildingName('')
      setCep('')
      await queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })

  async function saveForm(payload: { building: number; name: string; description: string; schema: BuildingForm['schema'] }) {
    await apiRequest('/api/forms/', { method: 'POST', body: JSON.stringify(payload) }, auth)
    await queryClient.invalidateQueries({ queryKey: ['forms'] })
  }

  function selectBuilding(id: number) {
    localStorage.setItem(SELECTED_BUILDING_KEY, String(id))
    setSelectedId(id)
  }

  async function logout() {
    auth.logout()
    queryClient.clear()
    await navigate({ to: '/login' })
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Comunita</Typography>
          {selectedBuilding ? (
            <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: 1 }}>
              <InputLabel id="building-label">Building</InputLabel>
              <Select
                labelId="building-label"
                label="Building"
                value={selectedBuilding.id}
                onChange={(event) => selectBuilding(Number(event.target.value))}
              >
                {buildings.map((building) => <MenuItem key={building.id} value={building.id}>{building.name}</MenuItem>)}
              </Select>
            </FormControl>
          ) : null}
          <Button color="inherit" onClick={logout}>Log out</Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography component="h1" variant="h4">Home</Typography>
            <Typography color="text.secondary">Signed in as {auth.user?.email}</Typography>
          </Box>
          {buildingsQuery.error ? <Alert severity="error">{buildingsQuery.error.message}</Alert> : null}
          <Stack component="form" direction={{ xs: 'column', md: 'row' }} spacing={2} onSubmit={(event) => {
            event.preventDefault()
            createBuilding.mutate()
          }}>
            <TextField required label="New building name" value={buildingName} onChange={(event) => setBuildingName(event.target.value)} />
            <TextField
              label="CEP"
              value={cep}
              inputProps={{ inputMode: 'numeric', maxLength: 8 }}
              onChange={(event) => setCep(event.target.value.replace(/\D/g, '').slice(0, 8))}
              error={Boolean(cep && cep.length !== 8)}
              helperText={cep && cep.length !== 8 ? 'CEP must have 8 digits' : 'Optional'}
            />
            <Button type="submit" variant="outlined" disabled={!buildingName.trim() || Boolean(cep && cep.length !== 8) || createBuilding.isPending}>
              Add building
            </Button>
          </Stack>
          {createBuilding.error ? <Alert severity="error">{createBuilding.error.message}</Alert> : null}
          {selectedBuilding ? (
            <>
              {latestForm ? (
                <Alert severity="info">
                  Latest form: {latestForm.name}.{' '}
                  <Link to="/liberar/$slug" params={{ slug: selectedBuilding.slug }}>Open public entrance</Link>
                </Alert>
              ) : null}
              <FormBuilder key={selectedBuilding.id} buildingId={selectedBuilding.id} onSave={saveForm} />
            </>
          ) : (
            <Alert severity="info">Create a building before creating its entrance form.</Alert>
          )}
        </Stack>
      </Container>
    </>
  )
}
