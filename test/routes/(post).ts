// routes/(post).ts

import type { TemplatedApp } from 'uWebSockets.js'

export default ((res) => {
  res.end('Hello World!')
}) satisfies Parameters<TemplatedApp['post']>[1]
