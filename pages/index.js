import Link from 'next/link'
import { ethers } from 'ethers'
import { parseNetworkAndToken, abbreviate } from '../lib/swap'

function SwapRow({ swap }) {
  const from = parseNetworkAndToken(swap.inChain, swap.inToken)
  const to = parseNetworkAndToken(swap.outChain, swap.outToken)
  if (!from || !to) {
    return null
  }

  return (
    <tr>
      <td className='px-3 py-4 whitespace-nowrap'>
        <Link href={`/swap/${swap._id}`}>
          <a className='text-sm text-indigo-600 hover:text-indigo-500 hover:underline'>
            {abbreviate(swap._id, 6)}
          </a>
        </Link>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800'>
          {swap.status}
        </span>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <span className='text-sm text-gray-900'>
          {ethers.utils.formatUnits(swap.amount, 6)}
          {' '}
          <a
            className='text-sm text-gray-900 hover:text-indigo-500 hover:underline'
            href={`${from.explorer}/token/${from.token.addr}`}
            target='_blank'
          >
            {from.networkAlias} {from.token.symbol}
          </a>
          {' -> '}
          <a
            className='text-sm text-gray-900 hover:text-indigo-500 hover:underline'
            href={`${to.explorer}/token/${to.token.addr}`}
            target='_blank'
          >
            {to.networkAlias} {to.token.symbol}
          </a>
        </span>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <span className='text-sm text-gray-900'>
          {ethers.utils.formatUnits(swap.fee, 6)} {from.token.symbol}
        </span>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <span className='text-sm text-indigo-600 hover:text-indigo-500 hover:underline'>
          <a href={`${from.explorer}/address/${swap.initiator}`} target='_blank'>
            {abbreviate(swap.initiator)}
          </a>
        </span>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <span className='text-sm text-indigo-600 hover:text-indigo-500 hover:underline'>
          <a href={`${to.explorer}/address/${swap.recipient}`} target='_blank'>
            {abbreviate(swap.recipient)}
          </a>
        </span>
      </td>
    </tr>
  )
}

export default function SwapList({ swaps, error }) {
  if (error) {
    return <p>{error}</p>
  } else if (!swaps) {
    return (
      <div className='flex items-center justify-center mt-6'>
        <svg class='animate-spin h-5 w-5 text-gray-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
          <circle class='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4'></circle>
          <path class='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
      </div>
    )
  }
  return (
    <div class='flex flex-col'>
      <div class='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
        <div class='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
          <div class='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>id</th>
                  <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>status</th>
                  <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>swap</th>
                  <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>fee</th>
                  <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>initiator</th>
                  <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>recipient</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {swaps.map(swap => <SwapRow key={swap._id} swap={swap} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
