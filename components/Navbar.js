import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Float } from 'headlessui-float-react'
import { Disclosure, Menu } from '@headlessui/react'
import { UserCircleIcon, LinkIcon } from '@heroicons/react/outline'
import { UserCircleIcon as SolidUserCircleIcon } from '@heroicons/react/solid'
import { ExtensionCallbacks } from '@mesonfi/extensions'

import extensions from 'lib/extensions'
import { abbreviate } from 'lib/swap'

const testnetMode = Boolean(process.env.NEXT_PUBLIC_TESTNET)
const lps = process.env.NEXT_PUBLIC_LPS?.split(',') || []

const navigation = [
  // { name: 'Swaps', href: '#', current: true },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar({ globalState, setGlobalState }) {
  return (
    <Disclosure as='nav' className=' bg-gradient-to-r from-gradient-start to-gradient-end'>
      {({ open }) => (
        <>
          <div className='px-2 mx-auto max-w-7xl sm:px-6 lg:px-8'>
            <div className='relative flex items-center justify-between h-16'>
              <div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
                {/* Mobile menu button*/}
                {/* <Disclosure.Button className='inline-flex items-center justify-center p-2 text-gray-500 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'>
                  <span className='sr-only'>Open main menu</span>
                  {open ? (
                    <XIcon className='block w-6 h-6' aria-hidden='true' />
                  ) : (
                    <MenuIcon className='block w-6 h-6' aria-hidden='true' />
                  )}
                </Disclosure.Button> */}
              </div>
              <div className='flex items-center justify-center flex-1 sm:items-stretch sm:justify-start'>
                <div className='flex items-center flex-shrink-0'>
                  <div className='text-lg font-medium text-white'>
                    <Link href='/'>
                      <a className='flex items-center font-semibold opacity-90 hover:opacity-100'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img width={28} height={14} className='opacity-50' src='/logo.svg' alt='' />
                        <div className='inline-block ml-2 mb-1 text-2xl' style={{ fontFamily: `'Nunito', sans-serif` }}>
                          <span className='font-extrabold'>meson</span>
                          <span className='font-semibold opacity-90'> explorer {testnetMode && ' testnet'}</span>
                        </div>
                      </a>
                    </Link>
                  </div>
                </div>
                <div className='hidden sm:block sm:ml-6'>
                  <div className='flex space-x-4'>
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'px-3 py-1.5 rounded-md text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className='absolute inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
                <Profile {...{ globalState, setGlobalState }}/>
              </div>
            </div>
          </div>

          <Disclosure.Panel className='sm:hidden'>
            <div className='px-2 pt-1.5 pb-3 space-y-1'>
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as='a'
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block px-3 py-1.5 rounded-md text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

function Profile ({ globalState, setGlobalState }) {
  const router = useRouter()
  const { data: session } = useSession()
  const isRoot = session?.user?.roles?.includes('root')
  const isAdmin = session?.user?.roles?.includes('admin')
  const isOperator = session?.user?.roles?.includes('operator')

  const { browserExt } = globalState
  
  const [show, setShow] = React.useState(false)
  const [extList, setExtList] = React.useState([])
  const [error, setError] = React.useState()

  React.useEffect(() => {
    extensions.bindEventHandlers(new ExtensionCallbacks(console, {
      updateBrowserExt: browserExt => setGlobalState(prev => ({ ...prev, browserExt })),
      switchNetwork: networkId => setGlobalState(prev => ({ ...prev, networkId })),
    }))
  }, [setGlobalState])

  React.useEffect(() => {
    const exts = extensions.detectAllExtensions().filter(ext => !ext.notInstalled && ext.type !== 'walletconnect')
    setExtList(exts)
  }, [])

  const onClickExt = React.useCallback(async (evt, ext) => {
    evt.stopPropagation()
    await extensions.connect(undefined, ext.type, ext.id)
  }, [])

  return (
    <Menu as='div' className='ml-1 relative'>
      {show && (
        <div className='fixed inset-0 z-20 overflow-y-auto no-scrollbar' onClick={() => setShow(false)}>
        </div>
      )}
      <Float
        show={show}
        placement='bottom-end'
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Menu.Button
          className='max-w-xs bg-gray-300 rounded-full flex items-center text-sm focus:outline-none'
          onClick={() => setShow(true)}
        >
          {
            session
            // eslint-disable-next-line @next/next/no-img-element
            ? <img className='h-8 w-8 rounded-full' src={session?.user.image} alt='' />
            : <SolidUserCircleIcon className='h-8 w-8 rounded-full bg-gray-100 text-gray-500'/>
          }
        </Menu.Button>
        <Menu.Items
          static
          className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 z-10'
          onClick={evt => {
            if (evt.target.role === 'menuitem') {
              setShow(false)
            }
          }}
        >
          <div className='py-1'>
            <div className='flex items-center px-4 pt-1.5 pb-1 text-xs text-gray-500'>
              <UserCircleIcon className='w-4 h-4 mr-1'/>{session?.user.email || '(Guest)'}
            </div>
            <Menu.Item>
              <div
                className='block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                onClick={() => { session ? signOut() : signIn() }}
              >
                { session ? 'Sign out' : 'Sign in'}
              </div>
            </Menu.Item>
          </div>
          <div className='py-1'>
          {
            browserExt
            ? <>
                <div className='flex items-center px-4 pt-1.5 pb-1 text-xs text-gray-500'>
                  <img alt={browserExt.ext?.name} crossOrigin='anonymous' className='w-3.5 h-3.5 mr-1.5' src={browserExt.ext?.icon} />
                  {browserExt.ext?.name}
                </div>
                <Menu.Item onClick={() => router.push(`/address/${browserExt.currentAccount?.address}`)}>
                  <div className='px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'>
                    {abbreviate(browserExt.currentAccount?.address)}
                  </div>
                </Menu.Item>
                <Menu.Item onClick={evt => { evt.stopPropagation(); extensions.disconnect() }}>
                  <div className='px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'>Disconnect</div>
                </Menu.Item>
              </>
            : <>
                <div className='flex items-center px-4 pt-1.5 pb-1 text-xs text-gray-500'>
                  <LinkIcon className='w-3.5 h-3.5 mr-1.5' />Login with
                </div>
                {extList.map(ext => (
                  <Menu.Item key={ext.id} onClick={evt => onClickExt(evt, ext)}>
                    <div className='pl-4 py-1.5 flex items-center text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'>
                      <img alt={ext.name} crossOrigin='anonymous' className='w-3.5 h-3.5 mr-1.5' src={ext.icon} />
                      {ext.name}
                    </div>
                  </Menu.Item>
                ))}
              </>
          }
          </div>
          {
            (isRoot || isAdmin || isOperator) &&
            <div className='py-1'>
              <Menu.Item>
                <div
                  className='block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                  onClick={() => router.push('/premium')}
                >
                  Premiums
                </div>
              </Menu.Item>
            </div>
          }
          {
            (isRoot || isAdmin) &&
            <div className='py-1'>
              <div className='flex items-center px-4 pt-1.5 pb-1 text-xs text-gray-500'>
                LPs
              </div>
              {
                lps.map((lp, index) => (
                  <Menu.Item key={`lp-${index}`}>
                    <div
                      className='block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer overflow-hidden truncate'
                      onClick={() => router.push(`/lp/${lp}`)}
                    >
                      {lp}
                    </div>
                  </Menu.Item>
                ))
              }
            </div>
          }
          {
            (isRoot || isAdmin) &&
            <div className='py-1'>
              <div className='flex items-center px-4 pt-1.5 pb-1 text-xs text-gray-500'>
                Stats
              </div>
              <Menu.Item>
                <div
                  className='block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                  onClick={() => router.push('/stats')}
                >
                  Swaps
                </div>
              </Menu.Item>
              <Menu.Item>
                <div
                  className='block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                  onClick={() => router.push('/stats-share')}
                >
                  Posters
                </div>
              </Menu.Item>
            </div>
          }
          {
            isRoot &&
            <>
              <div className='py-1'>
                <div className='flex items-center px-4 pt-1.5 pb-1 text-xs text-gray-500'>
                  Pendings
                </div>
                <Menu.Item>
                  <div
                    className='block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                    onClick={() => router.push('/pending/bonded')}
                  >
                    Bonded
                  </div>
                </Menu.Item>
                <Menu.Item>
                  <div
                    className='block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                    onClick={() => router.push('/pending/locked')}
                  >
                    Locked
                  </div>
                </Menu.Item>
                <Menu.Item>
                  <div
                    className='block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                    onClick={() => router.push('/pending/conflict')}
                  >
                    Conflict
                  </div>
                </Menu.Item>
                <Menu.Item>
                  <div
                    className='block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                    onClick={() => router.push('/pending/double')}
                  >
                    Double
                  </div>
                </Menu.Item>
              </div>
            </>
          }
        </Menu.Items>
      </Float>
    </Menu>
  )
}