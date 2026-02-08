import http from 'http'
import { createApp } from './app.js'
import { connectDb } from './config/db.js'
import { env } from './config/env.js'
import { initSocket } from './sockets/index.js'

const app = createApp()
const server = http.createServer(app)

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.port} is already in use`)
  } else {
    console.error('Server error', error)
  }
  process.exit(1)
})

const start = async () => {
  await connectDb()
  initSocket(server)

  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
