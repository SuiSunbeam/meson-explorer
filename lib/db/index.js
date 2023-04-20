import mongoose from 'mongoose'

import {
  SwapSchema,
  SwapFailsSchema,
  RulesSchema,
  FeeWaiveSchema,
  LpWhitelistSchema,
  PremiumSchema,
  ShareSchema,
  BannerSchema,
  AllsToSchema
} from './schema'

const relayerDb = mongoose.createConnection(process.env.MONGO_URL_RELEAYER)
relayerDb.on('connection', () => console.log('[mongodb] Realyer DB Connected!'))
relayerDb.on('error', err => console.warn('[mongodb] Realyer DB', err.message))

const appDb = mongoose.createConnection(process.env.MONGO_URL_APP)
appDb.on('connection', () => console.log('[mongodb] App DB Connected!'))
appDb.on('error', err => console.warn('[mongodb] App DB', err.message))

export const Swaps = relayerDb.model('swaps', SwapSchema)
export const SwapFails = relayerDb.model('swaps_fails', SwapFailsSchema)
export const Rules = relayerDb.model('rules', RulesSchema)
export const FeeWaives = relayerDb.model('fee_waives', FeeWaiveSchema)
export const LpWhitelist = relayerDb.model('lp_whitelist', LpWhitelistSchema)
export const Premiums = relayerDb.model('premiums', PremiumSchema)

export const Shares = appDb.model('shares', ShareSchema)
export const Banners = appDb.model('banners', BannerSchema)
export const AllsTo = appDb.model('alls.to', AllsToSchema, 'alls.to')
