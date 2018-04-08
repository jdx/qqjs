import * as crypto from 'crypto'
import * as fs from 'fs-extra'
import * as Glob from 'glob'
import * as _globby from 'globby'
import * as _ from 'lodash'
import * as os from 'os'
import * as path from 'path'
import * as tmp from 'tmp'
import {promisify} from 'util'

import {log} from './log'
export const home = os.homedir()
export {path}

/**
 * easier to use version of path.join()
 * runs _.flattenDeep() on the arguments so you can pass things in like join(['foo', 'bar']) or join('foo', 'bar')
 * it can even take in complicated things like join('foo', ['bar', 'baz'], ['bak', ['baf', 'whoa']])
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
  console.dir(filepath)
  console.dir(_.flattenDeep(filepath))
  return path.join(..._.flattenDeep(filepath) as string[])
}

/**
 * creates a directory if it does not exist
 * this will automatically join the paths if you pass multiple strings with path.join()
 */
export async function mkdirp(...filepaths: (string | string[])[]) {
  for (let f of filepaths.map(join)) {
    log('mkdirp', f)
    await fs.mkdirp(f)
  }
}
export namespace mkdirp {
  export function sync(...filepaths: (string | string[])[]) {
    for (let f of filepaths.map(join)) {
      log('mkdirpSync', f)
      fs.mkdirpSync(f)
    }
  }
}

/**
 * glob matcher (find files)
 */
export function globby(patterns: string | string[], options: Glob.IOptions = {}) {
  log('globby', ...patterns)
  return _globby(patterns, options)
}

/**
 * output string to file
 * creates directory if not exists
 */
export function write(filepaths: string | string[], data: any, options = {}) {
  const filepath = join(filepaths)
  log('write', filepath)
  return fs.outputFile(filepath, data, options)
}

/**
 * read file into string
 */
export function read(filepaths: string | string[], options = {}) {
  const filepath = join(filepaths)
  log('read', filepath)
  return fs.readFile(filepath, options)
}

/**
 * cd into a directory
 */
export function cd(filepaths: string | string[]) {
  const filepath = join(filepaths)
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

/**
 * list files in directory
 */
export async function ls(filepaths?: string | string[], options: {fullpath?: boolean} = {}) {
  const filepath = join(filepaths)
  // log('ls', filepath)
  const files = await fs.readdir(filepath)
  if (options.fullpath) return files.map(f => join([filepath, f]))
  else return files
}

export async function fileType(fp: string | string[]): Promise<'file' | 'directory' | 'symlink' | undefined> {
  try {
    const stats = await fs.stat(join(fp))
    if (stats.isSymbolicLink()) return 'symlink'
    if (stats.isDirectory()) return 'directory'
    if (stats.isFile()) return 'file'
  } catch (err) {
    if (err.code === 'ENOENT') return
    throw err
  }
}

/**
 * copy files with fs.copy
 * can copy directories
 */
export async function cp(source: string | string[], destinationpaths: string | string[], options = {}) {
  source = join(source)
  let dest = join(destinationpaths)
  switch (await fileType(dest)) {
    case 'directory':
      dest = path.join(dest, path.basename(source))
      break
      case 'file':
      await rm(dest)
  }
  log('cp', source, dest)
  return fs.copy(source, dest, options)
}

/**
 * rm -rf
 */
export async function rm(...filesArray: (string | string[])[]) {
  for (let f of filesArray.map(join)) {
    log('rm', f)
    await fs.remove(f)
  }
}

export async function rmIfEmpty(...filesArray: (string | string[])[]) {
  const rmdir = async (f: string) => {
    let removedSomething = false
    const getFiles = async () => (await ls(f)).map(s => join([f, s]))
    let files = await getFiles()
    for (let subdir of files) {
      if ((await fileType(subdir)) === 'directory') {
        await rmdir(subdir)
        removedSomething = true
      }
    }
    // check files again if we removed any
    if (removedSomething) files = await getFiles()
    if (files.length === 0) await rm(f)
  }
  for (let f of filesArray.map(join)) {
    log('rmIfEmpty', f)
    await rmdir(f)
  }
}

export async function mv(source: string | string[], dest: string | string[]) {
  source = join(source)
  dest = join(dest)
  switch (await fileType(dest)) {
    case 'directory':
      dest = path.join(dest, path.basename(source))
      break
    case 'file':
      await rm(dest)
  }
  log('mv', source, dest)
  return fs.move(source, dest)
}

export async function exists(filepath: string | string[]) {
  filepath = join(filepath)
  const exists = await fs.pathExists(filepath)
  log('exists', filepath, exists)
  return exists
}

export namespace exists {
  export function sync(filepath: string | string[]) {
    filepath = join(filepath)
    const exists = fs.pathExistsSync(filepath)
    log('exists.sync', filepath, exists)
    return exists
  }
}

export function cwd() {
  const cwd = process.cwd()
  log('cwd', cwd)
  return cwd
}

export function chmod(filepath: string | string[], mode: number) {
  filepath = join(filepath)
  log('chmod', filepath, mode.toString(8))
  return fs.chmod(filepath, mode)
}

/**
 * create a new temporary directory
 * uses tmp
 */
export async function tmpDir(): Promise<string> {
  const output = await (promisify(tmp.dir) as any)()
  log('tmpDir', output.name)
  return output.name
}

export async function emptyDir(filepath: string | string[]) {
  filepath = join(filepath)
  log('emptyDir', filepath)
  await fs.mkdirp(path.dirname(filepath))
  return fs.emptyDir(filepath)
}

export async function hash(algo: string, fp: string | string[]) {
  const f = join(fp)
  log('hash', algo, f)
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash(algo)
    const stream = fs.createReadStream(f)
    stream.on('error', err => reject(err))
    stream.on('data', chunk => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}
