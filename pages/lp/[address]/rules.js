import React from 'react'
import { PencilIcon } from '@heroicons/react/solid'

import { useRouter } from 'next/router'
import useSWR from 'swr'

import { ethers } from 'ethers'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Modal from 'components/Modal'
import Input from 'components/Input'
import Table, { Td } from 'components/Table'
import Button from 'components/Button'

import fetcher from 'lib/fetcher'

export default function SwapRuleList() {
  const router = useRouter()
  const { address } = router.query

  const { data, error, mutate } = useSWR('rules', fetcher)
  const [modalData, setModalData] = React.useState()

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        { name: 'route / priority', width: '35%', className: 'pl-4 md:pl-6' },
        { name: 'limit', width: '20%' },
        { name: 'fee rule', width: '35%' },
        { name: 'edit', width: '10%', className: 'text-right' },
      ]}>
        {data.map((d, i) => <SwapRule key={i} d={d} onOpenModal={d => setModalData(d)} />)}
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
          { key: 'rules', name: 'Swap Rules', active: true }
        ]}
      />
      <CardBody>{body}</CardBody>
      <SwapRuleModal
        data={modalData}
        onClose={refresh => {
          setModalData()
          refresh && mutate()
        }}
      />
    </Card>
  )
}

function SwapRuleModal ({ data, onClose }) {
  const [from, setFrom] = React.useState('')
  const [to, setTo] = React.useState('')
  const [priority, setPriority] = React.useState(0)
  const [limit, setLimit] = React.useState(0)
  const [fee, setFee] = React.useState('')

  React.useEffect(() => {
    if (data) {
      setFrom(data.from || '*')
      setTo(data.to || '*')
      setPriority(data.priority || 0)
      setLimit(data.limit || 0)
      setFee(JSON.stringify(data.fee, null, 2) || '[\n]')
    }
  }, [data])

  const onSave = async () => {
    const newData = { from, to, priority, limit, fee: JSON.parse(fee) }
    if (data._id) {
      await fetcher.put(`rules/${data._id}`, newData)
    } else {
      await fetcher.post(`rules`, newData)
    }
    onClose(true)
  }

  const onDelete = async () => {
    await fetcher.delete(`rules/${data._id}`)
    onClose(true)
  }

  return (
    <Modal
      isOpen={!!data}
      title='Swap Rule'
      onClose={onClose}
    >
      <div className='grid grid-cols-6 gap-x-6 gap-y-4'>
        <Input
          className='col-span-3'
          id='from'
          label='From'
          type='text'
          value={from}
          onChange={setFrom}
        />
        <Input
          className='col-span-3'
          id='to'
          label='To'
          type='text'
          value={to}
          onChange={setTo}
        />
        <Input
          className='col-span-3'
          id='priority'
          label='Priority'
          type='number'
          value={priority}
          onChange={setPriority}
        />
        <Input
          className='col-span-3'
          id='limit'
          label='Limit'
          type='number'
          value={limit}
          onChange={setLimit}
        />
        <Input
          className='col-span-6'
          id='rules'
          label='Fee Rules'
          type='textarea'
          value={fee}
          onChange={setFee}
        />
      </div>

      <div className='flex justify-between mt-6'>
        <Button rounded color='error' onClick={onDelete}>Delete</Button>
        <Button rounded color='info' onClick={onSave}>Save</Button>
      </div>
    </Modal>
  )
}

function SwapRule ({ d, onOpenModal }) {
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1'>
        <div className='flex flex-row items-center'>
          {d.from}
          <div className='text-gray-500 mx-1 text-xs'>{'->'}</div>
          {d.to}
        </div>
        <div className='text-xs text-gray-500'>
          #{d.priority}
        </div>
      </Td>
      <Td size='sm'>{d.limit}</Td>
      <Td size='sm'>{d.fee?.map((item, i) => <FeeRule key={i} {...item} />)}</Td>
      <Td size='sm' className='text-right'>
        <Button rounded size='xs' color='info' onClick={() => onOpenModal(d)}>
          <PencilIcon className='w-4 h-4' aria-hidden='true' />
        </Button>
      </Td>
    </tr>
  )
}

function FeeRule ({ min, base, rate }) {
  const range = <span className='inline-block w-8'>{min && `[>${min}]`}</span>

  const rule = []
  if (base) {
    rule.push(`$${ethers.utils.formatUnits(base, 6)}`)
  }
  if (rate) {
    rule.push(`${rate/10000}%`)
  }
  if (!rule.length) {
    rule.push('0')
  }
  return (
    <div>{range}{rule.join(' + ')}</div>
  )
}
