import { ethers } from 'ethers'

export default function SwapAmount({ msn, value }) {
  const amount = ethers.utils.formatUnits(value, msn ? 4 : 6)
  const [int, decimal] = amount.split('.')
  if (decimal?.length > 2) {
    return <span>{int}.<span className='text-sm'>{decimal}</span></span>
  }
  return amount
}