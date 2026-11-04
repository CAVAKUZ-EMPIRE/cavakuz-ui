import { prettyLabel } from '../lib/format'
import { outfitDetails, type OutfitSetup } from '../lib/outfit'

export default function OutfitSetupChips({ setup }: { setup: OutfitSetup }) {
  return (
    <div className="setup-chips">
      {outfitDetails(setup).map(([field, value]) => (
        <small className="setup-chip" key={field}>
          <b>{prettyLabel(field)}</b> {value}
        </small>
      ))}
    </div>
  )
}
