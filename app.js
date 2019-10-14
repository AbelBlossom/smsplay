import http from 'http'
import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'
import cors from 'cors'
import mongoose from 'mongoose'
require('dotenv').config()
const app = express()
app.use('*', cors())

const envData = process.env
console.log({ envData })
mongoose.connect(
  `mongodb+srv://${envData.MONGO_USERNAME}:${envData.MONGO_PASSWORD}@cluster0-vdkcs.mongodb.net/test?retryWrites=true&w=majority`,
  { useNewUrlParser: true },
  err => {
    if (!err) console.debug('Mongoose connected')
    else console.error('Mongoose connection failed')
  }
)
mongoose.set('useFindAndModify', false)
const typeDefs = gql`
  type Query {
    hello: String
  }
`
const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: {
    Query: {
      hello: () => 'hii',
    },
  },
  context: async ({ req }) => {
    const token = req.query.token || req.headers.authorization || ''
    const user = await Users.findOne({ token })
    if (user) {
      return {
        authUser: user,
      }
    }
  },
})

server.applyMiddleware({ app, path: '/graphql' })
const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)
httpServer.listen(3000, () => {
  console.log('Server started')
})
