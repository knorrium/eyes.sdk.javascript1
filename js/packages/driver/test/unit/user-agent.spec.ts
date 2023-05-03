import {extractUserAgentEnvironment} from '../../src/user-agent'
import assert from 'assert'

describe('user agent legacy parse platform', () => {
  const data = [
    {
      userAgent:
        'Mozilla/4.0 (compatible; MSIE 2.0; Windows 95; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0)',
      platformName: 'Windows',
      platformVersion: undefined,
    },
    {
      userAgent: 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)',
      platformName: 'Windows',
      platformVersion: '5.1',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36',
      platformName: 'Windows',
      platformVersion: '7',
    },
    {
      userAgent: 'Opera/9.80 (Windows NT 6.1; WOW64; MRA 5.8 (build 4133)) Presto/2.12.388 Version/12.15',
      platformName: 'Windows',
      platformVersion: '7',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0',
      platformName: 'Windows',
      platformVersion: '10',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71',
      platformName: 'Windows',
      platformVersion: '10',
    },
    {
      userAgent: 'Mozilla/4.0 (compatible; MSIE 5.21; Mac_PowerPC)',
      platformName: 'Macintosh',
      platformVersion: undefined,
    },
    {
      userAgent: 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; it-it) AppleWebKit/124 (KHTML, like Gecko) Safari/125.1',
      platformName: 'Mac OS X',
      platformVersion: undefined,
    },
    {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2',
      platformName: 'Mac OS X',
      platformVersion: '10.6',
    },
    {
      userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 6783.1.0) AppleWebKit/537.36 (KHTML, like Gecko) Edge/12.0',
      platformName: 'Chrome OS',
      platformVersion: undefined,
    },
    {
      userAgent:
        'Mozilla/5.0 (X11; U; Linux armv7l; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.204 Safari/534.16',
      platformName: 'Linux',
      platformVersion: undefined,
    },
    {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/538.36 (KHTML, like Gecko) Edge/12.1',
      platformName: 'Linux',
      platformVersion: undefined,
    },
    {
      userAgent: 'Opera/12.02 (Android 4.1; Linux; Opera Mobi/ADR-1111101157; U; en-US) Presto/2.9.201 Version/12.02',
      platformName: 'Android',
      platformVersion: '4.1',
    },
    {
      userAgent:
        'Mozilla/5.0 (Linux; U; Android 4.2.2; en-us; GT-I9100 Build/JDQ39E) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 CyanogenMod/10.1.3/i9100',
      platformName: 'Android',
      platformVersion: '4.2',
    },
    {
      userAgent:
        'Mozilla/5.0 (Linux; Android 8.0.0; Android SDK built for x86_64 Build/OSR1.180418.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
      platformName: 'Android',
      platformVersion: '8.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (Linux; Android 10; SM-G973U1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36',
      platformName: 'Android',
      platformVersion: '10',
    },
    {
      userAgent:
        'Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7D11 Safari/531.21.10',
      platformName: 'iOS',
      platformVersion: '3.2',
    },
    {
      userAgent:
        'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; ja-jp) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
      platformName: 'iOS',
      platformVersion: '4.3',
    },
    {
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko ) Version/5.1 Mobile/9B176 Safari/7534.48.3',
      platformName: 'iOS',
      platformVersion: '5.1',
    },
    {
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25',
      platformName: 'iOS',
      platformVersion: '6.0',
    },
  ]

  data.forEach(({userAgent, ...expectedPlatform}) => {
    it(`should parse platform of ${userAgent}`, () => {
      const {platformName, platformVersion} = extractUserAgentEnvironment(userAgent)
      assert.deepStrictEqual({platformName, platformVersion}, expectedPlatform)
    })
  })
})

describe('user agent legacy parse browser', () => {
  const data = [
    {
      userAgent: 'Opera/9.80 (Windows NT 6.1; WOW64; MRA 5.8 (build 4133)) Presto/2.12.388 Version/12.15',
      browserName: 'Opera',
      browserVersion: '12.15',
    },
    {
      userAgent: 'Opera/12.02 (Android 4.1; Linux; Opera Mobi/ADR-1111101157; U; en-US) Presto/2.9.201 Version/12.02',
      browserName: 'Opera',
      browserVersion: '12.02',
    },
    {
      userAgent: 'Opera/9.80 (S60; SymbOS; Opera Mobi/1209; U; sk) Presto/2.5.28 Version/10.1',
      browserName: 'Opera',
      browserVersion: '10.1',
    },
    {
      userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1468.0 Safari/537.36',
      browserName: 'Chrome',
      browserVersion: '28.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (X11; U; Linux armv7l; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.204 Safari/534.16',
      browserName: 'Chrome',
      browserVersion: '10.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (Linux; Android 8.0.0; Android SDK built for x86_64 Build/OSR1.180418.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
      browserName: 'Chrome',
      browserVersion: '69.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (Linux; Android 10; SM-G973U1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36',
      browserName: 'Chrome',
      browserVersion: '83.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25',
      browserName: 'Safari',
      browserVersion: '6.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko ) Version/5.1 Mobile/9B176 Safari/7534.48.3',
      browserName: 'Safari',
      browserVersion: '5.1',
    },
    {
      userAgent: 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; it-it) AppleWebKit/124 (KHTML, like Gecko) Safari/125.1',
      browserName: 'Safari',
      browserVersion: '125.1',
    },
    {
      userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:23.0) Gecko/20130406 Firefox/23.0',
      browserName: 'Firefox',
      browserVersion: '23.0',
    },
    {
      userAgent: 'Mozilla/5.0 (Windows NT 6.1; rv:14.0) Gecko/20100101 Firefox/18.0.1',
      browserName: 'Firefox',
      browserVersion: '18.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.2.7) Gecko/20100809 Fedora/3.6.7-1.fc14 Firefox/3.6.7',
      browserName: 'Firefox',
      browserVersion: '3.6',
    },
    {
      userAgent:
        'Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0',
      browserName: 'IE',
      browserVersion: '10.6',
    },
    {
      userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
      browserName: 'IE',
      browserVersion: '10.0',
    },
    {
      userAgent: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 7.1; Trident/5.0)',
      browserName: 'IE',
      browserVersion: '9.0',
    },
    {
      userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko/20100101 Firefox/22.0',
      browserName: 'IE',
      browserVersion: '11.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; .NET4.0E; rv:11.1) like Gecko',
      browserName: 'IE',
      browserVersion: '11.1',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; .NET4.0E; .NET4.0C; .NET CLR 3.5.30729; .NET CLR 2.0.50727; .NET CLR 3.0.30729; InfoPath.3; MDDCJS; rv:11.3) like Gecko',
      browserName: 'IE',
      browserVersion: '11.3',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0',
      browserName: 'Edge',
      browserVersion: '12.0',
    },
    {
      userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 6783.1.0) AppleWebKit/537.36 (KHTML, like Gecko) Edge/12.0',
      browserName: 'Edge',
      browserVersion: '12.0',
    },
    {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/538.36 (KHTML, like Gecko) Edge/12.1',
      browserName: 'Edge',
      browserVersion: '12.1',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363',
      browserName: 'Edge',
      browserVersion: '18.18363',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71',
      browserName: 'Edge',
      browserVersion: '79.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36 Edg/84.0.522.48',
      browserName: 'Edge',
      browserVersion: '84.0',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Electron/11.2.1-RFV.1 Safari/537.36 TR-Electron/1.14.455 TR-EikonLight/1.14.300 P-Eikon5/1.14.300 RFV-Electron/1.14.455 RFV-Workspace/1.14.300',
      browserName: 'Electron',
      browserVersion: '11.2',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Teams/1.3.00.13565 Chrome/69.0.3497.128 Electron/4.2.12 Safari/537.36',
      browserName: 'Electron',
      browserVersion: '4.2',
    },
    {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Xbox/2003.1001.4.0 Chrome/69.0.3497.128 Electron/4.2.2 Safari/537.36',
      browserName: 'Electron',
      browserVersion: '4.2',
    },
    {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Teams/1.3.00.18164 Chrome/69.0.3497.128 Electron/4.3.13 Safari/537.36',
      browserName: 'Electron',
      browserVersion: '4.3',
    },
  ]

  data.forEach(({userAgent, ...expectedBrowser}) => {
    it(`should parse platform of ${userAgent}`, () => {
      const {browserName, browserVersion} = extractUserAgentEnvironment(userAgent)
      assert.deepStrictEqual({browserName, browserVersion}, expectedBrowser)
    })
  })
})

describe('user agent object', () => {
  it('should return Windows 7 as OS', () => {
    const userAgent = extractUserAgentEnvironment({
      legacy:
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      brands: [
        {brand: 'Google Chrome', version: '107'},
        {brand: 'Chromium', version: '107'},
      ],
      platform: 'Windows',
      platformVersion: '0.1.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '7',
      browserName: 'Chrome',
      browserVersion: '107.0',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
      isReliable: true,
    })
  })

  it('should return Windows 8 as OS', () => {
    const userAgent = extractUserAgentEnvironment({
      legacy: 'Mozilla/5.0 (Windows NT 6.2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      brands: [
        {brand: 'Google Chrome', version: '107'},
        {brand: 'Chromium', version: '107'},
      ],
      platform: 'Windows',
      platformVersion: '0.2.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '8',
      browserName: 'Chrome',
      browserVersion: '107.0',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
      isReliable: true,
    })
  })

  it('should return Windows 8.1 as OS', () => {
    const userAgent = extractUserAgentEnvironment({
      legacy: 'Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      brands: [
        {brand: 'Google Chrome', version: '107'},
        {brand: 'Chromium', version: '107'},
      ],
      platform: 'Windows',
      platformVersion: '0.3.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '8.1',
      browserName: 'Chrome',
      browserVersion: '107.0',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
      isReliable: true,
    })
  })

  it('should return Windows 10 as OS', () => {
    const userAgent = extractUserAgentEnvironment({
      legacy:
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      brands: [
        {brand: 'Google Chrome', version: '107'},
        {brand: 'Chromium', version: '107'},
      ],
      platform: 'Windows',
      platformVersion: '10.0.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '10',
      browserName: 'Chrome',
      browserVersion: '107.0',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
      isReliable: true,
    })
  })

  it('should return Windows 11 as OS', () => {
    const userAgent = extractUserAgentEnvironment({
      legacy:
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      brands: [
        {brand: 'Google Chrome', version: '107'},
        {brand: 'Chromium', version: '107'},
      ],
      platform: 'Windows',
      platformVersion: '15.0.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Windows',
      platformVersion: '11',
      browserName: 'Chrome',
      browserVersion: '107.0',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
      isReliable: true,
    })
  })

  it('should return Mac OS X 12.5 as OS', () => {
    const userAgent = extractUserAgentEnvironment({
      legacy:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_5_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      brands: [
        {brand: 'Chromium', version: '107'},
        {brand: 'Google Chrome', version: '107'},
      ],
      platform: 'macOS',
      platformVersion: '12.5.0',
    })
    assert.deepStrictEqual(userAgent, {
      platformName: 'Mac OS X',
      platformVersion: '12.5',
      browserName: 'Chrome',
      browserVersion: '107.0',
      deviceName: undefined,
      isChromium: true,
      isMobile: undefined,
      isReliable: true,
    })
  })
})
