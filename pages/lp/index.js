import React from 'react'
import { useRouter } from 'next/router'

import { LPS } from 'lib/const'

export default function LpIndex() {
  const router = useRouter()

  React.useEffect(() => {
    router.replace(`/lp/${LPS[0]}`)
  }, [router])

  return null
}