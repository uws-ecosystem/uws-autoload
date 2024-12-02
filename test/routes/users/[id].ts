// routes/users/[id].ts

import type { RecognizedString, TemplatedApp } from 'uWebSockets.js'

export default (pattern: RecognizedString, app: TemplatedApp) => app.get(pattern, (res) => {
  res.end('Hello World!')
})
