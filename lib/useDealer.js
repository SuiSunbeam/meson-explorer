import React from 'react'
import ReconnectingWebSocket from 'reconnecting-websocket'

import { DealerClient } from '@mesonfi/dealer'
import useSWR from 'swr'

import fetcher from 'lib/fetcher'
import { presets } from 'lib/swap'
import { RELAYERS } from 'lib/const'

module.exports = function useDealer() {
  const { data: rpcs } = useSWR(`${RELAYERS[0]}/rpcs`, fetcher)

  const dealer = React.useMemo(() => {
    if (rpcs) {
      return new DealerClient(presets, { rpcs, WebSocket: ReconnectingWebSocket, threshold: 1 })
    }
  }, [rpcs])

  return dealer
}
