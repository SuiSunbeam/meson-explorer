import React from 'react'

import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Table from 'components/Table'
import Button from 'components/Button'

import fetcher from 'lib/fetcher'
import { RELAYERS } from 'lib/const'

import { SwapRuleModal, RowSwapRule } from './components'

const hides = ['factor', 'minimum', 'initiators']
export default function RulesGas () {
  const router = useRouter()

  const { data, error, mutate } = useSWR(`${RELAYERS[0]}/api/v1/rules/all:gas`, fetcher)
  const [modalData, setModalData] = React.useState()

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        { name: 'route / priority', width: '10%', className: 'pl-4 md:pl-6' },
        { name: 'limit', width: '5%' },
        { name: 'fee rule', width: '5%' },
        { name: '', width: '5%' },
        {
          name: (
            <div className='flex flex-row gap-2'>
              <div className='flex-1 shrink-0'>gas fee</div>
              <div>=</div>
              <div className='flex-[1.2] shrink-0'>gas usage</div>
              <div>×</div>
              <div className='flex-[1.4] shrink-0'>gas price</div>
              <div>×</div>
              <div className='flex-1 shrink-0'>core</div>
              <div>×</div>
              <div className='flex-1 shrink-0'>multipier</div>
            </div>
          ),
          width: '60%'
        },
        { name: 'premium', width: '5%' },
        { name: 'mark', width: '5%' },
        { name: 'edit', width: '5%', className: 'text-right' },
      ]}>
        {data.rules.map((d, i) => <RowSwapRule key={i} d={d} prices={data.prices} hides={hides} onOpenModal={setModalData} />)}
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Swap Rules'
        right={<Button size='sm' color='primary' rounded onClick={() => setModalData({})}>New Rule</Button>}
        tabs={[
          { key: 'gas', name: 'Gas', active: true },
          { key: 'token', name: 'Token', onClick: () => router.push(`/rules/token`) },
          { key: 'address', name: 'Address', onClick: () => router.push(`/rules/address`) }
        ]}
      />
      <CardBody>{body}</CardBody>
      <SwapRuleModal
        type='gas'
        hides={hides}
        data={modalData}
        onClose={refresh => {
          setModalData()
          refresh && mutate()
        }}
      />
    </Card>
  )
}
