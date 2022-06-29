import mongoose from 'mongoose'

import { SwapSchema, QueueSchema } from './schema'

mongoose.connect(process.env.MONGO_URL_RELEAYER)
.then(() => console.log('[mongodb] Connected!'))
.catch(error => console.warn('[mongodb]', error.message))

mongoose.connection.on('error', err => console.warn('[mongodb]', err.message))

export const Swaps = mongoose.models.swaps || mongoose.model('swaps', SwapSchema)
export const Queues = mongoose.models.queue || mongoose.model('queue', QueueSchema, '_queue')
