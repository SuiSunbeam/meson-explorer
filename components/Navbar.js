import { Fragment } from 'react'
import Link from 'next/link'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { LinkIcon, CreditCardIcon } from '@heroicons/react/outline'

import extensions from '../lib/extensions'
import { abbreviate } from '../lib/swap'

const testnetMode = Boolean(process.env.NEXT_PUBLIC_TESTNET)

const navigation = [
  // { name: 'Swaps', href: '#', current: true },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar({ browserExt, setGlobalState }) {
  const connectedAddress = browserExt?.currentAccount?.hex

  const onClick = async () => {
    if (connectedAddress) {
      await extensions.disconnect(() => setGlobalState({ browserExt: null }))
    } else {
      await extensions.connect('', browserExt => setGlobalState({ browserExt }))
    }
  }


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
                          'px-3 py-2 rounded-md text-sm font-medium'
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
                <Menu as='div' className='relative'>
                  <div>
                    <Menu.Button className='text-white hover:bg-primary rounded-md opacity-90 hover:opacity-100 px-2 py-1 sm:px-3'>
                      <div className='hidden sm:block'>{connectedAddress ? abbreviate(connectedAddress) : 'Connect Wallet'}</div>
                      <div className='sm:hidden'>
                        {connectedAddress ? <CreditCardIcon className='w-5' /> : <LinkIcon className='w-5' />}
                      </div>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter='transition ease-out duration-100'
                    enterFrom='transform opacity-0 scale-95'
                    enterTo='transform opacity-100 scale-100'
                    leave='transition ease-in duration-75'
                    leaveFrom='transform opacity-100 scale-100'
                    leaveTo='transform opacity-0 scale-95'
                  >
                    <Menu.Items className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 cursor-pointer')}
                            onClick={onClick}
                          >
                            {connectedAddress ? 'Disconnect' : 'MetaMask'}
                          </div>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className='sm:hidden'>
            <div className='px-2 pt-2 pb-3 space-y-1'>
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as='a'
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block px-3 py-2 rounded-md text-base font-medium'
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
