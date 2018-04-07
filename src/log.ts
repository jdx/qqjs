import chalk from 'chalk'
import * as os from 'os'

import * as config from './config'

export const debug = require('debug')('qq')

const homeRegexp = new RegExp(`\\B${os.homedir().replace('/', '\\/')}`, 'g')
const curRegexp = new RegExp(`\\B${process.cwd()}`, 'g')

export function log(...args: any[]) {
  const output = args.map(prettifyPaths).join(' ')
  debug(output)
  if (debug.enabled || config.silent) return
  console.log(`${chalk.gray('qq')} ${output}`)
}

export const prettifyPaths = (input: string) => input.toString().replace(curRegexp, '.').replace(homeRegexp, '~')
