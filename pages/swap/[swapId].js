import { ethers } from 'ethers'
import { parseNetworkAndToken } from '../../lib/swap'

export default function Swap({ swapId, swap, error }) {
  if (error) {
    return (
      <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
        <div className='px-4 py-5 sm:px-6'>
          <h3 className='text-lg leading-6 font-medium text-gray-900'>Swap</h3>
          <p className='mt-1 max-w-2xl text-sm text-gray-500'>{swapId}</p>
          <span className='mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'>
            ERROR
          </span>
        </div>
        <div className='border-t border-gray-200'>
          <dl>
            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Reason</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {error}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    )
  } else if (!swap) {
    return (
      <div className='flex items-center justify-center mt-6'>
        <svg className='animate-spin h-5 w-5 text-gray-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
      </div>
    )
  }

  const from = parseNetworkAndToken(swap.inChain, swap.inToken)
  const to = parseNetworkAndToken(swap.outChain, swap.outToken)
  if (!from || !to) {
    return null
  }

  return (
    <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
      <div className='px-4 py-5 sm:px-6'>
        <h3 className='text-lg leading-6 font-medium text-gray-900'>Swap</h3>
        <p className='mt-1 max-w-2xl text-sm text-gray-500'>{swap._id}</p>
        <span className='mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800'>
          {swap.status}
        </span>
      </div>
      <div className='border-t border-gray-200'>
        <dl>
          <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
            <dt className='text-sm font-medium text-gray-500'>From</dt>
            <dd className='mt-1 text-sm text-indigo-600 hover:text-indigo-500 hover:underline sm:mt-0 sm:col-span-2'>
              <a href={`${from.explorer}/token/${from.token.addr}`} target='_blank' rel='noreferrer'>
                {from.networkName} {from.token.symbol}
              </a>
            </dd>
          </div>
          <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
            <dt className='text-sm font-medium text-gray-500'>To</dt>
            <dd className='mt-1 text-sm text-indigo-600 hover:text-indigo-500 hover:underline sm:mt-0 sm:col-span-2'>
              <a href={`${to.explorer}/token/${to.token.addr}`} target='_blank' rel='noreferrer'>
                {to.networkName} {to.token.symbol}
              </a>
            </dd>
          </div>
          <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
            <dt className='text-sm font-medium text-gray-500'>Amount</dt>
            <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
              {ethers.utils.formatUnits(swap.amount, 6)} {from.token.symbol}
            </dd>
          </div>
          <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
            <dt className='text-sm font-medium text-gray-500'>Fee</dt>
            <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
              {ethers.utils.formatUnits(swap.fee, 6)} {from.token.symbol}
            </dd>
          </div>
          <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
            <dt className='text-sm font-medium text-gray-500'>Initiator</dt>
            <dd className='mt-1 text-sm text-indigo-600 hover:text-indigo-500 hover:underline sm:mt-0 sm:col-span-2'>
              <a href={`${from.explorer}/address/${swap.initiator}`} target='_blank' rel='noreferrer'>
                {swap.initiator}
              </a>
            </dd>
          </div>
          <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
            <dt className='text-sm font-medium text-gray-500'>Recipient</dt>
            <dd className='mt-1 text-sm text-indigo-600 hover:text-indigo-500 hover:underline sm:mt-0 sm:col-span-2'>
              <a href={`${to.explorer}/address/${swap.recipient}`} target='_blank' rel='noreferrer'>
                {swap.recipient}
              </a>
            </dd>
          </div>
          <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
            <dt className='text-sm font-medium text-gray-500'>Expire</dt>
            <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
              {swap.expireTs}
            </dd>
          </div>
          {/* <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
            <dt className='text-sm font-medium text-gray-500'>Attachments</dt>
            <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
              <ul role='list' className='border border-gray-200 rounded-md divide-y divide-gray-200'>
                <li className='pl-3 pr-4 py-3 flex items-center justify-between text-sm'>
                  <div className='w-0 flex-1 flex items-center'>
                    <PaperClipIcon className='flex-shrink-0 h-5 w-5 text-gray-400' aria-hidden='true' />
                    <span className='ml-2 flex-1 w-0 truncate'>resume_back_end_developer.pdf</span>
                  </div>
                  <div className='ml-4 flex-shrink-0'>
                    <a href='#' className='font-medium text-indigo-600 hover:text-indigo-500'>
                      Download
                    </a>
                  </div>
                </li>
                <li className='pl-3 pr-4 py-3 flex items-center justify-between text-sm'>
                  <div className='w-0 flex-1 flex items-center'>
                    <PaperClipIcon className='flex-shrink-0 h-5 w-5 text-gray-400' aria-hidden='true' />
                    <span className='ml-2 flex-1 w-0 truncate'>coverletter_back_end_developer.pdf</span>
                  </div>
                  <div className='ml-4 flex-shrink-0'>
                    <a href='#' className='font-medium text-indigo-600 hover:text-indigo-500'>
                      Download
                    </a>
                  </div>
                </li>
              </ul>
            </dd>
          </div> */}
        </dl>
      </div>
    </div>
  )
}

export async function getStaticProps({ params }) {
  const props = { swapId: params.swapId }
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
