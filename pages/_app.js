import Head from 'next/head'
import '../styles/globals.css'
import Navbar from '../components/Navbar'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Meson Explorer</title>
      </Head>
      <Navbar />
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-auto'>
          <div className='max-w-7xl mx-auto'>
            <div className='align-middle inline-block min-w-full py-6 px-2 sm:px-6 lg:px-8'>
              <Component {...pageProps} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
