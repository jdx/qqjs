import * as execa from 'execa'
import * as _ from 'lodash'
import * as path from 'path'

import {x} from './exec'
import {log} from './log'

export * from './fs'

export function download(url: string, filepath: string | string[]): Promise<execa.ExecaReturns> {
  filepath = path.join(..._.castArray(filepath))
  log('download', url, filepath)
  return x('curl', ['-fsSLo', filepath, url])
}
