import React from 'react'
import { PencilIcon } from '@heroicons/react/solid'

import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Table, { Td } from 'components/Table'
import Button from 'components/Button'
import Modal from 'components/Modal'
import Input from 'components/Input'
import Select from 'components/Select'

import fetcher from 'lib/fetcher'

const hides = ['factor', 'initiators']
export default function Banners () {
  const router = useRouter()

  const { data, error, mutate } = useSWR('admin/banner', fetcher)
  const [modalData, setModalData] = React.useState()

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        { name: 'id / title', width: '60%', className: 'pl-4 md:pl-6' },
        { name: 'icon', width: '10%' },
        { name: 'params', width: '20%' },
        { name: 'modals', width: '4%', className: '!px-1' },
        { name: 'priority', width: '3%', className: '!px-1' },
        { name: 'edit', width: '3%', className: 'text-right' },
      ]}>
        {data.map((d, i) => <RowBanner key={i} {...d} onOpenModal={() => setModalData(d)} />)}
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
      <EditBannerModal
        data={modalData}
        onClose={refresh => {
          setModalData()
          refresh && mutate()
        }}
      />
    </Card>
  )
}

function RowBanner({ _id, icon, title, params = {}, modals, priority, online, disabled, onOpenModal }) {
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1 text-sm' wrap>
        <div className='text-xs text-gray-500'>{disabled ? '🚫' : online ? '🟢' : '🟠'} {_id}</div>
        <div>{title}</div>
      </Td>
      <Td size='sm' className='font-mono text-xs' wrap>{icon}</Td>
      <Td size='sm' className='font-mono text-xs'>
      {
        Object.entries(params).map(([k, v], i) => (
          <div key={i}><span className='text-gray-500'>{k}:</span> <span>{v}</span></div>
        ))
      }
      </Td>
      <Td size='narrow'>{modals?.length}</Td>
      <Td size='narrow'>{priority}</Td>
      <Td className='text-right'>
        <Button rounded size='xs' color='info' onClick={onOpenModal}>
          <PencilIcon className='w-4 h-4' aria-hidden='true' />
        </Button>
      </Td>
    </tr>
  )
}

function EditBannerModal ({ data, onClose }) {
  const [create, setCreate] = React.useState(false)

  const [bannerId, setBannerId] = React.useState('')
  const [icon, setIcon] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [paramsValue, setParamsValue] = React.useState('')
  const [status, setStatus] = React.useState(0)

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      setBannerId(data._id || '')
      setIcon(data.icon || '')
      setTitle(data.title || '')
      setStatus(data.disabled ? 0 : data.online ? 2 : 1)
      setParamsValue(Object.entries(data.params || {}).map(([k, v]) => `${k}: ${v}`).join('\n'))
    }
  }, [data])

  const onSave = async () => {
    const params = Object.fromEntries(paramsValue.split('\n').filter(Boolean).map(kv => {
      const [k, v] = kv.split(':', 2)
      return [k.trim(), v.trim()]
    }))
    const dataToSave = {
      icon,
      title,
      params,
      online: status === 2,
      disabled: status === 0,
    }

    if (create) {
      dataToSave._id = bannerId
      await fetcher.post(`admin/banner`, dataToSave)
    } else {
      await fetcher.put(`admin/banner/${bannerId}`, dataToSave)
    }
    onClose(true)
  }

  const onDelete = async () => {
    await fetcher.delete(`admin/banner/${bannerId}`)
    onClose(true)
  }

  return (
    <Modal
      isOpen={!!data}
      size='lg'
      title='Edit/Create a Banner'
      onClose={onClose}
    >
      <div className='grid grid-cols-6 gap-x-6 gap-y-4'>
        <Input
          className='col-span-2'
          id='bannerId'
          label='ID'
          value={bannerId}
          onChange={setBannerId}
          disabled={!create}
        />
        <Input
          className='col-span-2'
          id='icon'
          label='Icon'
          value={icon}
          onChange={setIcon}
        />
        <div className='col-span-2'>
          <label className='block text-sm font-medium text-gray-700'>Status</label>
          <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
            <Select
              className='w-full'
              noIcon
              noBorder
              options={[{ id: 2, name: '🟢 Online' }, { id: 1, name: '🟠 Prerelease' }, { id: 0, name: '🚫 Disabled' }]}
              value={status}
              onChange={setStatus}
            />
          </div>
        </div>
        <Input
          className='col-span-6'
          id='title'
          label='Title'
          value={title}
          onChange={setTitle}
        />
        <Input
          className='col-span-3'
          id='params'
          label='Params'
          type='textarea'
          value={paramsValue}
          onChange={setParamsValue}
        />
      </div>

      <div className='flex justify-between mt-6'>
        <Button rounded color='error' onClick={onDelete}>Delete</Button>
        <Button rounded color='info' onClick={onSave}>Save</Button>
      </div>
    </Modal>
  )
}
