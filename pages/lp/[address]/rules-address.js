import React from 'react'

import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Table from 'components/Table'
import Button from 'components/Button'

import fetcher from 'lib/fetcher'

import { SwapRuleModal, RowSwapRule } from './components'

const hides = ['premium', 'gas']
export default function RulesAddress () {
  const router = useRouter()
  const { address } = router.query

  const { data, error, mutate } = useSWR('admin/rules?type=address', fetcher)
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
        { name: 'limit', width: '8%' },
        { name: 'factor', width: '7%' },
        { name: 'fee rule', width: '10%' },
        { name: '', width: '0%' },
        { name: 'initiator', width: '50%' },
        { name: 'mark', width: '10%' },
        { name: 'edit', width: '5%', className: 'text-right' },
      ]}>
        {data.map((d, i) => <RowSwapRule key={i} d={d} hides={hides} onOpenModal={d => setModalData(d)} />)}
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
          { key: 'rules-gas', name: 'Rules (Gas)', onClick: () => router.push(`/lp/${address}/rules-gas`) },
          { key: 'rules-token', name: 'Rules (Token)', onClick: () => router.push(`/lp/${address}/rules-token`) },
          { key: 'rules-address', name: 'Rules (Address)', active: true }
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
