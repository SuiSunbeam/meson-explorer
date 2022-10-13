import { onPremiumPaid } from './[initiator]'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // TODO: For relayer only
    try {
      const result = await onPremiumPaid(req.body)
      res.json({ result })
    } catch (e) {
      res.status(400).json({ error: { code: -32602, message: `Failed to post premium: ${e.message}` } })
    }
  } else {
    res.status(404).send()
  }
}
