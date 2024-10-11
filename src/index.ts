import fs from 'node:fs'

import type { TemplatedApp } from 'uWebSockets.js'

import { sortByNestedParams, transformToRoute } from './utils'

type SoftString<T extends string> = T | (string & {})

const ROUTES_DIR_DEFAULT = './routes'
const PATTERN_DEFAULT = '**/*.{ts,tsx,mjs,js,jsx,cjs}'

export const autoloadRoutes = ({
  importKey = 'default',
  failGlob = true,
  pattern = PATTERN_DEFAULT,
  prefix = '',
  routesDir = ROUTES_DIR_DEFAULT,
  skipImportErrors = false
}: {
  /**
    * Import a specific `export` from a file
    * @example import first export
    * ```ts
    * importKey: 'default' || (file) => Object.keys(file).at(0)
    * ```
    * @default 'default'
    */
  importKey?: SoftString<'default'> | ((file: unknown) => string)
  /**
    * Throws an error if no matches are found
    * @default true
    */
  failGlob?: boolean
  /**
    * Pattern
    * @example pattern only .ts files
    * ```ts
    * pattern: '**\/*.ts'
    * ```
    * @default '**\/*.{ts,tsx,mjs,js,jsx,cjs}'
    */
  pattern?: string
  /**
    * Prefix of routes
    * @example prefix for APIs
    * ```ts
    * prefix: '/api'
    * ```
    * @default ts,tsx,mjs,js,jsx,cjs
    */
  prefix?: string
  routesDir?: string
  /**
    * Skip imports where needed `export` not defined
    * @default false
    */
  skipImportErrors?: boolean
}) => async (app: TemplatedApp) => {
  if (fs.existsSync(routesDir) === false)
    throw new Error(`Directory ${routesDir} doesn't exist`)
  if (fs.statSync(routesDir).isDirectory() === false)
    throw new Error(`${routesDir} isn't a directory`)

  const files = typeof Bun === 'undefined'
    ? fs.globSync(pattern, { cwd: routesDir })
    : await Array.fromAsync((new Bun.Glob(pattern)).scan({ cwd: routesDir }))
  if (failGlob && files.length === 0)
    throw new Error(`No matches found in ${routesDir} (you can disable this error with 'failGlob' option to false)`)
  for (const file of sortByNestedParams(files)) {
    const filePath = `${routesDir}/${file}`
    const importedFile = await import(/* @vite-ignore */ filePath)
    const reolvedImportName = typeof importKey === 'string' ? importKey : importKey(file)
    const importedRoute = importedFile[reolvedImportName]
    if (!importedRoute && skipImportErrors === false) {
      throw new Error(`${filePath} doesn't export ${reolvedImportName}`)
    }
    const route = `${prefix}/${transformToRoute(file)}`
    if (typeof importedRoute === 'function') {
      if (importedRoute.length === 2) {
        importedRoute(route, app)
      } else {
        console.warn(`Exported function of ${filePath} must have 2 parameters (route isn't added)`)
      }
    }
  }

  return app
}
