# uws-autoload

Plugin for [µWebSockets.js](https://github.com/uNetworking/uWebSockets.js) that autoloads all routes in a directory.

Inspired by [elysia-autoload](https://github.com/kravetsone/elysia-autoload).

## Installation

```sh
yarn add uws-autoload
```

## Usage

### Register the Plugin

```ts
import { App } from 'uWebSockets.js'
import { autoloadRoutes } from 'uws-autoload'

const port = +(process.env.PORT || 3000)

const app = await autoloadRoutes(App(), {
  // Pattern to scan route files
  pattern: '**/*.ts',
  // Prefix to add to routes
  prefix: '/api',
  // Source directory of route files: use "relative" path
  routesDir: './src/api'
})

app.listen(port, (listenSocket) => {
  if (listenSocket) {
    console.log(`Server running at http://localhost:${port}`)
  } else {
    console.log(`Failed to listen to port ${port}`)
  }
})
```

### Create a Route

```ts
// /routes/index.ts
import type { RecognizedString, TemplatedApp } from 'uWebSockets.js'

export default (pattern: RecognizedString, app: TemplatedApp) => app.get(pattern, (res, req) => {
  res.end('Hello World!')
})
```

### Directory Structure

Guide on how `uws-autoload` matches routes:

```
├── app.ts
├── routes
│   ├── index.ts         // index routes
│   ├── posts
│   │   ├── index.ts
│   │   └── [id].ts      // dynamic params
│   ├── likes
│   │   └── [...].ts     // wildcard
│   ├── domains
│   │   ├── @[...]       // wildcard with @ prefix
│   │   │   └── index.ts
│   ├── frontend
│   │   └── index.tsx    // usage of tsx extension
│   ├── events
│   │   ├── (post).ts    // post and get will not be in the link
│   │   └── (get).ts
│   └── users.ts
└── package.json
```

- `/routes/index.ts` → `/`
- `/routes/posts/index.ts` → `/posts`
- `/routes/posts/[id].ts` → `/posts/:id`
- `/routes/users.ts` → `/users`
- `/routes/likes/[...].ts` → `/likes/*`
- `/routes/domains/@[...]/index.ts` → `/domains/@*`
- `/routes/frontend/index.tsx` → `/frontend`
- `/routes/events/(post).ts` → `/events`
- `/routes/events/(get).ts` → `/events`

### Options

| Key               | Type    | Default                        | Description                                                       |
| ----------------- | ------- | ------------------------------ | ----------------------------------------------------------------- |
| failGlob?         | boolean | `true`                         | Throws an error if no matches are found                           |
| importKey?        | string  | `default`                      | The key (name) of the exported function of route files            |
| pattern?          | string  | `**/*.{ts,tsx,js,jsx,mjs,cjs}` | [Glob patterns](https://en.wikipedia.org/wiki/Glob_(programming)) |
| prefix?           | string  | ` `                            | Prefix to be added to each route                                  |
| routesDir?        | string  | `./routes`                     | The folder where routes are located (use a *relative* path)       |
| skipImportErrors? | boolean | `false`                        | Throws an error if there is an import error of a route file       |

### Transpile
For `Vite` + Node.js and similar use cases, where `.ts` or `.tsx` files aren't transpiled, install [esbuild](https://github.com/evanw/esbuild).

*Note*:
> `Bun` internally transpiles every file it executes (both .js and .ts) → [Read more](https://bun.sh/docs/runtime/typescript#running-ts-files)

## License

This project is licensed under the [MIT License](LICENSE).
