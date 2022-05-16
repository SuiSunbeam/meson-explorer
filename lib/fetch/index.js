import sample from 'lodash/sample'

const servers = process.env.NEXT_PUBLIC_SERVER_URL.split(',').map(url => ({ url, ok: true }))

function pickServer() {
  return sample(servers.filter(s => s.ok))
}

function setServerDown(url) {
  const server = servers.find(s => s.url === url)
  server.ok = false
  setTimeout(() => { server.ok = true }, 10_000)
}

let currentServer = servers[0]
export default async function failoverFetch (pathname, opts) {
  if (!currentServer?.ok) {
    currentServer = pickServer()
  }
  if (!currentServer) {
    throw new Error('Fail to fetch')
  }
  try {
    return await fetch(`${currentServer.url}/${pathname}`, opts)
  } catch (e) {
    console.warn(e)
    setServerDown(currentServer.url)
  }
  return await failoverFetch(pathname, opts)
}