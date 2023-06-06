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
        { name: 'reward', width: '5%' },
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

function RowBanner({ _id, priority, icon, title, hide, params = {}, modals, reward, metadata, online, disabled, onOpenModal }) {
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1 text-sm' wrap>
        <div className='text-xs text-gray-500'>{disabled ? '🚫' : online ? '🟢' : '🟠'} {priority ? `[${priority}] ` : ''}{_id}</div>
        <div className={hide ? 'text-gray-500' : ''}>
          [{iconOptions.find(item => item.id === icon)?.name}] {title}
        </div>
      </Td>
      <Td size='sm' className='font-mono text-xs'>
      {
        Object.entries(params).map(([k, v], i) => (
          <div key={i}><span className='text-gray-500'>{k}:</span> <span>{v}</span></div>
        ))
      }
      </Td>
      <Td>{modals?.length}</Td>
      <Td>{reward ? `✅ ${metadata.length}` : ''}</Td>
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
  const [priority, setPriority] = React.useState('')
  const [reward, setReward] = React.useState('')
  const [status, setStatus] = React.useState(0)
  const [icon, setIcon] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [limited, setLimited] = React.useState(false)
  const [hide, setHide] = React.useState(false)
  const [modals, setModals] = React.useState([])
  const [paramsValue, setParamsValue] = React.useState('')

  const [bannerRewardData, setBannerRewardData] = React.useState(null)
  const [bannerModalData, setBanenrModalData] = React.useState(null)

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      setBannerId(data._id || '')
      setPriority(data.priority || '')
      setReward(data.reward || null)
      setStatus(data.disabled ? 0 : data.online ? 2 : 1)
      setIcon(data.icon || '')
      setTitle(data.title || '')
      setLimited(data.limited || false)
      setHide(data.hide || false)
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
      limited,
      hide,
      modals,
      reward,
      params,
      online: status === 2,
      disabled: status === 0,
    }
    if (priority) {
      dataToSave.priority = Number(priority)
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
          className='col-span-2'
          id='bannerId'
          label='ID'
          value={bannerId}
          onChange={setBannerId}
          disabled={!create}
        />
        <Input
          className='col-span-2'
          id='priority'
          label='Priority'
          value={priority}
          onChange={setPriority}
        />
        <div className='col-span-2'>
          <label className='block text-sm font-medium text-gray-700'>Reward</label>
          <div className='mt-1 flex shadow-sm rounded-md'>
            <Button
              rounded
              className='w-full font-normal'
              onClick={() => setBannerRewardData(reward || {})}
              // color='info'
            >{reward ? 'Edit Reward' : '+ Create'}</Button>
          </div>
        </div>
        <div className='col-span-2'>
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

        <div className='col-span-4 grid grid-cols-2 gap-x-4 gap-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Limited</label>
            <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
              <Select
                className='w-full'
                noBorder
                options={[{ id: false, name: 'false' }, { id: true, name: 'true' }]}
                value={limited}
                onChange={setLimited}
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Hide</label>
            <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
              <Select
                className='w-full'
                noBorder
                options={[{ id: false, name: 'false' }, { id: true, name: 'true' }]}
                value={hide}
                onChange={setHide}
              />
            </div>
          </div>
          <div className='col-span-2'>
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

      <EditBannerRewardModal data={bannerRewardData} onClose={() => setBannerRewardData()} onChange={setReward} />
      <EditBannerModalModal data={bannerModalData} onClose={() => setBanenrModalData()} onChange={setModals} />
    </Modal>
  )
}

function EditBannerRewardModal ({ data, onClose, onChange }) {
  const [create, setCreate] = React.useState(false)

  const [to, setTo] = React.useState('')
  const [condition, setCondition] = React.useState('')
  const [posterId, setPosterId] = React.useState('')
  const [posterUndertext, setPosterUndertext] = React.useState('')
  const [posterShareText, setPosterShareText] = React.useState('')

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      setTo(data.to || '')
      setCondition(data.condition || '')
      setPosterId(data.posterId || '')
      setPosterUndertext(data.posterUndertext || '')
      setPosterShareText(data.posterShareText || '')
    }
  }, [data])

  const onSave = async () => {
    const newData = { to }
    if (condition) {
      newData.condition = condition
    }
    if (posterId) {
      newData.posterId = posterId
      newData.posterUndertext = posterUndertext
      newData.posterShareText = posterShareText
    }

    onChange(newData)
    onClose(true)
  }

  const onDelete = () => {
    onChange(null)
    onClose(true)
  }

  return (
    <Modal
      size='lg'
      isOpen={!!data}
      title={(create ? 'Create' : 'Edit') + ' Banner Reward'}
      onClose={onClose}
    >
      <div className='grid grid-cols-6 gap-x-4 gap-y-4'>
        <div className='col-span-2'>
          <label className='block text-sm font-medium text-gray-700'>Reward To</label>
          <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
            <Select
              className='w-full'
              noBorder
              options={[{ id: '', name: 'None' }, { id: 'sender', name: 'Sender' }, { id: 'recipient', name: 'Recipient' }]}
              value={to}
              onChange={setTo}
            />
          </div>
        </div>

        <Input
          className='col-span-4'
          id='condition'
          label='Condition'
          value={condition}
          onChange={setCondition}
        />

        <Input
          className='col-span-6'
          id='posterId'
          label='Poster ID'
          value={posterId}
          onChange={setPosterId}
        />
        <Input
          className='col-span-3'
          id='posterUndertext'
          label='Poster Undertext'
          type='textarea'
          rows={10}
          value={posterUndertext}
          onChange={setPosterUndertext}
        />
        <Input
          className='col-span-3'
          id='posterShareText'
          label='Poster ShareText'
          type='textarea'
          rows={10}
          value={posterShareText}
          onChange={setPosterShareText}
        />
      </div>

      <div className='flex justify-between mt-6'>
        <Button rounded color='error' onClick={onDelete}>Delete</Button>
        <Button rounded color='info' onClick={onSave}>Save</Button>
      </div>
    </Modal>
  )
}

function EditBannerModalModal ({ data, onClose, onChange }) {
  const [create, setCreate] = React.useState(false)

  const [modalId, setModalId] = React.useState('')
  const [open, setOpen] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [image, setImage] = React.useState('')
  const [content, setContent] = React.useState('')
  const [buttons, setButtons] = React.useState([])

  const [modalButtonData, setModalButtonData] = React.useState(null)

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      setModalId(data._id || '')
      setOpen(data.open || '')
      setTitle(data.title || '')
      setImage(data.image || '')
      setContent(data.content || '')
      setButtons(data.buttons || [])
    }
  }, [data])

  const onSave = async () => {
    const newData = {
      _id: modalId,
      open,
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
      <div className='grid grid-cols-8 gap-x-4 gap-y-4'>
        <Input
          className='col-span-2'
          id='modalId'
          label='ID'
          value={modalId}
          onChange={setModalId}
        />

        <div className='col-span-2'>
          <label className='block text-sm font-medium text-gray-700'>Open</label>
          <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
            <Select
              className='w-full'
              noBorder
              options={[
                { id: '', name: 'None' },
                { id: 'auto', name: 'Auto' },
                { id: 'metadata-confirmed', name: 'Metadata confirmed' },
                { id: 'metadata-not-confirmed', name: 'Metadata not confirmed' },
              ]}
              value={open}
              onChange={setOpen}
            />
          </div>
        </div>

        <Input
          className='col-span-4'
          id='image'
          label='Image'
          value={image}
          onChange={setImage}
        />

        <Input
          className='col-span-8'
          id='title'
          label='Title'
          value={title}
          onChange={setTitle}
        />

        <Input
          className='col-span-8'
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
  const [onclick, setOnclick] = React.useState('')

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      setText(data.text || '')
      setSize(data.size || '')
      setColor(data.color || '')
      setOnclick(data.onclick || '')
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
    if (onclick) {
      newData.onclick = onclick
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
          id='onclick'
          label='On click'
          value={onclick}
          onChange={setOnclick}
        />
      </div>

      <div className='flex justify-between mt-6'>
        <Button rounded color='error' onClick={onDelete}>Delete</Button>
        <Button rounded color='info' onClick={onSave}>Save</Button>
      </div>
    </Modal>
  )
}