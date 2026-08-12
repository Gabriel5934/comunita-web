export type User = { id: number; email: string }

export type Tokens = {
  access: string
  refresh: string
  user: User
}

export type Address = { id?: number; cep: string }

export type Building = {
  id: number
  name: string
  slug: string
  addresses: Address[]
  created_at: string
  updated_at: string
}

export type FieldType = 'name' | 'street' | 'rg' | 'cpf'

export type FormField = {
  id: string
  label: string
  type: FieldType
  validation: { required: boolean }
}

export type BuildingForm = {
  id: number
  building: number
  name: string
  description: string
  schema: FormField[]
  created_at: string
  updated_at: string
}

export type PublicBuildingForm = Omit<BuildingForm, 'building' | 'created_at' | 'updated_at'> & {
  building: string
  building_slug: string
}
