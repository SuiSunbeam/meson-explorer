import { Queue } from '../../../../../lib/db'

export default async function handler(req, res) {
  const { type, networkId } = req.query

  if (type === 'blocks') {
    const done = await _getBlockByStatus(networkId, 'keyv')
    const failed = await _getBlockByStatus(networkId, '#failed')
    const running = await _getBlockByStatus(networkId, '#running')
    res.json({ result: { done, failed, running } })
  } else if (type === 'txs') {
    const done = await _getTxByStatus(networkId, 'keyv')
    const failed = await _getTxByStatus(networkId, '#failed')
    const running = await _getTxByStatus(networkId, '#running')
    res.json({ result: { done, failed, running } })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get queued data' } })
  }
}

async function _getBlockByStatus(networkId, status = 'keyv') {
  const tasks = await Queue.find({ key: {
    $gt: `${status}:${networkId}|fetchBlock`,
    $lt: `${status}:${networkId}|fetchBlock~`
  } })
  const blocks = tasks.map(task => {
    const [_, k1, hash] = task.key.split('|')
    const n = Number(k1.split(':')[1])
    return { hash, n }
  }).sort((x, y) => y.n - x.n)

  return blocks.slice(0, Math.floor(blocks.length * 0.99))
}

async function _getTxByStatus(networkId, status = 'keyv') {
  const tasks = await Queue.find({ key: {
    $gt: `${status}:${networkId}|onTransaction`,
    $lt: `${status}:${networkId}|onTransaction~`
  } })
  return tasks.map(task => {
    const [_, k1] = task.key.split('|')
    const hash = k1.split(':')[1]
    const { args, result } = JSON.parse(task.value).value
    const { blockNumber, timestamp } = args[0]
    const type = result.swap.type
    const encoded = result.swap._encoded
    return { type, encoded, hash, n: parseInt(blockNumber), ts: parseInt(timestamp) }
  })
}