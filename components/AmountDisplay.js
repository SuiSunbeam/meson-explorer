import { ethers } from 'ethers'

export default function AmountDisplay({ value, decimals = 6 }) {
  const amount = ethers.utils.formatUnits(value, decimals)
  const [int, decimal] = amount.split('.')
  if (decimal?.length > 2) {
    return <span>{int}.<span className='text-sm'>{decimal}</span></span>
  }
  return amount
}