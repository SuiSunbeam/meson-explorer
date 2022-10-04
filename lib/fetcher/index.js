import useSWR from 'swr'

export function usePagination (url, rawPage = 1) {
  const page = Number(rawPage) - 1
  const pageValid = !Number.isNaN(page) && Number.isInteger(page) && page >= 0

  const { data, error } = useSWR(pageValid && `${url}?page=${page}`, fetcher)
  return { data, error, page: pageValid ? page : NaN }
}

async function fetcher (req, opt) {
  const res = await fetch(`/api/v1/${req}`, opt)
  const json = await res.json()
  if (json.result) {
    return json.result
  } else {
    throw new Error(json.error.message)
  }
}

fetcher.post = async function (req, body, opt) {
  return await fetcher(req, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...opt,
  })
}

fetcher.put = async function (req, body, opt) {
  return await fetcher(req, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...opt,
  })
}

fetcher.delete = async function (req, opt) {
  return await fetcher(req, {
    method: 'DELETE',
    ...opt,
  })
}

export default fetcher