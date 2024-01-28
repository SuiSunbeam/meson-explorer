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

const hides = ['minimum', 'premium']
export default function RulesAddress () {
  const router = useRouter()

  const { data, error, mutate } = useSWR(`${RELAYERS[0]}/api/v1/rules/all:address`, fetcher)
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
        { name: 'factor', width: '5%' },
        { name: 'fee rule', width: '4%' },
        { name: '', width: '1%' },
        {
          name: (
            <div className='flex flex-row gap-2'>
              <div className='flex-[1.5] shrink-0'>gas fee</div>
              <div>=</div>
              <div className='flex-[1.2] shrink-0'>gas</div>
              <div>×</div>
              <div className='flex-[2.5] shrink-0'>gas price</div>
              <div>×</div>
              <div className='flex-[2] shrink-0'>token</div>
              <div>×</div>
              <div className='flex-1 shrink-0'>multi</div>
            </div>
          ),
          width: '35%'
        },
        { name: 'initiators', width: '35%' },
        { name: 'edit', width: '5%', className: 'text-right' },
      ]}>
        {data.rules.map((d, i) => <RowSwapRule key={i} d={d} prices={data.prices} hides={hides} onOpenModal={setModalData} />)}
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Fee Rules'
        right={<Button size='sm' color='primary' rounded onClick={() => setModalData({})}>New Rule</Button>}
        tabs={[
          { key: 'network', name: 'Network', onClick: () => router.push(`/rules`) },
          { key: 'gas', name: 'Gas', onClick: () => router.push(`/rules/gas`) },
          { key: 'token', name: 'Token', onClick: () => router.push(`/rules/token`) },
          { key: 'address', name: 'Address', active: true },
        ]}
      />
      <CardBody>{body}</CardBody>
      <SwapRuleModal
        type='address'
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
