// routes/(get).ts

import type { TemplatedApp } from 'uWebSockets.js'

export default ((res) => {
  res.end('Hello World!')
}) satisfies Parameters<TemplatedApp['get']>[1]
