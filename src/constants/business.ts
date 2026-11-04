export type BusinessProfile = {
  name: string
  tagline: string
  address: string
  phone: string
  email: string
}

/** Shown in the receipt header. Empty fields are left out of the printout. */
export const BUSINESS: BusinessProfile = {
  name: 'Cavakuz Empire',
  tagline: 'Print • Design • Operations',
  address: '',
  phone: '',
  email: '',
}
