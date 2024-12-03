import { App } from 'uWebSockets.js'

import { autoloadRoutes } from './src/index'

const port = +(process.env.PORT || 3000)

const app = await autoloadRoutes(App(), {
  pattern: '**/*.ts',
  // prefix: '/api',
  routesDir: './test/routes'
})

app.listen(port, (listenSocket) => {
  if (listenSocket) {
    console.log(`Server running at http://localhost:${port}`)
  } else {
    console.log(`Failed to listen to port ${port}`)
  }
})
