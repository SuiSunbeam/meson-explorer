import { Html, Head, Main, NextScript } from 'next/document'
import { GA_TRACKING_ID } from '../lib/ga'
export default function Document() {
  return (
    <Html className='h-full'>
      <Head>
        <link rel='stylesheet' href='https://rsms.me/inter/inter.css' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='true' />
        <link href={`https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Nunito:wght@600;800&display=swap`} rel='stylesheet'></link>
        <script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', "${GA_TRACKING_ID}", {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      </Head>
      <body className='h-full bg-gray-100'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
