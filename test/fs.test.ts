import {expect} from 'chai'

import * as qq from '../src'

const root = qq.join([qq.pkgDir.sync()!, 'tmp'])

describe('rmIfEmpty', () => {
  beforeEach(async () => {
    await qq.emptyDir(root)
    qq.cd(root)
  })

  it('removes empty subdirectories', async () => {
    await qq.mkdirp('a/b/c')
    await qq.mkdirp('a/b/d')
    expect(await qq.exists('a')).to.be.true
    await qq.rmIfEmpty('a')
    expect(await qq.exists('a')).to.be.false
  })

  it('does not remove if files exist', async () => {
    await qq.writeJSON('a/myfile.json', {foo: 'bar'})
    await qq.rmIfEmpty('a')
    expect(await qq.exists('a')).to.be.true
  })
})
