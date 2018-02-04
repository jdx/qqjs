import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as loadJSONFile from 'load-json-file'
import * as _ from 'lodash'
import * as path from 'path'
import * as writeJSONFile from 'write-json-file'

export const config = {
  silent: false
}

function log(...args: any[]) {
  if (config.silent) return
  const output = args.join(' ')
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
export function readJSON(...filepaths: string[]) {
  const filepath = path.join(...filepaths)
  log('readJSON', filepath)
  return loadJSONFile.sync(filepath)
}

/**
 * writes a json file with write-json-file
 * this will automatically join the paths if you pass multiple strings with path.join()
 */
export function writeJSON(filepath: string, data: any, options: writeJSONFile.Options = {}) {
  log('writeJSON', filepath)
  writeJSONFile.sync(filepath, data, options)
}

/**
 * creates a directory if it does not exist
 * this will automatically join the paths if you pass multiple strings with path.join()
 */
export function mkdirp(...filepaths: string[]) {
  const filepath = path.join(...filepaths)
  log('mkdirp', filepath)
  fs.mkdirp(filepath)
}

/**
 * we export path so you don't have to include it yourself
 */
export {path}
