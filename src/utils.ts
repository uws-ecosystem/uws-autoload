import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

let esbuild: typeof import('esbuild') | undefined

const countParams = (filepath: string): number => {
  return (filepath.match(/\[(.*?)\]/gu) || []).length
}

/**
 * Sorts routes by the number of parameters in ascending order.
 * ['/user/[id]', '/user/name'] → ['/user/name', '/user/[id]']
 */
export const sortRoutesByParams = (routes: string[]): string[] => {
  return routes.sort((a, b) => countParams(a) - countParams(b))
}

export const transformToRoute = (filepath: string): string => {
  return filepath
    // Clean the url extensions
    .replace(/\.(ts|tsx|mjs|js|jsx|cjs)$/u, '')
    // Fix windows slashes
    .replaceAll('\\', '/')
    // Handle wild card based routes
    // users/[...id]/profile.ts → users/*/profile
    .replaceAll(/\[\.\.\..*?\]/gu, '*')
    // Handle generic square bracket based routes
    // users/[id]/index.ts → users/:id
    .replaceAll(/\[(.+?)\]/gu, (_: string, match: string) => `:${match}`)
    // Remove optional parameters
    .replace(/\/?\((.*?)\)/, '')
    // Handle the case when multiple parameters are present in one file
    // users/[id]-[name].ts → users/:id-:name
    // users/[id]-[name]/[age].ts → users/:id-:name/:age
    .replaceAll(']-[', '-:')
    .replaceAll(']/', '/')
    .replaceAll(/\[|\]/gu, '')
    // Remove index from end of path
    .replace(/\/?index$/, '')
}

//#region https://github.com/vikejs/vike/blob/main/vike/utils/getRandomId.ts
const getRandomId = (length: number): string => {
  let randomId = ''
  while (randomId.length < length) {
    randomId += Math.random().toString(36).slice(2)
  }
  return randomId.slice(0, length)
}
//#endregion

//#region https://github.com/vikejs/vike/blob/main/vike/node/plugin/plugins/importUserCode/v1-design/getVikeConfig/transpileAndExecuteFile.ts
/**
 * Transpile a file with esbuild
 */
const transpileWithEsbuild = async (filePath: string): Promise<string> => {
  if (!esbuild) {
    try {
      esbuild = await import('esbuild')
    } catch (error) {
      throw new Error(`Failed to load 'esbuild': ${error}`)
    }
  }
  const result = await esbuild.build({
    platform: 'node',
    entryPoints: [filePath],
    write: false,
    target: ['esnext'],
    logLevel: 'silent',
    format: 'esm',
    absWorkingDir: process.cwd(),
    bundle: true
  })

  return result.outputFiles[0].text
}

/**
 * Get a temporary file path
 */
const getTemporaryBuildFilePath = (filePath: string): string => {
  const dirname = path.posix.dirname(filePath)
  const filename = path.posix.basename(filePath)
  return path.posix.join(dirname, `${filename}.build-${getRandomId(12)}.mjs`)
}

/**
 * Execute a file
 * Old function name: `executeTranspiledFile`
 */
export const importFile = async (filePath: string): Promise<Record<string, unknown>> => {
  const code = await transpileWithEsbuild(filePath)
  // Alternative to using a temporary file: https://github.com/vitejs/vite/pull/13269
  //  - But seems to break source maps, so I don't think it's worth it
  const filePathTmp = getTemporaryBuildFilePath(filePath)
  fs.writeFileSync(filePathTmp, code)
  try {
    return await import(pathToFileURL(filePathTmp).href)
  } finally {
    // Clean
    fs.unlinkSync(filePathTmp)
  }
}
//#endregion
