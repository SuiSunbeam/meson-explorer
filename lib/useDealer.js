import React from 'react'
import ReconnectingWebSocket from 'reconnecting-websocket'

import { DealerClient } from '@mesonfi/dealer'
import useSWR from 'swr'

import fetcher from 'lib/fetcher'
import { presets } from 'lib/swap'

const relayer = process.env.NEXT_PUBLIC_SERVER_URL.split(',')[0]

module.exports = function useDealer() {
  const { data: rpcs } = useSWR(`${relayer}/rpcs`, fetcher)

  const dealer = React.useMemo(() => {
    if (rpcs) {
      return new DealerClient(presets, { rpcs, WebSocket: ReconnectingWebSocket, threshold: 1 })
    }
  }, [rpcs])

  return dealer
}
