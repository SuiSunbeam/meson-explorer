import React from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/router'

import 'styles/globals.css'

import AppContext from 'lib/context'
import * as ga from 'lib/ga'
import Navbar from 'components/Navbar'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [globalState, setGlobalState] = React.useState({})
  const router = useRouter()

  React.useEffect(() => {
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
        <title>Meson Explorer - One-stop block explorer for Meson cross-chain stable swaps</title>
        <meta name='title' content='Meson Explorer - One-stop block explorer for Meson cross-chain stable swaps' />
      </Head>
      <Script strategy='afterInteractive' src={`https://www.googletagmanager.com/gtag/js?id=${ga.GA_TRACKING_ID}`} />
      <script
        id='gtag-init'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <SessionProvider session={session}>
        <Navbar globalState={globalState} setGlobalState={setGlobalState}/>
        <div className='flex-1 overflow-hidden'>
          <div className='h-full overflow-auto'>
            <div className='mx-auto max-w-[1920px]'>
              <div className='px-2 py-2 sm:py-4 sm:px-4 lg:py-6 lg:px-8'>
                <AppContext.Provider value={{ globalState, setGlobalState }}>
                  <Component {...pageProps} />
                </AppContext.Provider>
              </div>
            </div>
          </div>
        </div>
      </SessionProvider>
    </>
  )
}
