import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import { ethers } from 'ethers'

import Card, { CardTitle, CardBody } from '../../components/Card'
import { Loading } from '../../components/LoadingScreen'
import ListRow from '../../components/ListRow'
import TagNetwork from '../../components/TagNetwork'
import TagNetworkToken from '../../components/TagNetworkToken'

import { presets, getAllNetworks } from '../../lib/swap'

export default function LpPage() {
  const router = useRouter()
  const { address } = router.query

  let body = null
  if (!address) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>xxx</div>
  } else {
    body = <LpContent address={address} />
  }

  return (
    <Card>
      <CardTitle
        title='LP'
        subtitle={address}
      />
      <CardBody border={false}>
        <dl>
          {body}
        </dl>
      </CardBody>
    </Card>
  )
}

function LpContent ({ address }) {
  return getAllNetworks().map(n => <LpContentRow key={n.id} address={address} network={n} />)
}

function LpContentRow ({ address, network }) {
  const [core, setCore] = React.useState(<Loading />)

  const client = presets.clientFromUrl({
    id: network.id,
    url: network.url.replace('${INFURA_API_KEY}', process.env.NEXT_PUBLIC_INFURA_PROJECT_ID)
  })

  let formatedAddress = address
  if (network.id.startsWith('tron')) {
    formatedAddress = client.tronWeb.address.fromHex(address?.replace('0x', '41'))
    if (formatedAddress) {
      client.tronWeb.setAddress(formatedAddress)
    }
  }

  useEffect(() => {
    if (!formatedAddress) {
      return
    }
    client.getBalance(formatedAddress)
      .catch(() => {})
      .then(v => {
        if (!v) {
          return
        }
        const balance = ethers.utils.formatUnits(v, network.nativeCurrency?.decimals || 18)
        setCore(balance)
      })
  }, [formatedAddress])

  return (
    <ListRow
      title={
        <div className='flex flex-col align-start'>
          <TagNetwork size='md' network={network} />
          <div className='flex ml-7 mt-0.5 text-xs font-mono'>
            {core}
            <div className='ml-1'>{network.nativeCurrency?.symbol || 'ETH'}</div>
          </div>
        </div>
      }
    >
    {network.tokens.map(t => <TokenAmount key={t.addr} client={client} address={formatedAddress} token={t} explorer={network.explorer} />)}
    </ListRow>
  )
}

function TokenAmount ({ client, address, token, explorer }) {
  const [deposit, setDeposit] = React.useState(<Loading />)
  const [depositDecimal, setDepositDecimal] = React.useState()
  const [balance, setBalance] = React.useState(<Loading />)
  const [balanceDecimal, setBalanceDecimal] = React.useState()

  useEffect(() => {
    if (!address) {
      return
    }
    client.balanceOf(token.addr, address)
      .catch(() => {})
      .then(v => {
        if (!v) {
          return
        }
        const bal = ethers.utils.formatUnits(v, 6)
        const [i, d] = bal.split('.')
        setDeposit(i.padStart(6, ' '))
        setDepositDecimal(`.${d.padEnd(6, '0').substring(0, 6)}`)
      })
    
    client.balanceOfToken(token.addr, address)
      .catch(() => {})
      .then(v => {
        if (!v) {
          return
        }
        const bal = ethers.utils.formatUnits(v, token.decimals)
        const [i, d] = bal.split('.')
        setBalance(i.padStart(6, ' '))
        setBalanceDecimal(`.${d.padEnd(6, '0').substring(0, 6)}`)
      })
  }, [address])

  return (
    <div className='flex items-center'>
      <div className='flex flex-1 items-center'>
        <pre className='text-sm font-mono mr-1'>{deposit}<span className='text-gray-300'>{depositDecimal}</span></pre>
        <TagNetworkToken explorer={explorer} token={token} />
      </div>

      <div className='flex flex-1 items-center'>
        <pre className='text-sm font-mono mr-1'>{balance}<span className='text-gray-300'>{balanceDecimal}</span></pre>
        <TagNetworkToken explorer={explorer} token={token} />
      </div>
    </div>
  )
}
