import React from 'react'
import classnames from 'classnames'
import { Dialog, Transition } from '@headlessui/react'

export default function Modal ({ isOpen = false, title, children, onClose = () => {} }) {
  const focusRef = React.useRef()
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as='div' className='relative z-10' onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/50 transition-opacity' />
        </Transition.Child>

        <div className='fixed z-10 inset-0 overflow-y-auto'>
          <div className='flex items-center justify-center min-h-full p-4 sm:p-0'>
            <Transition.Child
              as={React.Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className={classnames(
                'relative bg-white rounded-lg shadow-xl transform transition-all',
                'max-w-md w-full sm:my-8 px-4 pt-5 pb-4 sm:p-6 overflow-hidden'
              )}>
                <div className='flex flex-col'>
                  <Dialog.Title as='h3' className='mb-5 text-lg leading-6 font-medium text-gray-900'>
                    {title}
                  </Dialog.Title>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export function ModalContent ({ children, className, title, onClose }) {
  return (
    <div className={classnames('flex flex-col w-[calc(100vw-4rem)] sm:w-[calc(100vw-5rem)]', className)}>
      {title && <ModalTitle onClose={onClose}>{title}</ModalTitle>}
      <div className='pt-4'>{children}</div>
    </div>
  )
}

export function ModalTitle ({ children, onClose }) {
  return (
    <Dialog.Title as='h1' className='flex justify-between items-center text-lg font-semibold leading-6'>
      {children}
      {onClose ? <div onClick={onClose}>x</div> : null}
    </Dialog.Title>
  )
}
