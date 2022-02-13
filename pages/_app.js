import Head from 'next/head'
import '../styles/globals.css'
import Navbar from '../components/Navbar'

export default function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>Meson Explorer</title>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </Head>
      <Navbar />
      <div className='max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-6'>
        <Component {...pageProps} />
      </div>
    </div>
  )
}
