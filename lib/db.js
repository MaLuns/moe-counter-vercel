import { MongoClient, ServerApiVersion } from 'mongodb'

// the default mongodb url (local server)
const mongodbURL = process.env.MONGODB_PATH || 'mongodb://127.0.0.1:27017'

const client = new MongoClient(mongodbURL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

const count = client.db('count').collection('tb_count')

export const getNum = async (name) => count.findOne({ name })

export const getAll = async () => count.find({})

export const setNum = async (name, num) => count.findOneAndUpdate({ name }, { name, num }, { upsert: true })

export const setNumMulti = (counters) => {
  const bulkOps = counters.map(obj => {
    const { name, num } = obj
    return {
      updateOne: {
        filter: { name },
        update: {
          $set: { name, num }
        },
        upsert: true
      }
    }
  })
  return count.bulkWrite(bulkOps, { ordered: false })
}
