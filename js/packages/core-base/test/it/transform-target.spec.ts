import {readFileSync} from 'fs'
import {makeImage, type Image} from '@applitools/image'
import {resolve as resolvePath} from 'path'
import {pathToFileURL} from 'url'
import {testServer} from '@applitools/test-server'
import {transformTarget} from '../../src/utils/transform-target'
import assert from 'assert'

describe('transform-target', () => {
  describe('transformations', () => {
    it('image normalization', async () => {
      const normalization = {
        scaleRatio: 0.5,
        rotation: 180 as const,
        cut: {x: 0, y: 1270, width: 540, height: 420},
      }
      const result = await transformTarget({
        target: {image: readFileSync('./test/fixtures/screenshot.png')},
        settings: {normalization},
      })
      const expected = readFileSync('./test/fixtures/screenshot-normalized.png')
      assert(Buffer.compare(result.image as Buffer, expected) === 0)
      assert.strict.deepEqual(result.size, {width: 540, height: 421})
    })

    it('image region', async () => {
      const region = {x: 0, y: 0, width: 540, height: 420}
      const result = await transformTarget({
        target: {image: readFileSync('./test/fixtures/screenshot.png')},
        settings: {region},
      })
      const expected = readFileSync('./test/fixtures/screenshot-region.png')
      assert(Buffer.compare(result.image as Buffer, expected) === 0)
      assert.strict.deepEqual(result.size, {width: 540, height: 420})
    })
  })

  describe('formats', () => {
    const expected = {png: Buffer.alloc(0), jpeg: Buffer.alloc(0), bmp: Buffer.alloc(0)}
    let destroyServer: () => Promise<void>, baseUrl: string

    before(async () => {
      expected.png = await makeImage('./test/fixtures/screenshot.png').toPng()
      expected.jpeg = await makeImage('./test/fixtures/screenshot.jpeg').toPng()
      expected.bmp = await makeImage('./test/fixtures/screenshot.bmp').toPng()
      const server = await testServer()
      destroyServer = () => server.close()
      baseUrl = `http://localhost:${server.port}`
    })

    after(async () => {
      await destroyServer?.()
    })

    it('image buffer in png format', async () => {
      const result = await transformTarget({target: {image: readFileSync('./test/fixtures/screenshot.png')}})
      assert(Buffer.compare(result.image as Buffer, expected.png) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image base64 in png format', async () => {
      const result = await transformTarget({
        target: {image: readFileSync('./test/fixtures/screenshot.png').toString('base64')},
      })
      assert(Buffer.compare(result.image as Buffer, expected.png) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image path in png format', async () => {
      const result = await transformTarget({target: {image: resolvePath('./test/fixtures/screenshot.png')}})
      assert(Buffer.compare(result.image as Buffer, expected.png) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image file url object in png format', async () => {
      const result = await transformTarget({
        target: {image: pathToFileURL(resolvePath('./test/fixtures/screenshot.png')) as URL},
      })
      assert(Buffer.compare(result.image as Buffer, expected.png) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image file url string in png format', async () => {
      const result = await transformTarget({
        target: {image: pathToFileURL(resolvePath('./test/fixtures/screenshot.png')).href},
      })
      assert(Buffer.compare(result.image as Buffer, expected.png) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image http url object in png format', async () => {
      const result = await transformTarget({target: {image: new URL(`${baseUrl}/screenshot.png`)}})
      assert(Buffer.compare(result.image as Buffer, expected.png) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image http url string in png format', async () => {
      const result = await transformTarget({target: {image: `${baseUrl}/screenshot.png`}})
      assert(Buffer.compare(result.image as Buffer, expected.png) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image buffer in jpeg format', async () => {
      const result = await transformTarget({
        target: {image: readFileSync('./test/fixtures/screenshot.jpeg')},
      })
      assert(Buffer.compare(result.image as Buffer, expected.jpeg) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image base64 in jpeg format', async () => {
      const result = await transformTarget({
        target: {image: readFileSync('./test/fixtures/screenshot.jpeg').toString('base64')},
      })
      assert(Buffer.compare(result.image as Buffer, expected.jpeg) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image path in jpeg format', async () => {
      const result = await transformTarget({target: {image: resolvePath('./test/fixtures/screenshot.jpeg')}})
      assert(Buffer.compare(result.image as Buffer, expected.jpeg) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image file url object in jpeg format', async () => {
      const result = await transformTarget({
        target: {image: pathToFileURL(resolvePath('./test/fixtures/screenshot.jpeg')) as URL},
      })
      assert(Buffer.compare(result.image as Buffer, expected.jpeg) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image file url string in jpeg format', async () => {
      const result = await transformTarget({
        target: {image: pathToFileURL(resolvePath('./test/fixtures/screenshot.jpeg')).href},
      })
      assert(Buffer.compare(result.image as Buffer, expected.jpeg) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image http url object in jpeg format', async () => {
      const result = await transformTarget({target: {image: new URL(`${baseUrl}/screenshot.jpeg`)}})
      assert(Buffer.compare(result.image as Buffer, expected.jpeg) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image http url string in jpeg format', async () => {
      const result = await transformTarget({target: {image: `${baseUrl}/screenshot.jpeg`}})
      assert(Buffer.compare(result.image as Buffer, expected.jpeg) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image buffer in bmp format', async () => {
      const result = await transformTarget({target: {image: readFileSync('./test/fixtures/screenshot.bmp')}})
      assert(Buffer.compare(result.image as Buffer, expected.bmp) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image base64 in bmp format', async () => {
      const result = await transformTarget({
        target: {image: readFileSync('./test/fixtures/screenshot.bmp').toString('base64')},
      })
      assert(Buffer.compare(result.image as Buffer, expected.bmp) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image path in bmp format', async () => {
      const result = await transformTarget({target: {image: resolvePath('./test/fixtures/screenshot.bmp')}})
      assert(Buffer.compare(result.image as Buffer, expected.bmp) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    describe('limit', () => {
      let imageBase: Image
      beforeEach(() => {
        imageBase = makeImage('./test/fixtures/screenshot.png')
      })

      it('image height greater then limit but area in the limit', async () => {
        const limit = {
          maxImageHeight: imageBase.height - 10,
          maxImageArea: imageBase.width * imageBase.height,
        }

        const result = await transformTarget({
          target: {image: await imageBase.toPng()},
          settings: {normalization: {limit}},
        })
        assert.strict.deepEqual(
          result.size,
          {width: imageBase.width, height: imageBase.height - 10},
          'should crop the height',
        )
      })

      it('image height in the limit but area greater then limit', async () => {
        const limit = {
          maxImageHeight: imageBase.height,
          maxImageArea: imageBase.width * (imageBase.height - 10),
        }

        const result = await transformTarget({
          target: {image: await imageBase.toPng()},
          settings: {normalization: {limit}},
        })
        assert.strict.deepEqual(
          result.size,
          {width: imageBase.width, height: imageBase.height - 10},
          'should crop the height',
        )
      })

      it('image area and height greater then limit but crop height enough for area', async () => {
        const limit = {
          maxImageHeight: imageBase.height - 100,
          maxImageArea: (imageBase.width - 10) * (imageBase.height - 10),
        }

        const result = await transformTarget({
          target: {image: await imageBase.toPng()},
          settings: {normalization: {limit}},
        })
        assert.strict.deepEqual(
          result.size,
          {width: imageBase.width, height: imageBase.height - 100},
          'it should crop **only** the height',
        )
      })
    })

    it('image file url object in bmp format', async () => {
      const result = await transformTarget({
        target: {image: pathToFileURL(resolvePath('./test/fixtures/screenshot.bmp')) as URL},
      })
      assert(Buffer.compare(result.image as Buffer, expected.bmp) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image file url string in bmp format', async () => {
      const result = await transformTarget({
        target: {image: pathToFileURL(resolvePath('./test/fixtures/screenshot.bmp')).href},
      })
      assert(Buffer.compare(result.image as Buffer, expected.bmp) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image http url object in bmp format', async () => {
      const result = await transformTarget({target: {image: new URL(`${baseUrl}/screenshot.bmp`)}})
      assert(Buffer.compare(result.image as Buffer, expected.bmp) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })

    it('image http url string in bmp format', async () => {
      const result = await transformTarget({target: {image: `${baseUrl}/screenshot.bmp`}})
      assert(Buffer.compare(result.image as Buffer, expected.bmp) === 0)
      assert.strict.deepEqual(result.size, {width: 1079, height: 3415})
    })
  })
})
