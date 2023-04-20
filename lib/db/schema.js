import mongoose from 'mongoose'

mongoose.pluralize(null)

const EventsSchema = mongoose.Schema({
  name: String,
  hash: String,
  recipient: String
}, { _id: false })

export const SwapSchema = new mongoose.Schema({
  _id: String,
  encoded: String,
  v: Number,
  events: {
    type: [EventsSchema],
    default: []
  },
  inChain: String,
  inToken: Number,
  initiator: String,
  fromTo: [String],
  fromContract: String,
  outChain: String,
  outToken: Number,
  amount: Number,
  lpFee: Number,
  srFee: Number,
  salt: String,
  expireTs: Date,
  signature: String,
  releaseSignature: String,
  created: { type: Date, index: true },
  posted: Date,
  bonded: Date,
  locked: Date,
  unlocked: Date,
  releasing: Date,
  executed: Date,
  released: Date,
  cancelled: Date,
  disabled: Boolean,
  hide: Boolean
}, {
  timestamps: { createdAt: 'created', updatedAt: 'updated' }
})

export const SwapFailsSchema = new mongoose.Schema({
  fails: Number,
  duration: Number,
  restart: Boolean,
  ts: { type: Date, expires: '5d' },
})

const RuleInitiatorSchema = mongoose.Schema({
  addr: String,
  note: String,
}, { _id: false })

export const RulesSchema = new mongoose.Schema({
  priority: { type: Number, unique: true },
  type: String,
  premium: Boolean,
  initiators: {
    type: [RuleInitiatorSchema],
    default: null,
  },
  mark: String,
  from: {
    type: String,
    default: '*'
  },
  to: {
    type: String,
    default: '*'
  },
  factor: Number,
  fee: {
    type: Array,
    default: []
  },
  limit: Number
})

export const FeeWaiveSchema = new mongoose.Schema({
  _id: String,
  date: { type: Date, expires: '3d' },
  initiator: String,
  waived: { type: Number, default: 0 },
  swaps: { type: Number, default: 0 }
})

export const LpWhitelistSchema = new mongoose.Schema({
  _id: String,
  name: String,
  quota: Number,
  deposit: { type: Number, default: 0 },
})

export const PremiumSchema = new mongoose.Schema({
  _id: String,
  initiator: String,
  hash: { type: String, unique: true },
  paid: Number,
  used: { type: Number, default: 0 },
  quota: { type: Number, default: 0 },
  since: Date,
  until: Date,
  hide: Boolean,
  meta: Object,
  params: Object,
})
PremiumSchema.path('since').get(d => d && Math.floor(d.valueOf() / 1000))
PremiumSchema.path('until').get(d => d && Math.floor(d.valueOf() / 1000))
PremiumSchema.set('toJSON', { getters: true, virtuals: false })

export const ShareSchema = new mongoose.Schema({
  _id: String,
  address: String,
  n: Number,
  seq: Number,
})

const BannerMetaSchema = mongoose.Schema({
  address: String,
}, { _id: false })

export const BannerSchema = new mongoose.Schema({
  text: String,
  address: [String],
  meta: [BannerMetaSchema],
})

export const AllsToSchema = new mongoose.Schema({
  addr: String,
  key: String,
  did: String,
  name: String,
  avatar: String,
  bio: String,
  networkId: String,
  tokens: [String],
  clicks: Number
}, {
  timestamps: { createdAt: 'created', updatedAt: 'updated' }
})
