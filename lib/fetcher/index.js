import useSWR from 'swr'

export function usePagination (url = '', pageQuery = {}, opt = {}) {
  const page = Number(pageQuery.page || 1) - 1
  const pageValid = Number.isInteger(page) && page >= 0
  let size = Number(pageQuery.size || 10)
  if (!Number.isInteger(size) || size < 10) {
    size = 10
  }

  let [pathname, query = ''] = url.split('?')
  if (query) {
    query += '&'
  }
  const queryWithPage = `${query}page=${page}&size=${size}`
  const { data, error } = useSWR(url && pageValid && `${pathname}?${queryWithPage}`, fetcher)
  const { data: dataTotal } = useSWR(url && opt.fetchTotal && `${pathname}?${query}count=true`, fetcher)

  return { data, total: dataTotal?.total, error, size, page: pageValid ? page : NaN }
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