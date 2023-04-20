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

import { LPS } from 'lib/const'
import fetcher from 'lib/fetcher'
import { abbreviate } from 'lib/swap'

export default function LpWhitelist() {
  const router = useRouter()

  const { data } = useSWR(`admin/whitelist`, fetcher)

  let body = <CardBody><LoadingScreen /></CardBody>
  if (data) {
    body = (
      <CardBody>
        <TableWhitelist data={data} />
      </CardBody>
    )
  }

  const newAddrToWhitelist = async () => {
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
          <Button size='sm' color='primary' rounded onClick={() => newAddrToWhitelist()}>New</Button>
        }
      />
      {body}
    </Card>
  )
}

function TableWhitelist ({ data }) {
  return (
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
      {data.map((row, index) => <WhitelistedAddrRow key={`row-${index}`} {...row} />)}
    </Table>
  )
}

const fmt = Intl.NumberFormat()

function WhitelistedAddrRow (props) {
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-2'>
        {props.note}
        <ExternalLink
          size='xs'
          href={`/address/${props._id}`}
          className='flex items-center font-mono'
        >
          {props._id}
        </ExternalLink>
      </Td>
      <Td>{fmt.format(utils.formatUnits(props.quota, 6))}</Td>
      <Td>{fmt.format(utils.formatUnits(props.deposit || '0', 6))}</Td>
      <Td className='text-right'>
        <Button rounded size='xs' color='info' onClick={() => onOpenModal(d)}>
          <PencilIcon className='w-4 h-4' aria-hidden='true' />
        </Button>
      </Td>
    </tr>
  )
}