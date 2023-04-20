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
          <Button size='sm' color='info' rounded onClick={() => newAddrToWhitelist()}>New</Button>
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
        { name: 'Address', width: '50%' },
        { name: 'Note', width: '15%' },
        { name: 'Quota', width: '15%' },
        { name: 'Deposit', width: '15%' },
        { name: 'Edit', width: '5%', className: 'text-right' },
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
      <Td size='' className='pl-4 pr-3 sm:pl-6'>
        <ExternalLink
          size='xs'
          href={`/address/${props._id}`}
          className='flex items-center font-mono'
        >
          {props._id}

        </ExternalLink>
      </Td>
      <Td size='sm'>{props.note}</Td>
      <Td size='sm'>{fmt.format(utils.formatUnits(props.quota, 6))}</Td>
      <Td size='sm'>{fmt.format(utils.formatUnits(props.deposit || '0', 6))}</Td>
      <Td  size='sm' className='text-right'>
        <Button rounded size='xs' color='info' onClick={() => onOpenModal(d)}>
          <PencilIcon className='w-4 h-4' aria-hidden='true' />
        </Button>
      </Td>
    </tr>
  )
}