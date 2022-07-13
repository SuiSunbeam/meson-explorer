import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className='h-full'>
      <Head>
        <title>Meson Explorer - One-stop block explorer for Meson cross-chain stable swaps</title>
        <meta name='description' content='Meson Explorer is the go-to place to check the up-to-date information for cross-chain stablecoin swaps submitted on Meson App.' />

        <link rel='icon' href='/favicon.ico' />
        <link rel='shortcut icon' href='/favicon.ico' />

        <link rel='stylesheet' href='https://rsms.me/inter/inter.css' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='true' />
        <link href={`https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Nunito:wght@600;800&display=swap`} rel='stylesheet'></link>
      </Head>
      <body className='h-full bg-gray-100'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
