import { MongoClient } from 'mongodb'

const { MONGO_URL_APP } = process.env

if (!MONGO_URL_APP) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const client = new MongoClient(MONGO_URL_APP, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})

export default client.connect()
