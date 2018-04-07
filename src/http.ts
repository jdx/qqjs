import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as path from 'path'

import {x} from './exec'
import {log} from './log'

export async function download(url: string, filepath?: string | string[]): Promise<execa.ExecaReturns> {
  filepath = filepath ? path.join(..._.castArray(filepath)) : path.basename(url)
  log('download', url, filepath)
  await fs.mkdirp(path.dirname(filepath))
  return x('curl', ['-fsSLo', filepath, url])
}
