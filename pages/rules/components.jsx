import React from 'react'
import classnames from 'classnames'
import { PencilIcon } from '@heroicons/react/solid'

import { ethers } from 'ethers'

import Modal from 'components/Modal'
import Input from 'components/Input'
import Select from 'components/Select'
import { Td } from 'components/Table'
import Button from 'components/Button'
import TagNetwork from 'components/TagNetwork'
import TagNetworkToken from 'components/TagNetworkToken'

import fetcher from 'lib/fetcher'
import { getAllNetworks } from 'lib/swap'

const chains = [
  { id: '*', name: 'Any Chain' },
  ...getAllNetworks().map(n => ({ id: n.id, name: n.name, icon: <TagNetwork iconOnly size='md' network={n} /> }))
]
const tokens = [
  { id: '*', name: 'Any Token' },
  { id: 'x', name: 'Different' },
  { id: 'ETH', name: 'ETH', icon: <TagNetworkToken iconOnly size='md' token={{ symbol: 'ETH' }} /> },
  { id: 'USDC', name: 'USDC', icon: <TagNetworkToken iconOnly size='md' token={{ symbol: 'USDC' }} /> },
  { id: 'USDT', name: 'USDT', icon: <TagNetworkToken iconOnly size='md' token={{ symbol: 'USDT' }} /> },
  { id: 'BUSD', name: 'BUSD', icon: <TagNetworkToken iconOnly size='md' token={{ symbol: 'BUSD' }} /> },
  { id: 'PoD', name: 'PoD', icon: <TagNetworkToken iconOnly size='md' token={{ symbol: 'PoD' }} /> },
  { id: 'UCT', name: 'UCT', icon: <TagNetworkToken iconOnly size='md' token={{ symbol: 'UCT' }} /> }
]

export function SwapRuleModal ({ hides, type, data, onClose }) {
  const [create, setCreate] = React.useState(false)

  const [fromChain, setFromChain] = React.useState('*')
  const [fromToken, setFromToken] = React.useState('*')
  const [toChain, setToChain] = React.useState('*')
  const [toToken, setToToken] = React.useState('*')

  const [priority, setPriority] = React.useState(0)
  const [limit, setLimit] = React.useState('')
  const [factor, setFactor] = React.useState('')
  const [minimum, setMinimum] = React.useState('')
  const [initiators, setInitiators] = React.useState('')
  const [mark, setMark] = React.useState('')
  const [fee, setFee] = React.useState('')

  React.useEffect(() => {
    if (data) {
      setCreate(!Object.keys(data).length)

      const [fromChain, fromToken = '*'] = (data.from || '').split(':')
      setFromChain(fromChain || '*')
      setFromToken(fromToken)
      let [toChain, toToken = '*'] = (data.to || '').split(':')
      if (data.to === 'x') {
        toChain = '*'
        toToken = 'x'
      }
      setToChain(toChain || '*')
      setToToken(toToken)
      setPriority(data.priority || 0)
      setLimit(typeof data.limit === 'number' ? data.limit : '')
      setFactor(typeof data.factor === 'number' ? data.factor : '')
      setMinimum(typeof data.minimum === 'number' ? ethers.utils.formatUnits(data.minimum, 6) : '')
      setInitiators(data.initiators?.map(i => i.note ? `${i.note}:${i.addr}` : i.addr).join('\n') || '')
      setMark(data.mark || '')
      setFee(JSON.stringify(data.fee, null, 2) || '[\n]')
    }
  }, [data])

  const onSave = async () => {
    const dataToSave = {
      type,
      from: fromToken === '*' ? fromChain : `${fromChain}:${fromToken}`,
      to: toToken === 'x' ? 'x' : toToken === '*' ? toChain : `${toChain}:${toToken}`,
      priority,
      limit,
      factor,
      minimum: minimum && ethers.utils.parseUnits(minimum, 6).toNumber(),
      initiators: type === 'address' ? initiators.split('\n').filter(Boolean).map(line => {
        const [p1, p2] = line.split(':')
        return p2 ? { note: p1.trim(), addr: p2.trim() } : { addr: p1.trim() }
      }) : undefined,
      mark,
      fee: JSON.parse(fee)
    }

    if (create) {
      await fetcher.post(`admin/rules`, dataToSave)
    } else {
      await fetcher.put(`admin/rules/${data.priority}`, dataToSave)
    }
    onClose(true)
  }

  const onDelete = async () => {
    await fetcher.delete(`admin/rules/${data.priority}`)
    onClose(true)
  }

  return (
    <Modal
      isOpen={!!data}
      title='Swap Rule'
      onClose={onClose}
    >
      <div className='grid grid-cols-6 gap-x-6 gap-y-4'>
        <div className='col-span-3'>
          <label className='block text-sm font-medium text-gray-700'>From</label>
          <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
            <Select
              className='w-7/12 border-r border-gray-300'
              noIcon
              noBorder
              options={chains}
              value={fromChain}
              onChange={setFromChain}
            />
            <Select
              className='w-5/12'
              noIcon
              noBorder
              options={tokens}
              value={fromToken}
              onChange={setFromToken}
            />
          </div>
        </div>

        <div className='col-span-3'>
          <label className='block text-sm font-medium text-gray-700'>To</label>
          <div className='mt-1 flex border border-gray-300 shadow-sm rounded-md'>
            <Select
              className='w-7/12 border-r border-gray-300'
              noIcon
              noBorder
              options={chains}
              value={toChain}
              onChange={setToChain}
            />
            <Select
              className='w-5/12'
              noIcon
              noBorder
              options={tokens}
              value={toToken}
              onChange={setToToken}
            />
          </div>
        </div>

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
        {
          !hides.includes('factor') &&
          <Input
            className='col-span-3'
            id='factor'
            label='Factor'
            type='number'
            value={factor}
            onChange={setFactor}
          />
        }
        {
          !hides.includes('minimum') &&
          <Input
            className='col-span-3'
            id='minimum'
            label='Minimum'
            type='number'
            value={minimum}
            onChange={setMinimum}
          />
        }
        {
          !hides.includes('initiators') &&
          <Input
            className='col-span-6'
            id='initiators'
            label='Initiators'
            type='textarea'
            value={initiators}
            onChange={setInitiators}
          />
        }
        {
          !hides.includes('rules') &&
          <Input
            className='col-span-6'
            id='rules'
            label='Fee Rules'
            type='textarea'
            value={fee}
            onChange={setFee}
          />
        }
        {
          hides.includes('initiators') &&
          <Input
            className='col-span-6'
            id='mark'
            label='Mark'
            value={mark}
            onChange={setMark}
          />
        }
      </div>

      <div className='flex justify-between mt-6'>
        <Button rounded color='error' onClick={onDelete}>Delete</Button>
        <Button rounded color='info' onClick={onSave}>Save</Button>
      </div>
    </Modal>
  )
}

const fmt = Intl.NumberFormat()
const fmt2 = Intl.NumberFormat('en', { maximumSignificantDigits: 4 })

export function RowSwapRule ({ d, onOpenModal, hides = [] }) {
  const isETH = d.to.endsWith('ETH')
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1'>
        <div className='flex flex-row items-center text-sm h-5'>
          <SwapRuleRouteKey routeKey={d.from} />
          <div className='text-gray-500 mx-1 text-xs'>{'->'}</div>
          <SwapRuleRouteKey routeKey={d.to} />
        </div>
        <div className='text-xs text-gray-500'>
          #{d.priority}
        </div>
      </Td>
      <Td size='sm'>{d.limit && (isETH ? d.limit : `${fmt.format(d.limit / 1000)}k`)}</Td>
      {!hides.includes('factor') && <Td size='sm'>{d.factor}</Td>}
      {!hides.includes('minimum') && <Td size='sm'>{d.minimum && `${isETH ? '' : '$'}${ethers.utils.formatUnits(d.minimum, 6)}`}</Td>}
      {
        !hides.includes('rules') &&
        <>
          <Td size='sm'>{d.fee?.map((item, i) => <FeeRule key={i} {...item} isETH={isETH} />)}</Td>
          <Td size='sm'></Td>
        </>
      }
      {
        !hides.includes('gas') &&
        <Td size='sm'>
          {d.fee?.map((item, i) => <GasCalculation key={i} {...item} isETH={isETH} gasPrice={d.gasPrice} gasPriceL0={d.gasPriceL0} />)}
        </Td>
      }
      {
        !hides.includes('initiators') &&
        <Td size='sm' wrap>
        {
          d.initiators?.map((line, i) => (
            <div key={`initiator-${i}`} className='flex flex-row items-center text-xs'>
              <div className='w-20 mr-2 font-medium text-gray-500 overflow-hidden flex-shrink-0'>{line.note}</div>
              <div className='font-mono break-all'>{line.addr}</div>
            </div>
          ))
        }
        </Td>
      }
      {!hides.includes('premium') && <Td size='sm'>{d.premium ? '✅' : ''}</Td>}
      {hides.includes('initiators') && <Td size='sm'>{d.mark}</Td>}
      <Td size='sm' className='text-right'>
        <Button rounded size='xs' color='info' onClick={() => onOpenModal(d)}>
          <PencilIcon className='w-4 h-4' aria-hidden='true' />
        </Button>
      </Td>
    </tr>
  )
}

function SwapRuleRouteKey ({ routeKey = '' }) {
  if (routeKey === '*') {
    return 'any'
  }
  if (routeKey === 'x') {
    return 'different token'
  }
  const [n, t = '*'] = routeKey.split(':')
  if (n === '*') {
    if (t === '*') {
      return 'any'
    } else {
      return <TagNetworkToken iconOnly token={{ symbol: t }} />
    }
  }
  return (
    <div className='flex flex-row'>
      <TagNetwork iconOnly network={{ id: n }} />
      { t !== '*' && <TagNetworkToken iconOnly token={{ symbol: t }} className='ml-1' /> }
    </div>
  )
}

function FeeRule ({ min, base, gasFee, rate, isETH }) {
  let minStr = min
  if (min > 1000) {
    minStr = (min / 1000) + 'k'
  }

  const range = <span className='inline-block w-12'>{min && `≥${minStr}`}</span>

  const rule = []
  if (base) {
    rule.push(`${isETH ? '' : '$'}${ethers.utils.formatUnits(base, 6)}`)
  }
  if (gasFee) {
    if (isETH) {
      rule.push(`${ethers.utils.formatUnits(gasFee, 3)}m`)
    } else {
      rule.push(`$${ethers.utils.formatUnits(gasFee, 6)}`)
    }
  }
  if (rate) {
    rule.push(`${rate/10000}%`)
  }
  if (!rule.length) {
    rule.push('0')
  }
  return (
    <div className='flex justify-between'>
      <div>{range}</div>
      <div>{rule.join(' + ')}</div>
    </div>
  )
}

function GasCalculation ({ gas, core = 1, multiplier = 1, isETH, gasPrice, gasL0, gasPriceL0 }) {
  if (!(gas && gasPrice)) {
    return ''
  }

  let gasUsed = gas * gasPrice
  if (gasL0 && gasPriceL0) {
    gasUsed += gasL0 * gasPriceL0
  }

  const gasFee = isETH
    ? `${fmt.format(core * gasUsed * (multiplier || 1) / 1e15)} m`
    : `$${fmt.format(core * gasUsed * (multiplier || 1) / 1e18)}`

  return (
    <div>
      <div className='flex flex-row items-center gap-2'>
        <div className='flex-1 shrink-0'>{gasFee}</div>
        <div className='text-xs text-gray-500'>=</div>
        <div className='flex-[1.2] shrink-0 flex flex-row items-center'>
          {gasL0 && gasPriceL0 && <div className='text-2xl font-extralight text-gray-300 mr-1'>(</div>}
          <div>
            <div>{fmt.format(gas / 1000)}k</div>
            {gasL0 && gasPriceL0 && <div>{fmt.format(gasL0 / 1000)}k</div>}
          </div>
        </div>
        <div className='flex flex-col text-xs text-gray-500 items-center'>
          <div className='leading-5'>×</div>
          {gasL0 && gasPriceL0 && <div className='leading-5'>×</div>}
        </div>
        <div className='flex-[1.4] shrink-0 flex flex-row items-center'>
          <div>
            <div>{fmt2.format(gasPrice / 1e9)} Gwei</div>
            {gasL0 && gasPriceL0 && <div>{fmt2.format(gasPriceL0 / 1e9)} Gwei</div>}
          </div>
          {gasL0 && gasPriceL0 && <div className='text-2xl font-extralight text-gray-300 ml-2'>)</div>}
        </div>
        <div className={classnames('text-xs', isETH ? 'text-transparent' : 'text-gray-500')}>×</div>
        <div className='flex-1 shrink-0'>{!isETH && `$${core}`}</div>
        <div className={classnames('text-xs', multiplier === 1 ? 'text-transparent' : 'text-gray-500')}>×</div>
        <div className='flex-1 shrink-0'>{multiplier !== 1 && multiplier}</div>
      </div>
    </div>
  )
}
