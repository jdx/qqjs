import * as PkgDir from 'pkg-dir'

import {log} from './log'
import {join} from './path'

let _pkgDir: typeof PkgDir
const init = () => _pkgDir = _pkgDir || require('pkg-dir')

export function pkgDir(fp?: string) {
  init()
  const f = join(fp || process.cwd())
  log('pkgDir', f)
  return _pkgDir(f)
}

export namespace pkgDir {
  export function sync(fp?: string) {
    init()
    const f = join(fp || process.cwd())
    log('pkgDir.sync', f)
    return _pkgDir.sync(f)
  }
}
