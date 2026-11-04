export const compactMoney = new Intl.NumberFormat('en-GH', { notation: 'compact', maximumFractionDigits: 1 })

const niceStep = (raw: number) => {
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 2.5, 5, 10].map((multiplier) => multiplier * magnitude).find((step) => step >= raw) ?? magnitude * 10
}

/** Evenly spaced axis ticks with round values, topping out slightly above the peak. */
export const buildTicks = (peak: number, tickCount = 4) => {
  const step = niceStep((peak * 1.08) / tickCount)
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => ({
    value: step * index,
    percent: (index / tickCount) * 100,
  }))

  return { ceiling: step * tickCount, ticks }
}
