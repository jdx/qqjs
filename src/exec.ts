import * as Execa from 'execa'

import {debug, log} from './log'

const m = {
  m: {} as any,
  get execa(): typeof Execa { return this.m.execa = this.m.execa || require('execa') },
}

/**
 * easy access to process.env
 */
export const env = process.env

/**
 * run a command
 *
 * pass in a string to have it run with execa.shell(), or an file and array of strings for execa()
 */
export async function x(cmd: string, options?: Execa.Options): Promise<Execa.ExecaReturns>
export async function x(cmd: string, args: string[], options?: Execa.Options): Promise<Execa.ExecaReturns>
export async function x(cmd: string, args?: string[] | Execa.Options, options: Execa.Options = {}): Promise<Execa.ExecaReturns> {
  if (Array.isArray(args)) return x.exec(cmd, args, options)
  else return x.shell(cmd, args)
}
export namespace x {
  export function exec(cmd: string, args: string[], options: Execa.Options = {}) {
    options = {stdio: 'inherit', ...options}
    log('$', cmd, ...args)
    return m.execa(cmd, args, options)
  }
  export function shell(cmd: string, options: Execa.Options = {}) {
    options = {stdio: 'inherit', ...options}
    log('$', cmd)
    return m.execa.shell(cmd, options)
  }
  export async function stdout(cmd: string, args: string[] = [], options: Execa.Options = {}): Promise<string> {
    const getStream = require('get-stream')
    options = {stdio: [0, 'pipe', 2], ...options}
    log('$', cmd, ...args)
    const ps = m.execa(cmd, args, options)
    return new Promise<string>((resolve, reject) => {
      ps.on('error', reject)
      if (debug.enabled) ps.stdout.pipe(process.stdout)
      Promise.all([
        getStream(ps.stdout).then((o: string) => o.replace(/\n$/, '')),
        ps,
      ])
      .then(([stdout]) => resolve(stdout))
      .catch(reject)
    })
  }
}
