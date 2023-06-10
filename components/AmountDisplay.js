import { ethers } from 'ethers'

export default function AmountDisplay({ value, decimals = 6, size = 'sm' }) {
  const amount = ethers.utils.formatUnits(value, decimals)
  const [int, decimal] = amount.split('.')
  if (decimal?.length > 2) {
    return (
      <span>{int}.<span className={size === 'xs' ? 'text-xs': 'text-sm'}>{decimal}</span></span>
    )
  }
  return amount
}