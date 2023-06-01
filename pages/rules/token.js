import React from 'react'

import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Table from 'components/Table'
import Button from 'components/Button'

import fetcher from 'lib/fetcher'

import { SwapRuleModal, RowSwapRule } from './components'

const hides = ['rules', 'initiators']
export default function RulesToken () {
  const router = useRouter()

  const { data, error, mutate } = useSWR('admin/rules?type=token', fetcher)
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
        { name: 'limit', width: '15%' },
        { name: 'factor', width: '15%' },
        { name: 'minimum', width: '15%' },
        { name: 'premium', width: '10%' },
        { name: 'mark', width: '10%' },
        { name: 'edit', width: '20%', className: 'text-right' },
      ]}>
        {data.map((d, i) => <RowSwapRule key={i} d={d} hides={hides} onOpenModal={setModalData} />)}
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Swap Rules'
        right={<Button size='sm' color='primary' rounded onClick={() => setModalData({})}>New Rule</Button>}
        tabs={[
          { key: 'gas', name: 'Gas', onClick: () => router.push(`/rules/gas`) },
          { key: 'token', name: 'Token', active: true },
          { key: 'address', name: 'Address', onClick: () => router.push(`/rules/address`) }
        ]}
      />
      <CardBody>{body}</CardBody>
      <SwapRuleModal
        type='token'
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
