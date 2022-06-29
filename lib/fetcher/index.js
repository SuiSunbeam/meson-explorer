export default async function fetcher (req) {
  const res = await fetch(`/api/v1/${req}`)
  const json = await res.json()
  if (json.result) {
    return json.result
  } else {
    throw new Error(json.error.message)
  }
}