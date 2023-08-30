import {strict as assert} from 'assert'
import {DeviceName, IosDeviceName, AndroidDeviceName} from '../../src'
import req from '@applitools/req'

describe('enums', () => {
  // TODO unskip when grid will add Sony Xperia 10 II device
  describe('DeviceName', () => {
    const url = 'https://render-wus.applitools.com/emulated-devices'
    let expectedDeviceNames: string[]
    before(async () => {
      const LEGACY = ['Samsung Galaxy S8', 'Samsung Galaxy A5', 'Galaxy S III', 'Galaxy Note II']
      const {devices}: {devices: any[]} = (await req(url).then(response => response.json())) as any
      expectedDeviceNames = devices.map(device => device.deviceName).filter(deviceName => !LEGACY.includes(deviceName))
    })

    it('should consists of allowed values', async () => {
      assert.deepEqual(Object.values(DeviceName).sort(), expectedDeviceNames.sort())
    })
  })

  // NOTE: skipped because now the enum represents not just ufg supported devices but also those that supported by applitools lib for native devices
  describe.skip('IosDeviceName', () => {
    const url = 'https://render-wus.applitools.com/ios-devices-sizes'
    let expectedDeviceNames: string[]
    before(async () => {
      const devices = (await req(url).then(response => response.json())) as any
      expectedDeviceNames = Object.keys(devices)
    })

    it('should consists of allowed values', async () => {
      assert.deepEqual(Object.values(IosDeviceName).sort(), expectedDeviceNames.sort())
    })
  })

  describe('AndroidDeviceName', () => {
    const url = 'https://render-wus.applitools.com/android-devices-sizes'
    let expectedDeviceNames: string[]
    before(async () => {
      const LEGACY = ['Test Phone']
      const devices = (await req(url).then(response => response.json())) as any
      expectedDeviceNames = Object.keys(devices).filter(deviceName => !LEGACY.includes(deviceName))
    })

    it('should consists of allowed values', async () => {
      assert.deepEqual(Object.values(AndroidDeviceName).sort(), expectedDeviceNames.sort())
    })
  })
})
