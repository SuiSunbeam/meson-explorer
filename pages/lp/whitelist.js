import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { utils } from 'ethers'
import { PencilIcon } from '@heroicons/react/solid'

import Card, { CardTitle, CardBody } from 'components/Card'
import LoadingScreen from 'components/LoadingScreen'
import Table, { Td } from 'components/Table'
import Button from 'components/Button'
import ExternalLink from 'components/ExternalLink'
import NumberDisplay from 'components/NumberDisplay'
import Modal from 'components/Modal'
import Input from 'components/Input'

import { LPS } from 'lib/const'
import fetcher from 'lib/fetcher'
import { abbreviate } from 'lib/swap'

export default function LpWhitelist() {
  const router = useRouter()

  const { data, mutate } = useSWR(`admin/whitelist`, fetcher)
  const [modalData, setModalData] = React.useState()

  let body = <CardBody><LoadingScreen /></CardBody>
  if (data) {
    body = (
      <CardBody>
        <Table
          fixed
          size='lg'
          headers={[
            { name: 'Account', width: '50%' },
            { name: 'Quota', width: '20%' },
            { name: 'Deposit', width: '20%' },
            { name: 'Edit', width: '10%', className: 'text-right' },
          ]}
        >
          {data.map((d, index) => <WhitelistedAddrRow key={`row-${index}`} {...d} onOpenModal={() => setModalData(d)} />)}
        </Table>
      </CardBody>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Liquidity Providers'
        subtitle='Addresses allowed to join liquidity providing'
        tabs={[
          ...LPS.map(lp => ({
            key: lp,
            name: abbreviate(lp, 4, 0),
            onClick: () => router.push(`/lp/${lp}`)
          })),
          { key: 'whitelist', name: 'Whitelist', active: true }
        ]}
        right={
          <Button size='sm' color='primary' rounded onClick={() => setModalData({})}>New</Button>
        }
      />
      {body}
      <WhitelistEntryModal
        data={modalData}
        onClose={refresh => {
          setModalData()
          refresh && mutate()
        }}
      />
    </Card>
  )
}

const fmt = Intl.NumberFormat()

function WhitelistedAddrRow ({ _id: addr, name, quota = 0, deposit = 0, onOpenModal }) {
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-2'>
        {name}
        <ExternalLink
          size='xs'
          href={`/address/${addr}`}
          className='flex items-center font-mono'
        >
          {addr}
        </ExternalLink>
      </Td>
      <Td><NumberDisplay value={fmt.format(utils.formatUnits(quota, 6))} length={9} decimals={0} /></Td>
      <Td><NumberDisplay value={fmt.format(utils.formatUnits(deposit, 6))} /></Td>
      <Td className='text-right'>
        <Button rounded size='xs' color='info' onClick={onOpenModal}>
          <PencilIcon className='w-4 h-4' aria-hidden='true' />
        </Button>
      </Td>
    </tr>
  )
}

function WhitelistEntryModal ({ data, onClose }) {
  const [create, setCreate] = React.useState(false)

  const [address, setAddress] = React.useState('')
  const [name, setName] = React.useState('')
  const [quota, setQuota] = React.useState(0)

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      setAddress(data._id || '')
      setName(data.name || '')
      setQuota(utils.formatUnits(data.quota || 0, 9))
    }
  }, [data])

  const onSave = async () => {
    const dataToSave = {
      name,
      quota: utils.parseUnits(quota, 9).toString()
    }

    if (create) {
      dataToSave._id = address.toLowerCase()
      await fetcher.post(`admin/whitelist`, dataToSave)
    } else {
      await fetcher.put(`admin/whitelist/${address}`, dataToSave)
    }
    onClose(true)
  }

  const onDelete = async () => {
    await fetcher.delete(`admin/whitelist/${address}`)
    onClose(true)
  }

  return (
    <Modal
      isOpen={!!data}
      title='Whitelist Entry'
      onClose={onClose}
    >
      <div className='grid gap-y-4'>
        <Input
          id='address'
          label='Address'
          value={address}
          onChange={setAddress}
          disabled={!create}
        />
        <Input
          id='name'
          label='Name'
          value={name}
          onChange={setName}
        />
        <div className='relative'>
          <Input
            id='quota'
            label='Quota'
            type='number'
            value={quota}
            onChange={setQuota}
          />
          <div className='absolute top-6 right-10 h-[38px] text-sm flex items-center'>× 1000</div>
        </div>
      </div>

      <div className='flex justify-between mt-6'>
        <Button rounded color='error' onClick={onDelete}>Delete</Button>
        <Button rounded color='info' onClick={onSave}>Save</Button>
      </div>
    </Modal>
  )
}
