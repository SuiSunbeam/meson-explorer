import mongoose from 'mongoose'

import {
  SwapSchema,
  QueueSchema,
  RulesSchema,
  ShareSchema,
  ShareCodeSchema
} from './schema'

const relayerDb = mongoose.createConnection(process.env.MONGO_URL_RELEAYER)
relayerDb.on('connection', () => console.log('[mongodb] Realyer DB Connected!'))
relayerDb.on('error', err => console.warn('[mongodb] Realyer DB', err.message))

const appDb = mongoose.createConnection(process.env.MONGO_URL_APP)
appDb.on('connection', () => console.log('[mongodb] App DB Connected!'))
appDb.on('error', err => console.warn('[mongodb] App DB', err.message))

export const Swaps = relayerDb.model('swaps', SwapSchema)
export const Queue = relayerDb.model('queue', QueueSchema, '_queue')
export const Rules = relayerDb.model('rules', RulesSchema)

export const Shares = appDb.model('shares', ShareSchema)
export const ShareCodes = appDb.model('share_codes', ShareCodeSchema)
