import { Swaps } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { r = 'missed', hashes, addrs } = req.body || {}
    const query = {}
    let checkList
    let match
    if (Array.isArray(hashes)) {
      checkList = hashes
      query['events.hash'] = { $in: hashes }
      match = (swap, hash) => !!swap.events.find(e => e.hash === hash)
    } else if (Array.isArray(addrs)) {
      checkList = addrs.map(addr => addr.toLowerCase())
      query['fromTo'] = { $in: checkList }
      match = (swap, addr) => !!swap.fromTo.find(a => a === addr)
    } else {
      res.status(400).send()
      return
    }

    const swaps = (await Swaps.find(query)).map(swap => swap._doc)
    const list = []
    for (let item of checkList) {
      const swap = swaps.find(s => match(s, item))
      if (!!swap === (r === 'missed')) {
        list.push(item)
      }
    }
    res.json({ list })
  }
}
