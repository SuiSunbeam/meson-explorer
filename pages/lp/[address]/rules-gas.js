import React from 'react'

import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Table from 'components/Table'
import Button from 'components/Button'

import fetcher from 'lib/fetcher'

import { SwapRuleModal, RowSwapRule } from './components'

const hides = ['factor', 'initiator']
export default function RulesGas () {
  const router = useRouter()
  const { address } = router.query

  const { data, error, mutate } = useSWR('https://relayer.meson.fi/api/v1/rules/0x666d6b8a44d226150ca9058beebafe0e3ac065a2', fetcher)
  const [modalData, setModalData] = React.useState()

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        { name: 'route / priority', width: '15%', className: 'pl-4 md:pl-6' },
        { name: 'limit', width: '5%' },
        { name: 'fee rule', width: '10%' },
        { name: '', width: '5%' },
        {
          name: (
            <div className='flex flex-row gap-2'>
              <div className='flex-1 shrink-0'>gas fee</div>
              <div>=</div>
              <div className='flex-[1.2] shrink-0'>gas usage</div>
              <div>*</div>
              <div className='flex-[1.4] shrink-0'>gas price</div>
              <div>*</div>
              <div className='flex-[1.4] shrink-0'>token price</div>
            </div>
          ),
          width: '50%'
        },
        { name: 'premium', width: '5%' },
        { name: 'mark', width: '5%' },
        { name: 'edit', width: '5%', className: 'text-right' },
      ]}>
        {data.rules.filter(r => r.type === 'gas').map((d, i) => <RowSwapRule key={i} d={d} hides={hides} onOpenModal={d => setModalData(d)} />)}
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle
        title='LP'
        subtitle={address}
        right={<Button size='sm' color='primary' rounded onClick={() => setModalData({})}>New Swap Rule</Button>}
        tabs={[
          { key: 'liquidity', name: 'Liquidity', onClick: () => router.push(`/lp/${address}`) },
          { key: 'rules-gas', name: 'Rules (Gas)', active: true },
          { key: 'rules-token', name: 'Rules (Token)', onClick: () => router.push(`/lp/${address}/rules-token`) },
          { key: 'rules-address', name: 'Rules (Address)', onClick: () => router.push(`/lp/${address}/rules-address`) }
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
