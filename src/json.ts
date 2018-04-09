import HTTP from 'http-call'
import * as LoadJSONFile from 'load-json-file'
import * as WriteJSONFile from 'write-json-file'

import {log} from './log'
import {join} from './path'

const deps = {
  m: {} as any,
  get HTTP(): typeof HTTP { return this.m.HTTP = this.m.HTTP || require('http-call').default },
  get loadJSONFile(): typeof LoadJSONFile { return this.m.loadJSONFile = this.m.loadJSONFile || require('load-json-file') },
  get writeJSONFile(): typeof WriteJSONFile { return this.m.writeJSONFile = this.m.writeJSONFile || require('write-json-file') },
}

/**
 * reads a json file in using load-json-file
 * this will automatically join the paths if you pass multiple strings with path.join()
 * can accept http urls
 */
export function readJSON(filepaths: string | string[]) {
  async function readJSONHTTP(url: string) {
    const {body} = await deps.HTTP.get(url)
    return body
  }
  if (typeof filepaths === 'string' && filepaths.match(/https?:/)) return readJSONHTTP(filepaths)
  const filepath = join(filepaths)
  log('readJSON', filepath)
  return deps.loadJSONFile(filepath)
}

/**
 * writes a json file with write-json-file
 * this will automatically join the paths if you pass an array of strings
 */
export function writeJSON(filepaths: string | string[], data: any, options: WriteJSONFile.Options = {}) {
  const filepath = join(filepaths)
  log('writeJSON', filepath)
  return deps.writeJSONFile(filepath, data, {indent: '  ', ...options})
}
