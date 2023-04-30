import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { utils } from 'ethers'
import { MinusCircleIcon, PencilIcon } from '@heroicons/react/solid'
import {
  CurrencyDollarIcon,
  LockClosedIcon,
  GiftIcon,
  AtSymbolIcon,
  ChatIcon,
} from '@heroicons/react/outline'

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
import { abbreviate, presets } from 'lib/swap'
import useDealer from 'lib/useDealer'

import PodAbi from './abi/Pod.json'

export default function LpWhitelist() {
  const router = useRouter()

  const { data, mutate } = useSWR(`admin/whitelist`, fetcher)
  const [modalData, setModalData] = React.useState()
  const dealer = useDealer()

  const podContract = React.useMemo(() => {
    if (dealer) {
      const cfxNetwork = presets.getNetwork('cfx')
      const mesonClient = dealer._createMesonClient(cfxNetwork)
      const podToken = presets.getTokenByCategory('cfx', 'pod')
      return mesonClient.getContractInstance(podToken.addr, PodAbi)
    }
  }, [dealer])

  let body = <CardBody><LoadingScreen /></CardBody>
  if (data) {
    const total = data.filter(d => !d.test).reduce(({ quota, deposit }, row) => ({
      quota: row.quota + quota,
      deposit: row.deposit + deposit,
    }), { quota: 0, deposit: 0 })
    body = (
      <CardBody>
        <Table
          fixed
          size='lg'
          headers={[
            { name: 'Account', width: '30%' },
            { name: 'Deposit / Quota', width: '18%' },
            { name: 'Onchain Balance', width: '18%' },
            { name: 'Contact', width: '15%' },
            { name: 'Country', width: '7%' },
            { name: 'Note', width: '5%' },
            { name: 'Edit', width: '7%', className: 'text-right' },
          ]}
        >
          <WhitelistedTotal quota={total.quota} deposit={total.deposit} />
          {data.map((d, index) => <WhitelistedAddrRow key={`row-${index}`} {...d} podContract={podContract} onOpenModal={() => setModalData(d)} />)}
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

const fmt = Intl.NumberFormat('en', { minimumFractionDigits: 6 })

function WhitelistedTotal ({ quota, deposit }) {
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-2 font-medium'>
        Total
      </Td>
      <Td className='font-bold'>
        <NumberDisplay className='underline' value={fmt.format(utils.formatUnits(deposit, 6))} length={9} />
        <NumberDisplay value={fmt.format(utils.formatUnits(quota, 6))} length={9} decimals={0} />
      </Td>
      <Td className='font-bold'>
      </Td>
      <Td></Td>
      <Td></Td>
      <Td></Td>
      <Td></Td>
    </tr>
  )
}

function WhitelistedAddrRow ({ _id: addr, test, name, quota = 0, deposit = 0, kyc, podContract, onOpenModal }) {
  const [podBalance, setPodBalance] = React.useState()
  const [lockedBalance, setLockedBalance] = React.useState()
  const [rewardsBalance, setRewardsBalance] = React.useState()

  React.useEffect(() => {
    if (!podContract) {
      return
    }

    podContract.balanceOf(addr)
      .then(setPodBalance)

    podContract.getLockedBalance(addr)
      .then(setLockedBalance)
      .catch(err => console.warn(err))
    
    podContract.getTotalRewards(addr)
      .then(setRewardsBalance)
      .catch(err => console.warn(err))
  }, [podContract, addr])

  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-2'>
        <div className='flex items-center'>
          {test && <MinusCircleIcon className='w-4 h-4 text-gray-500 mr-1' aria-hidden='true' />}
          {name}
        </div>
        <ExternalLink
          size='xs'
          href={`/address/${addr}`}
          className='flex items-center font-mono'
        >
          {addr}
        </ExternalLink>
      </Td>
      <Td>
        <NumberDisplay className='underline' value={fmt.format(utils.formatUnits(deposit, 6))} length={9} />
        <NumberDisplay value={fmt.format(utils.formatUnits(quota, 6))} length={9} decimals={0} />
      </Td>
      <Td size='sm'>
        <div className='flex items-center'>
          <CurrencyDollarIcon className='w-4 h-4 text-gray-500 mr-1' />
          <NumberDisplay value={fmt.format(utils.formatUnits(podBalance || '0', 6))} length={7} />
        </div>
        <div className='flex items-center'>
          <LockClosedIcon className='w-4 h-4 text-gray-500 mr-1' />
          <NumberDisplay value={fmt.format(utils.formatUnits(lockedBalance || '0', 6))} length={7} />
        </div>
        <div className='flex items-center'>
          <GiftIcon className='w-4 h-4 text-gray-500 mr-1' />
          <NumberDisplay value={fmt.format(utils.formatUnits(rewardsBalance || '0', 6))} length={7} />
        </div>
      </Td>
      <Td size='sm'>
      {
        kyc?.email &&
        <div className='flex items-center'>
          <AtSymbolIcon className='w-4 h-4 text-gray-500 mr-1' aria-hidden='true' />
          {kyc?.email}
        </div>
      }
      {
        kyc?.discord &&
        <div className='flex items-center'>
          <ChatIcon className='w-4 h-4 text-gray-500 mr-1' aria-hidden='true' />
          {kyc?.discord}
        </div>
      }
      </Td>
      <Td size='sm'>{kyc?.country}</Td>
      <Td size='sm'>{kyc?.note}</Td>
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

  const [email, setEmail] = React.useState('')
  const [discord, setDiscord] = React.useState('')
  const [country, setCountry] = React.useState('')
  const [note, setNote] = React.useState('')

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      setAddress(data._id || '')
      setName(data.name || '')
      setQuota(utils.formatUnits(data.quota || 0, 9))

      setEmail(data.kyc?.email || '')
      setDiscord(data.kyc?.discord || '')
      setCountry(data.kyc?.country || '')
      setNote(data.kyc?.note || '')
    }
  }, [data])

  const onSave = async () => {
    const dataToSave = {
      name,
      quota: utils.parseUnits(quota, 9).toString(),
      kyc: { email, discord, country, note }
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

        <Input
          id='email'
          label='Email'
          value={email}
          onChange={setEmail}
        />
        <Input
          id='discord'
          label='Discord'
          value={discord}
          onChange={setDiscord}
        />
        <Input
          id='country'
          label='Country'
          value={country}
          onChange={setCountry}
        />
        <Input
          id='note'
          label='Extra Note'
          value={note}
          onChange={setNote}
        />
      </div>

      <div className='flex justify-between mt-6'>
        <Button rounded color='error' onClick={onDelete}>Delete</Button>
        <Button rounded color='info' onClick={onSave}>Save</Button>
      </div>
    </Modal>
  )
}
