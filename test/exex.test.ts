import {expect} from 'chai'

import * as qq from '../src'

const root = qq.join([qq.pkgDir.sync()!, 'tmp'])

describe('x', () => {
  beforeEach(async () => {
    await qq.emptyDir(root)
    qq.cd(root)
  })

  it('fails on invalid input', async () => {
    try {
      await qq.x.stdout('lwkeflwkej')
      throw new Error('uh oh')
    } catch (err) {
      expect(err.code).to.equal('ENOENT')
    }
  })
})
