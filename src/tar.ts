import * as fs from 'fs-extra'
import * as Tar from 'tar-fs'

import {join} from './path'

const deps = {
  m: {} as any,
  get tar(): typeof Tar { return this.m.tar = this.m.tar || require('tar-fs') },
}

export const tar = {
  gz: {
    pack(from: string | string[], to: string | string[], options: Tar.PackOptions = {}) {
      const _from = join(from)
      const _to = join(to)
      return new Promise((resolve, reject) => {
        deps.tar
        .pack(_from, options)
        .pipe(fs.createWriteStream(_to))
        .on('error', reject)
        .on('finish', resolve)
      })
    }
  }
}
