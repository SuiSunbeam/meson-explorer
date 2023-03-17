import useSWR from 'swr'

export function usePagination (url, rawPage = 1, pageSize = 10) {
  const page = Number(rawPage) - 1
  const pageValid = !Number.isNaN(page) && Number.isInteger(page) && page >= 0

  const [pathname, query] = url.split('?')
  const queryWithPage = query ? `${query}&page=${page}&size=${pageSize}` : `page=${page}&size=${pageSize}`

  const { data, error } = useSWR(pageValid && `${pathname}?${queryWithPage}`, fetcher)
  return { data, error, page: pageValid ? page : NaN }
}

async function fetcher (req, opt) {
  let reqUrl
  if (req.startsWith('http')) {
    reqUrl = req
  } else {
    reqUrl = `/api/v1/${req}`
  }
  const res = await fetch(reqUrl, opt)
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

fetcher.delete = async function (req, body, opt) {
  return await fetcher(req, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...opt,
  })
}

export default fetcher