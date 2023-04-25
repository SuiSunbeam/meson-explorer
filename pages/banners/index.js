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

const iconOptions = [
  { id: 'icon-gift', name: 'Gift' },
  { id: 'icon-toast-exclamation#warning', name: 'Warning' },
]

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
        { name: 'status / id / title', width: '60%', className: 'pl-4 md:pl-6' },
        { name: 'params', width: '25%' },
        { name: 'modals', width: '5%' },
        { name: 'priority', width: '5%' },
        { name: 'edit', width: '5%', className: 'text-right' },
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
        <div>[{iconOptions.find(item => item.id === icon)?.name}] {title}</div>
      </Td>
      <Td size='sm' className='font-mono text-xs'>
      {
        Object.entries(params).map(([k, v], i) => (
          <div key={i}><span className='text-gray-500'>{k}:</span> <span>{v}</span></div>
        ))
      }
      </Td>
      <Td>{modals?.length}</Td>
      <Td>{priority}</Td>
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
  const [status, setStatus] = React.useState(0)
  const [icon, setIcon] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [modals, setModals] = React.useState([])
  const [paramsValue, setParamsValue] = React.useState('')

  const [bannerModalData, setBanenrModalData] = React.useState(null)

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      setBannerId(data._id || '')
      setStatus(data.disabled ? 0 : data.online ? 2 : 1)
      setIcon(data.icon || '')
      setTitle(data.title || '')
      setModals(data.modals || [])
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
      modals,
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
      <div className='grid grid-cols-8 gap-x-4 gap-y-4'>
        <Input
          className='col-span-5'
          id='bannerId'
          label='ID'
          value={bannerId}
          onChange={setBannerId}
          disabled={!create}
        />
        <div className='col-span-3'>
          <label className='block text-sm font-medium text-gray-700'>Status</label>
          <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
            <Select
              className='w-full'
              noBorder
              options={[{ id: 2, name: '🟢 Online' }, { id: 1, name: '🟠 Prerelease' }, { id: 0, name: '🚫 Disabled' }]}
              value={status}
              onChange={setStatus}
            />
          </div>
        </div>

        <div className='col-span-1'>
          <label className='block text-sm font-medium text-gray-700'>Icon</label>
          <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
            <Select
              className='w-full'
              noBorder
              options={iconOptions}
              value={icon}
              onChange={setIcon}
            />
          </div>
        </div>
        <Input
          className='col-span-7'
          id='title'
          label='Title'
          value={title}
          onChange={setTitle}
        />

        <div className='col-span-4'>
          <label className='block text-sm font-medium text-gray-700'>Modals</label>
          <div className='mt-1 flex flex-row gap-2'>
            {
              modals?.map((data, i) => (
                <Button key={`modal-${i}`} rounded size='sm' color='info' onClick={() => setBanenrModalData(data)}>
                  {data._id || `Modal ${i}`}
                </Button>
              ))
            }
            <Button rounded size='sm' color='primary' onClick={() => setBanenrModalData({})}>Add</Button>
          </div>
        </div>

        <Input
          className='col-span-4'
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

      <EditBannerModalModal data={bannerModalData} onClose={() => setBanenrModalData()} onChange={setModals} />
    </Modal>
  )
}

function EditBannerModalModal ({ data, onClose, onChange }) {
  const [create, setCreate] = React.useState(false)

  const [modalId, setModalId] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [image, setImage] = React.useState('')
  const [content, setContent] = React.useState('')
  const [buttons, setButtons] = React.useState([])

  const [modalButtonData, setModalButtonData] = React.useState(null)

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      setModalId(data._id || '')
      setTitle(data.title || '')
      setImage(data.image || '')
      setContent(data.content || '')
      setButtons(data.buttons || [])
    }
  }, [data])

  const onSave = async () => {
    const newData = {
      _id: modalId,
      title,
      image,
      content,
      buttons,
    }

    if (create) {
      onChange(prev => [...prev, newData])
    } else {
      onChange(prev => prev.map(d => d === data ? newData : d))
    }
    onClose(true)
  }

  const onDelete = () => {
    onChange(prev => prev.filter(d => d !== data))
    onClose(true)
  }

  return (
    <Modal
      isOpen={!!data}
      size='lg'
      title='Edit/Create a Banner Modal'
      onClose={onClose}
    >
      <div className='grid grid-cols-6 gap-x-4 gap-y-4'>
        <Input
          className='col-span-2'
          id='modalId'
          label='ID'
          value={modalId}
          onChange={setModalId}
        />

        <Input
          className='col-span-4'
          id='image'
          label='Image'
          value={image}
          onChange={setImage}
        />

        <Input
          className='col-span-6'
          id='title'
          label='Title'
          value={title}
          onChange={setTitle}
        />

        <Input
          className='col-span-6'
          id='content'
          label='Content'
          type='textarea'
          rows={16}
          value={content}
          onChange={setContent}
        />

        <div className='col-span-6'>
          <label className='block text-sm font-medium text-gray-700'>Buttons</label>
          <div className='mt-1 flex flex-row gap-2'>
            {
              buttons?.map((data, i) => (
                <Button key={`btn-${i}`} rounded size='sm' color='info' onClick={() => setModalButtonData(data)}>
                  {data.text || `Button ${i}`}
                </Button>
              ))
            }
            <Button rounded size='sm' color='primary' onClick={() => setModalButtonData({})}>Add</Button>
          </div>
        </div>
      </div>

      <div className='flex justify-between mt-6'>
        <Button rounded color='error' onClick={onDelete}>Delete</Button>
        <Button rounded color='info' onClick={onSave}>Save</Button>
      </div>

      <EditBannerModalButtonModal data={modalButtonData} onClose={() => setModalButtonData()} onChange={setButtons} />
    </Modal>
  )
}

function EditBannerModalButtonModal ({ data, onClose, onChange }) {
  const [create, setCreate] = React.useState(false)

  const [text, setText] = React.useState('')
  const [size, setSize] = React.useState('')
  const [color, setColor] = React.useState('')
  const [href, setHref] = React.useState('')
  const [modal, setModal] = React.useState('')

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      setText(data.text || '')
      setSize(data.size || '')
      setColor(data.color || '')
      setHref(data.href || '')
      setModal(typeof data.modal === 'number' ? data.modal.toString() : '')
    }
  }, [data])

  const onSave = async () => {
    const newData = { text }
    if (size) {
      newData.size = size
    }
    if (color) {
      newData.color = color
    }
    if (href) {
      newData.href = href
      if (modal) {
        window.alert('Cannot not set open modal on click when a link is given')
        return
      }
    }
    if (modal) {
      newData.modal = Number(modal)
    }

    if (create) {
      onChange(prev => [...prev, newData])
    } else {
      onChange(prev => prev.map(d => d === data ? newData : d))
    }
    onClose(true)
  }

  const onDelete = () => {
    onChange(prev => prev.filter(d => d !== data))
    onClose(true)
  }

  return (
    <Modal
      isOpen={!!data}
      title='Edit/Create a Banner Modal Button'
      onClose={onClose}
    >
      <div className='grid grid-cols-6 gap-x-4 gap-y-4'>
        <Input
          className='col-span-6'
          id='text'
          label='Button text'
          value={text}
          onChange={setText}
        />

        <div className='col-span-3'>
          <label className='block text-sm font-medium text-gray-700'>Size</label>
          <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
            <Select
              className='w-full'
              noBorder
              options={[{ id: '', name: 'Regular' }, { id: 'sm', name: 'Small' }]}
              value={size}
              onChange={setSize}
            />
          </div>
        </div>

        <div className='col-span-3'>
          <label className='block text-sm font-medium text-gray-700'>Color</label>
          <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
            <Select
              className='w-full'
              noBorder
              options={[{ id: '', name: 'Regular' }, { id: 'outline', name: 'Outline' }]}
              value={color}
              onChange={setColor}
            />
          </div>
        </div>

        <Input
          className='col-span-6'
          id='href'
          label='Open link on click'
          value={href}
          onChange={setHref}
        />

        <Input
          className='col-span-6'
          id='modal'
          label='Open another modal on click (provide index)'
          value={modal}
          onChange={setModal}
        />
      </div>

      <div className='flex justify-between mt-6'>
        <Button rounded color='error' onClick={onDelete}>Delete</Button>
        <Button rounded color='info' onClick={onSave}>Save</Button>
      </div>
    </Modal>
  )
}