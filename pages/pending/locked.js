import React from 'react'

import Card, { CardTitle, CardBody } from 'components/Card'
import PagiList from 'components/PagiList'
import Table from 'components/Table'
import SwapRow from 'components/SwapRow'

export default function LockedSwapList() {
  return (
    <Card>
      <CardTitle
        title='Locked Swaps'
        subtitle='Swaps that were locked but not released'
      />
      <CardBody>
        <PagiList queryUrl='swap/locked' fallback='/pending/locked'>
          <Table size='lg' headers={[
            { name: 'swap id / time', width: '18%', className: 'hidden sm:table-cell' },
            { name: 'swap id', width: '18%', className: 'pl-4 sm:hidden' },
            { name: 'status', width: '10%', className: 'hidden sm:table-cell' },
            { name: 'from', width: '18%' },
            { name: 'to', width: '18%' },
            { name: 'amount', width: '18%' },
            { name: 'fee', width: '9%', className: 'hidden md:table-cell' },
            { name: 'duration', width: '9%', className: 'hidden lg:table-cell' }
          ]}>
            {list => list.map(row => <SwapRow key={row._id} extraMargin data={row} />)}
          </Table>
        </PagiList>
      </CardBody>
    </Card>
  )
}
