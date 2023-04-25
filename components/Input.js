export default function Input({ className, id, label, ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
      <TypedInput id={id} {...props} />
    </div>
  )
}

function TypedInput ({ id, type = 'text', placeholder, value, onChange, rows = 5, ...props }) {
  if (type === 'textarea') {
    return (
      <textarea
        id={id}
        name={id}
        rows={rows}
        className='mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
        placeholder={placeholder}
        value={value}
        onChange={evt => onChange(evt.target.value)}
        {...props}
      />
    )
  }

  return (
    <input
      type={type}
      name={id}
      id={id}
      className='mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
      placeholder={placeholder}
      value={value}
      onChange={evt => onChange(evt.target.value)}
      {...props}
    />
  )
}

