import * as os from 'os'
import * as path from 'path'

import {log} from './log'
export const home = os.homedir()
export {path}

const flatten = <T>(arr: (T | T[])[]): T[] => arr.reduce((acc, val) => acc.concat(val), [] as any)

/**
 * easier to use version of path.join()
 * flattens args so you can pass things in like join(['foo', 'bar']) or join('foo', 'bar')
 * the point of this is to make it so all the different qqjs tools can take in arrays as arguments to be joined
 * defaults to process.cwd()
 */
export function join(filepath?: string | string[]): string
export function join(...filepath: string[]): string
export function join(...filepath: (string | string[] | undefined)[]): string {
  // tslint:disable-next-line strict-type-predicates
  if (typeof filepath[1] === 'number' && Array.isArray(filepath[2])) {
    // this is being called with .map()
    filepath = [filepath[0]]
  }
  if (!filepath.length) return process.cwd()
  return path.join(...flatten(filepath as any) as string[])
}

/**
 * cd into a directory
 */
export function cd(filepaths: string | string[]) {
  const filepath = join(filepaths)
  if (filepath === process.cwd()) return // don't log if no change
  log('cd', filepath)
  return process.chdir(filepath)
}

const origPath = process.cwd()
const pushdPaths: string[] = []
export function pushd(filepaths: string | string[]) {
  const f = join(filepaths)
  log('pushd', f)
  pushdPaths.push(process.cwd())
  return process.chdir(f)
}

export function popd() {
  const f = pushdPaths.pop() || origPath
  log('popd', f)
  return process.chdir(f)
}

export function cwd() {
  const cwd = process.cwd()
  log('cwd', cwd)
  return cwd
}
