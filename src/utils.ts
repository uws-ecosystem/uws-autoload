export const transformToRoute = (path: string) => path
  // Clean the url extensions
  .replace(/\.(ts|tsx|mjs|js|jsx|cjs)$/u, '')
  // Fix windows slashes
  .replaceAll('\\', '/')
  // Handle wild card based routes - users/[...id]/profile.ts -> users/*/profile
  .replaceAll(/\[\.\.\..*\]/gu, '*')
  // Handle generic square bracket based routes - users/[id]/index.ts -> users/:id
  .replaceAll(/\[(.*?)\]/gu, (_: string, match: string) => `:${match}`)
  .replace(/\/?\((.*)\)/, '')
  // Handle the case when multiple parameters are present in one file
  // users / [id] - [name].ts to users /: id -:name and users / [id] - [name] / [age].ts to users /: id -: name /: age
  .replaceAll(']-[', '-:')
  .replaceAll(']/', '/')
  .replaceAll(/\[|\]/gu, '')
  // remove index from end of path
  .replace(/\/?index$/, '')
