import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as path from 'path'

import {x} from './exec'
import {log} from './log'
import {join} from './path'

export async function download(url: string, filepath?: string | string[]): Promise<execa.ExecaReturns> {
  filepath = filepath ? join(filepath) : path.basename(url)
  log('download', url, filepath)
  await fs.mkdirp(path.dirname(filepath))
  return x('curl', ['-fsSLo', filepath, url])
}
