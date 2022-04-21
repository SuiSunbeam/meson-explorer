import React, { useEffect } from 'react'
import Head from 'next/head'
import '../styles/globals.css'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import AppContext from '../lib/context'
import * as ga from '../lib/ga'

export default function App({ Component, pageProps }) {
  const [globalState, setGlobalState] = React.useState({})
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <title>Meson Explorer</title>
      </Head>
      <Navbar globalState={globalState} setGlobalState={setGlobalState} />
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-auto'>
          <div className='mx-auto max-w-7xl'>
            <div className='px-2 py-2 sm:py-4 sm:px-4 lg:py-6 lg:px-8'>
              <AppContext.Provider value={{ globalState, setGlobalState }}>
                <Component {...pageProps} />
              </AppContext.Provider>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
