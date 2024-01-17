import { Swaps } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const hashes = req.body || []
    const swaps = (await Swaps.find({ 'events.hash': { $in: hashes } })).map(swap => swap._doc)

    const missed = []
    for (let hash of hashes) {
      const swap = swaps.find(s => !!s.events.find(e => e.hash === hash))
      if (!swap) {
        missed.push(hash)
      }
    }
    res.json({ missed })
  }
}
