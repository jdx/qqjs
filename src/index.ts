import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as Glob from 'glob'
import * as _globby from 'globby'
import * as loadJSONFile from 'load-json-file'
import * as _ from 'lodash'
import * as os from 'os'
import * as path from 'path'
import * as tmp from 'tmp'
import * as writeJSONFile from 'write-json-file'

export const config = {
  silent: false
}

const homeRegexp = new RegExp(os.homedir(), 'g')
const curRegexp = new RegExp(process.cwd(), 'g')

function log(...args: any[]) {
  if (config.silent) return
  const output = args
  .map(a => a
    .replace(curRegexp, '.')
    .replace(homeRegexp, '~'))
  .join(' ')
  console.log(`$ ${output}`)
}

/**
 * run a command
 *
 * pass in a string to have it run with execa.shellSync(), or an file and array of strings for execa.sync()
 */
export function x(cmd: string, options?: execa.SyncOptions): execa.ExecaReturns
export function x(cmd: string, args: string[], options?: execa.SyncOptions): execa.ExecaReturns
export function x(cmd: string, args?: string[] | execa.SyncOptions, options: execa.SyncOptions = {}): execa.ExecaReturns {
  if (_.isArray(args)) return x.exec(cmd, args, options)
  else return x.shell(cmd, args)
}
export namespace x {
  export function exec(cmd: string, args: string[], options: execa.SyncOptions = {}) {
    options = {stdio: 'inherit', ...options}
    log(cmd, ...args)
    return execa.sync(cmd, args, options)
  }
  export function shell(cmd: string, options: execa.SyncOptions = {}) {
    options = {stdio: 'inherit', ...options}
    log(cmd)
    return execa.shellSync(cmd, options)
  }
}

/**
 * reads a json file in using load-json-file
 * this will automatically join the paths if you pass multiple strings with path.join()
 */
export function readJSON(filepaths: string | string[]) {
  const filepath = path.join(..._.castArray(filepaths))
  log('readJSON', filepath)
  return loadJSONFile.sync(filepath)
}

/**
 * writes a json file with write-json-file
 * this will automatically join the paths if you pass an array of strings
 */
export function writeJSON(filepaths: string | string[], data: any, options: writeJSONFile.Options = {}) {
  const filepath = path.join(..._.castArray(filepaths))
  log('writeJSON', filepath)
  writeJSONFile.sync(filepath, data, options)
}

/**
 * creates a directory if it does not exist
 * this will automatically join the paths if you pass multiple strings with path.join()
 */
export function mkdirp(...filepaths: (string | string[])[]) {
  for (let fp of filepaths) {
    const f = path.join(..._.castArray(fp))
    log('mkdirp', f)
    fs.mkdirpSync(f)
  }
}

/**
 * glob matcher (find files)
 */
export function globby(patterns: string | string[], options: Glob.IOptions = {}) {
  log('globby', ...patterns)
  return _globby.sync(patterns, options)
}

/**
 * output string to file
 * creates directory if not exists
 */
export function write(filepaths: string | string[], data: any, options = {}) {
  const filepath = path.join(..._.castArray(filepaths))
  log('write', filepath)
  return fs.outputFileSync(filepath, data, options)
}

/**
 * read file into string
 */
export function read(filepaths: string | string[], options = {}) {
  const filepath = path.join(..._.castArray(filepaths))
  log('read', filepath)
  return fs.readFileSync(filepath, options)
}

/**
 * cd into a directory
 */
export function cd(filepaths: string | string[]) {
  const filepath = path.join(..._.castArray(filepaths))
  log('cd', filepath)
  return process.chdir(filepath)
}

/**
 * list files in directory
 */
export function ls(filepaths: string | string[]) {
  const filepath = path.join(..._.castArray(filepaths))
  log('ls', filepath)
  return fs.readdirSync(filepath)
}

/**
 * copy files with fs.copy
 * can copy directories
 */
export function cp(source: string | string[], destinationpaths: string | string[], options = {}) {
  source = path.join(..._.castArray(source))
  let dest = path.join(..._.castArray(destinationpaths))
  try {
    if (fs.statSync(dest).isDirectory()) dest = path.join(dest, path.basename(source))
    if (fs.statSync(dest).isFile()) rm(dest)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  log('cp', source, dest)
  fs.copySync(source, dest, options)
}

/**
 * rm -rf
 */
export function rm(...filesArray: (string | string[])[]) {
  for (let f of filesArray) {
    f = path.join(..._.castArray(f))
    log('rm', f)
    fs.removeSync(f)
  }
}

export function mv(source: string | string[], dest: string | string[]) {
  source = path.join(..._.castArray(source))
  dest = path.join(..._.castArray(dest))
  try {
    if (fs.statSync(dest).isDirectory()) dest = path.join(dest, path.basename(source))
    if (fs.statSync(dest).isFile()) rm(dest)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  log('mv', source, dest)
  fs.moveSync(source, dest)
}

export function exists(filepath: string | string[]) {
  filepath = path.join(..._.castArray(filepath))
  const exists = fs.pathExistsSync(filepath)
  log('exists', filepath, exists)
  return exists
}

export function cwd() {
  const cwd = process.cwd()
  log('cwd', cwd)
  return cwd
}

export function home() {
  const home = os.homedir()
  log('home', home)
  return home
}

export function download(url: string, filepath: string | string[]) {
  filepath = path.join(..._.castArray(filepath))
  log('download', url, filepath)
  return x('curl', ['-fsSLo', filepath, url])
}

export function chmod(filepath: string | string[], mode: number) {
  filepath = path.join(..._.castArray(filepath))
  log('chmod', filepath, mode)
  return fs.chmodSync(filepath, mode)
}

/**
 * we export path so you don't have to include it yourself
 */
export {path}
/**
 * easy access to process.env
 */
export const env = process.env

/**
 * create a new temporary directory
 * uses tmp
 */
export function tmpDir(): string {
  const output = tmp.dirSync()
  log('tmpDir', output.name)
  return output.name
}
