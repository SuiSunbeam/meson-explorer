import Link from 'next/link'
import { ethers } from 'ethers'
import { parseNetworkAndToken } from '../lib/swap'

function SwapRow({ swap }) {
  const from = parseNetworkAndToken(swap.inChain, swap.inToken)
  const to = parseNetworkAndToken(swap.outChain, swap.outToken)
  if (!from || !to) {
    return null
  }

  return (
    <div>
      <Link href={`/swap/${swap._id}`}><a>{swap._id}</a></Link>
      {' '}
      <span>{swap.status}</span>
      {' '}
      <span>{ethers.utils.formatUnits(swap.amount, 6)}</span>
      {' '}
      <span>
        <a href={`${from.explorer}/token/${from.token.addr}`} target='_blank'>
          {from.networkAlias}{' '}{from.token.symbol}
        </a>
      </span>
      {' -> '}
      <span>
        <a href={`${to.explorer}/token/${to.token.addr}`} target='_blank'>
          {to.networkAlias}{' '}{to.token.symbol}
        </a>
      </span>
      {' '}
      <span>{swap.initiator}</span>
      {' -> '}
      <span>{swap.recipient}</span>
    </div>
  )
}

export default function SwapList({ swaps, error }) {
  if (error) {
    return <p>{error}</p>
  } else if (!swaps) {
    return 'loading...'
  }
  return (
    <div>
      <p>swaps</p>
      {swaps.map(swap => <SwapRow key={swap._id} swap={swap} />)}
    </div>
  )
}

export async function getStaticProps() {
  const props = {}
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/swap`)
    if (res.status >= 400) {
      props.error = 'Bad request'
    } else {
      const json = await res.json()
      if (json.result) {
        props.swaps = json.result
      } else {
        props.error = json.error.message
      }
    }
  } catch (e) {
    console.warn(e)
    props.error = e.message
  }
  return { props, revalidate: 10 }
}
