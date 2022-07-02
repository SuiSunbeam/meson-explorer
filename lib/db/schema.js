import mongoose from 'mongoose'

const EventsSchema = mongoose.Schema({
  name: String,
  hash: String,
  recipient: String
}, { _id: false })

export const SwapSchema = new mongoose.Schema({
  _id: String,
  encoded: String,
  events: {
    type: [EventsSchema],
    default: []
  },
  inChain: String,
  inToken: Number,
  initiator: String,
  fromTo: [String],
  outChain: String,
  outToken: Number,
  amount: Number,
  fee: Number,
  salt: String,
  expireTs: Date,
  provider: {
    type: String,
    default: ''
  },
  signature: {
    type: Array,
    default: () => undefined
  },
  releaseSignature: {
    type: Array,
    default: () => undefined
  },
  created: { type: Date, index: true },
  posted: Date,
  bonded: Date,
  locked: Date,
  unlocked: Date,
  releasing: Date,
  executed: Date,
  released: Date,
  cancelled: Date,
  disabled: Boolean
}, {
  timestamps: { createdAt: 'created', updatedAt: 'updated' }
})

export const QueueSchema = new mongoose.Schema({
  key: String,
  expiresAt: Date,
  value: String,
})

export const ShareSchema = new mongoose.Schema({
  _id: String,
  address: { type: String, unique: true, sparse: true },
  n: { type: Number, default: 0 },
  seq: { type: Number, default: 0 },
})

export const ShareCodeSchema = new mongoose.Schema({
  _id: String,
  code: String,
  encoded: String,
  duration: Number,
  locale: String,
  n: { type: Number, default: 0 },
  updated: { type: Date, expires: '1s' },
})
