import type { InventoryItem, SaleItem } from '../types'

export type OutfitSetup = Record<string, string>

const HEADLINE_FIELDS = ['outfit_type', 'job_type']
const OPTION_FIELDS = ['size', 'tshirt_colors', 'age_group']

export const outfitHeadline = (setup: OutfitSetup) =>
  HEADLINE_FIELDS.map((field) => setup[field]).filter(Boolean).join(' · ') || 'Custom outfit'

export const outfitDetails = (setup: OutfitSetup) =>
  Object.entries(setup).filter(([field, value]) => value && !HEADLINE_FIELDS.includes(field))

export const inventorySetup = (item: InventoryItem): OutfitSetup | undefined => {
  if (item.category !== 'custom_outfit' || !item.description) return undefined
  try {
    const parsed = JSON.parse(item.description)
    const setup = parsed?.outfit_setup ?? parsed?.setup
    return setup && typeof setup === 'object' ? (setup as OutfitSetup) : undefined
  } catch {
    return undefined
  }
}

export const inventoryTitle = (item: InventoryItem) => {
  const setup = inventorySetup(item)
  return setup ? outfitHeadline(setup) : item.name
}

export const inventoryOptionLabel = (item: InventoryItem) => {
  const setup = inventorySetup(item)
  if (!setup) return item.name
  return [outfitHeadline(setup), ...OPTION_FIELDS.map((field) => setup[field])].filter(Boolean).join(' · ')
}

export const saleItemSetup = (item: SaleItem): OutfitSetup | undefined => {
  const attributes = item.attributes
  if (!attributes || typeof attributes !== 'object' || !('outfit_setup' in attributes)) return undefined
  const setup = attributes.outfit_setup
  return setup && typeof setup === 'object' ? (setup as OutfitSetup) : undefined
}
