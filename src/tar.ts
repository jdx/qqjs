import * as fs from 'fs-extra'
import * as Tar from 'tar-fs'

import {join} from './fs'

export const tar = {
  gz: {
    pack(from: string | string[], to: string | string[], options: Tar.PackOptions = {}) {
      const _from = join(from)
      const _to = join(to)
      return new Promise((resolve, reject) => {
        Tar
        .pack(_from, options)
        .pipe(fs.createReadStream(_to))
        .on('error', reject)
        .on('finish', resolve)
      })
    }
  }
}
