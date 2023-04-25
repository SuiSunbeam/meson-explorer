import React from 'react'
import { PencilIcon } from '@heroicons/react/solid'

import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Table, { Td } from 'components/Table'
import Button from 'components/Button'

import fetcher from 'lib/fetcher'

const hides = ['factor', 'initiators']
export default function Banners () {
  const router = useRouter()

  const { data, error, mutate } = useSWR('admin/banners', fetcher)
  const [modalData, setModalData] = React.useState()

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        { name: 'id', width: '3%', className: 'pl-4 md:pl-6' },
        { name: 'icon', width: '10%' },
        { name: 'title', width: '50%' },
        { name: 'params', width: '20%' },
        { name: 'modals', width: '5%', className: '!px-1' },
        { name: 'priority', width: '3%', className: '!px-1' },
        { name: 'online', width: '3%', className: '!px-1' },
        { name: 'disabled', width: '3%', className: '!px-1' },
        { name: 'edit', width: '3%', className: '!pl-1 text-right' },
      ]}>
        {data.map((d, i) => <RowBanner key={i} d={d} onOpenModal={setModalData} />)}
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Banners'
        right={<Button size='sm' color='primary' rounded onClick={() => setModalData({})}>New Banner</Button>}
      />
      <CardBody>{body}</CardBody>
      {/* <SwapRuleModal
        type='gas'
        hides={hides}
        data={modalData}
        onClose={refresh => {
          setModalData()
          refresh && mutate()
        }}
      /> */}
    </Card>
  )
}

function RowBanner({ d, setModalData }) {
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1 text-sm'>
        {d._id}
      </Td>
      <Td size='sm' className='font-mono text-xs' wrap>{d.icon}</Td>
      <Td size='sm' className='font-mono text-xs' wrap>{d.title}</Td>
      <Td size='sm' className='font-mono text-xs'>
      {
        Object.entries(d.params || {}).map(([k, v], i) => (
          <div key={i}><span className='text-gray-500'>{k}:</span> <span>{v}</span></div>
        ))
      }
      </Td>
      <Td size='narrow'>{d.modals.length}</Td>
      <Td size='narrow'>{d.priority}</Td>
      <Td size='narrow'>{d.online ? '✅' : ''}</Td>
      <Td size='narrow'>{d.disabled ? '🚫' : ''}</Td>
      <Td size='narrow' className='pr-2 sm:pr-3 text-right'>
        <Button rounded size='xs' color='info' onClick={() => onOpenModal(d)}>
          <PencilIcon className='w-4 h-4' aria-hidden='true' />
        </Button>
      </Td>
    </tr>
  )
}
