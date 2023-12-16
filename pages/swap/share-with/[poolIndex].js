import React from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

import PagiCard from 'components/Pagi/PagiCard'
import SwapRow from 'components/SwapRow'
import Button from 'components/Button'

export default function AddressSwapList() {
  const router = useRouter()
  const poolIndex = router.query.poolIndex

  const exportSwaps = React.useCallback(() => {
    window.open(`/api/v1/swap/share-with/${poolIndex}/export`, '_blank')
  }, [poolIndex])

  return (
    <PagiCard
      title={`Fee Shared Swaps`}
      subtitle={`Shared with Pool ${poolIndex}`}
      right={<Button rounded size='sm' color='info' onClick={exportSwaps}>Export</Button>}
      queryUrl={`swap/share-with/${poolIndex}`}
      fallback={`/swap/share-with/${poolIndex}`}
      tableHeaders={[
        { name: 'swap id / time', width: '18%', className: 'hidden sm:table-cell' },
        { name: 'swap id', width: '18%', className: 'pl-4 sm:hidden' },
        { name: 'status', width: '10%', className: 'hidden sm:table-cell' },
        { name: 'from', width: '18%' },
        { name: 'to', width: '18%' },
        { name: 'amount', width: '18%' },
        { name: 'fee', width: '9%', className: 'hidden md:table-cell' },
        { name: 'duration', width: '9%', className: 'hidden lg:table-cell' }
      ]}
      Row={SwapRow}
    />
  )
}
