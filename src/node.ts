import * as PkgDir from 'pkg-dir'

import {join} from './fs'
import {log} from './log'

export function pkgDir(fp?: string) {
  const f = join(fp || process.cwd())
  log('pkgDir', f)
  return PkgDir(f)
}

export namespace pkgDir {
  export function sync(fp?: string) {
    const f = join(fp || process.cwd())
    log('pkgDir.sync', f)
    return PkgDir.sync(f)
  }
}
