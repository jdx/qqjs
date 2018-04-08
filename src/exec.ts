import * as execa from 'execa'
import * as _ from 'lodash'

import {debug, log} from './log'

/**
 * easy access to process.env
 */
export const env = process.env

/**
 * run a command
 *
 * pass in a string to have it run with execa.shell(), or an file and array of strings for execa()
 */
export async function x(cmd: string, options?: execa.Options): Promise<execa.ExecaReturns>
export async function x(cmd: string, args: string[], options?: execa.Options): Promise<execa.ExecaReturns>
export async function x(cmd: string, args?: string[] | execa.Options, options: execa.Options = {}): Promise<execa.ExecaReturns> {
  if (_.isArray(args)) return x.exec(cmd, args, options)
  else return x.shell(cmd, args)
}
export namespace x {
  export function exec(cmd: string, args: string[], options: execa.Options = {}) {
    options = {stdio: 'inherit', ...options}
    log('$', cmd, ...args)
    return execa(cmd, args, options)
  }
  export function shell(cmd: string, options: execa.Options = {}) {
    options = {stdio: 'inherit', ...options}
    log('$', cmd)
    return execa.shell(cmd, options)
  }
  export async function stdout(cmd: string, args: string[] = [], options: execa.Options = {}): Promise<string> {
    const getStream = require('get-stream')
    options = {stdio: [0, 'pipe', 2], ...options}
    log('$', cmd, ...args)
    const stream = execa(cmd, args, options).stdout
    if (debug.enabled) stream.pipe(process.stdout)
    const stdout = await getStream(stream)
    return stdout.replace(/\n$/, '')
  }
}
