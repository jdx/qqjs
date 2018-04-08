import HTTP from 'http-call'
import * as loadJSONFile from 'load-json-file'
import * as writeJSONFile from 'write-json-file'

import {join} from './fs'
import {log} from './log'

/**
 * reads a json file in using load-json-file
 * this will automatically join the paths if you pass multiple strings with path.join()
 * can accept http urls
 */
export function readJSON(filepaths: string | string[]) {
  async function readJSONHTTP(url: string) {
    const {body} = await HTTP.get(url)
    return body
  }
  if (typeof filepaths === 'string' && filepaths.match(/https?:/)) return readJSONHTTP(filepaths)
  const filepath = join(filepaths)
  log('readJSON', filepath)
  return loadJSONFile(filepath)
}

/**
 * writes a json file with write-json-file
 * this will automatically join the paths if you pass an array of strings
 */
export function writeJSON(filepaths: string | string[], data: any, options: writeJSONFile.Options = {}) {
  const filepath = join(filepaths)
  log('writeJSON', filepath)
  return writeJSONFile(filepath, data, {indent: '  ', ...options})
}
