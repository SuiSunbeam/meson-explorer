import React from 'react'
import classnames from 'classnames'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'

export default function Select({ label, className, options, value, noBorder, noIcon, onChange, disabled }) {
  const selected = options.find(item => item.id === value) || options[0]

  return (
    <div className={className}>
      <Listbox value={selected} onChange={item => onChange(item.id)} className={className}>
        {({ open }) => (
          <>
            <div className='relative'>
              <Listbox.Button className={classnames(
                'relative w-full bg-white rounded-md',
                !noBorder && 'border border-gray-300 shadow-sm',
                'pl-2 py-2',
                noIcon ? 'pr-2' : 'pr-7',
                'text-left cursor-default sm:text-sm'
              )}>
                <span className='flex items-center'>
                  {selected.icon && <span className='flex-shrink-0 rounded-full mr-1'>{selected.icon}</span>}
                  <span className='ml-1 block truncate'>{selected.name}</span>
                </span>
                {
                  !noIcon &&
                  <span className='ml-2 absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none'>
                    <SelectorIcon className='h-5 w-5 text-gray-500' aria-hidden='true' />
                  </span>
                }
              </Listbox.Button>

              <Transition
                show={!disabled && open}
                as={React.Fragment}
                leave='transition ease-in duration-100'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <Listbox.Options className='absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm'>
                  {options.map((item) => (
                    <Listbox.Option
                      key={item.id}
                      value={item}
                      className={({ selected, active }) =>
                        classnames(
                          'cursor-default select-none relative py-2 pl-2',
                          selected ? 'bg-indigo-500 text-white' : 'text-gray-900',
                          (!selected && active) && 'bg-indigo-100',
                          noIcon ? 'pr-2' : 'pr-9'
                        )
                      }
                    >
                      {({ selected, active }) => (
                        <>
                          <div className='flex items-center'>
                            {item.icon && <span className='flex-shrink-0 rounded-full mr-1'>{item.icon}</span>}
                            <span className={'ml-1 block truncate'}>
                              {item.name}
                            </span>
                          </div>

                          {(!noIcon && selected) ? (
                            <span
                              className={classnames(
                                active ? 'text-white' : 'text-indigo-500',
                                'absolute inset-y-0 right-0 flex items-center pr-2'
                              )}
                            >
                              <CheckIcon className='h-5 w-5' aria-hidden='true' />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}
