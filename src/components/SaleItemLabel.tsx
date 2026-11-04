import { outfitHeadline, saleItemSetup } from '../lib/outfit'
import type { SaleItem } from '../types'
import OutfitSetupChips from './OutfitSetupChips'

export default function SaleItemLabel({ item }: { item: SaleItem }) {
  const setup = saleItemSetup(item)

  if (!setup) {
    const name = item.inventory?.name ?? item.product?.name
    return <strong className="line-title">{name ?? 'Item #' + (item.product_id ?? item.inventory_id ?? item.id)}</strong>
  }

  return (
    <>
      <strong className="line-title">{outfitHeadline(setup)}</strong>
      <OutfitSetupChips setup={setup} />
    </>
  )
}
