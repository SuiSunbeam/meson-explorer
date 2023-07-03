import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'
import { TrashIcon } from '@heroicons/react/solid'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Modal from 'components/Modal'
import Input from 'components/Input'
import Table, { Td } from 'components/Table'
import Button from 'components/Button'
import Badge from 'components/Badge'

import fetcher from 'lib/fetcher'
import { abbreviate } from 'lib/swap'

export default function GiveAwayList() {
  const router = useRouter()

  const { data, error, mutate } = useSWR('admin/premium/give-away', fetcher)
  const [isModalOpen, setModalOpen] = React.useState()
  
  const onDelete = async address => {
    await fetcher.delete('admin/premium/give-away', { address })
    mutate()
  }

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        { name: 'address', width: '50%' },
        { name: 'redeemed', width: '40%' },
        { name: 'delete', width: '10%', className: 'text-right' },
      ]}>
        {data.map((row, i) => <GiveAwayRow key={i} data={row} onDelete={onDelete} />)}
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Premiums'
        right={<Button size='sm' color='primary' rounded onClick={() => setModalOpen(true)}>Add</Button>}
        tabs={[
          { key: 'stats', name: 'Daily Stats', onClick: () => router.push('/premium') },
          { key: 'list', name: 'List', onClick: () => router.push('/premium/list') },
          { key: 'redeem', name: 'Redeems', onClick: () => router.push('/premium/redeem') },
          { key: 'giveaway', name: 'Give Aways', active: true }
        ]}
      />
      <CardBody>{body}</CardBody>
      <NewGiveAwayModal
        isOpen={isModalOpen}
        onClose={refresh => {
          setModalOpen(false)
          refresh && mutate()
        }}
      />
    </Card>
  )
}

function GiveAwayRow ({ data, onDelete }) {
  const { address, confirmed } = data
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1'>
        <div className='text-primary hover:underline'>
          <Link href={`/premium/${address}`}>{abbreviate(address, 6)}</Link>
        </div>
      </Td>
      <Td size='sm'>{confirmed && <Badge type='info'>REDEEMED</Badge>}</Td>
      <Td size='sm' className='text-right'>
        <Button rounded size='xs' color='error' onClick={() => onDelete(address)}>
          <TrashIcon className='w-4 h-4' aria-hidden='true' />
        </Button>
      </Td>
    </tr>
  )
}

function NewGiveAwayModal ({ isOpen, onClose }) {
  const [value, setValue] = React.useState('')

  const onConfirm = async () => {
    const body = value.trim().split('\n')
    await fetcher.post('admin/premium/give-away', body)
    setValue('')
    onClose(true)
  }

  return (
    <Modal
      isOpen={isOpen}
      title='Add Premium Give Aways'
      onClose={onClose}
    >
      <Input
        label='Addresses'
        type='textarea'
        placeholder='one address each line'
        value={value}
        onChange={setValue}
      />
      <div className='flex justify-between mt-6'>
        <Button rounded color='info' onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  )
}
