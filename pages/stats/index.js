import React from 'react'
import { useRouter } from 'next/router'

export default function Stats() {
  const router = useRouter()
  React.useEffect(() => {
    router.replace('/stats/all')
  }, [router])
  return null
}