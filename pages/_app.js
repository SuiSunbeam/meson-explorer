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
      <div className='max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-6'>
        <Component {...pageProps} />
      </div>
    </>
  )
}
