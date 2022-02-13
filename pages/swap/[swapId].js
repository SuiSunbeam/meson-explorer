import { ethers } from 'ethers'
import { parseNetworkAndToken } from '../../lib/swap'

export default function Swap({ swap, error }) {
  if (error) {
    return <p>{error}</p>
  } else if (!swap) {
    return 'loading...'
  }

  const from = parseNetworkAndToken(swap.inChain, swap.inToken)
  const to = parseNetworkAndToken(swap.outChain, swap.outToken)
  if (!from || !to) {
    return null
  }

  return (
    <div>
      <p><b>swap id:</b> {swap._id}</p>
      <p>{swap.status}</p>
      <p><b>from:</b> {from.networkName}{' '}
        <a href={`${from.explorer}/token/${from.token.addr}`} target='_blank'>
          {from.token.symbol}
        </a>
      </p>
      <p>
        <b>initiator:</b>
        <a href={`${from.explorer}/address/${swap.initiator}`} target='_blank'>
          {swap.initiator}
        </a>
      </p>
      <p><b>to:</b> {to.networkName}{' '}
        <a href={`${to.explorer}/token/${to.token.addr}`} target='_blank'>
          {to.token.symbol}
        </a>
      </p>
      <p>
        <b>recipient:</b>
        <a href={`${to.explorer}/address/${swap.recipient}`} target='_blank'>
          {swap.recipient}
        </a>
      </p>
      <p><b>amount:</b> {ethers.utils.formatUnits(swap.amount, 6)}</p>
      <p><b>fee:</b> {ethers.utils.formatUnits(swap.fee, 6)}</p>
      <p><b>expire:</b> {swap.expireTs}</p>
    </div>
  )
}

export async function getStaticProps({ params }) {
  const props = {}
  if (params.swapId) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/swap/${params.swapId}`)
      if (res.status >= 400) {
        props.error = 'Swap not found'
      } else {
        const json = await res.json()
        if (json.result) {
          props.swap = json.result
        } else {
          props.error = json.error.message
        }
      }
    } catch (e) {
      console.warn(e)
      props.error = e.message
    }
  } else {
    props.error = 'No swap id'
  }
  return { props, revalidate: 10 }
}

export async function getStaticPaths() {
  return { paths: [], fallback: true }
}
