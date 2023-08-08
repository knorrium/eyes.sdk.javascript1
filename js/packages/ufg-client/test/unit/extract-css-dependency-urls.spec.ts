import {extractCssDependencyUrls} from '../../src/utils/extract-css-dependency-urls'
import assert from 'assert'

describe('extract-css-dependency-urls', () => {
  it('extracts urls from "url" function', () => {
    const cssText = `
      .selector { background: url(hello0.jpg); }
      .selector { background: url('hello1.jpg'); }
      .selector2 { background-image: url("hello2.jpg"); }
      .selector3 { background: url("http://other/hello3.jpg"); }
    `
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, [
      'http://this/hello0.jpg',
      'http://this/hello1.jpg',
      'http://this/hello2.jpg',
      'http://other/hello3.jpg',
    ])
  })

  it('extracts css encoding url from "url" function', () => {
    const cssText = `div { background-image: url(\\2fsomePath\\2f some.jpg) }`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, ['http://this/somePath/some.jpg'])
  })

  it('extracts data url from "url" function', () => {
    const cssText = `div { background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%222%3E %3Ccircle cx=%2210%22 cy=%225.5%22 r=%224.5%22/%3E %3C/g%3E %3C/svg%3E'); }`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, [
      'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%222%3E %3Ccircle cx=%2210%22 cy=%225.5%22 r=%224.5%22/%3E %3C/g%3E %3C/svg%3E',
    ])
  })

  it('extracts url from unfinished "url" function', () => {
    // NOTE: Yep! Browser supports it
    const cssText = `div { background-image: url( /path/default/file.jpg`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, ['http://this/path/default/file.jpg'])
  })

  it('extracts urls from "image-set" with "url" function', () => {
    const cssText = `.img {
      background-image: url(examples/images/image-0.jpg);
      background-image:
        -webkit-image-set(
          url(examples/images/image-1.jpg) 1x,
          url(examples/images/image-2.jpg) 2x,
        );
      background-image:
        image-set(
          url(examples/images/image-3.jpg) 1x,
          url(examples/images/image-4.jpg) 2x,
        );
    }`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, [
      'http://this/examples/images/image-0.jpg',
      'http://this/examples/images/image-1.jpg',
      'http://this/examples/images/image-2.jpg',
      'http://this/examples/images/image-3.jpg',
      'http://this/examples/images/image-4.jpg',
    ])
  })

  it('extracts urls from "image-set" with string', () => {
    const cssText = `.img {
      background-image: url(original.jpg);
      background-image:
        -webkit-image-set(
          "one.jpg" 1x,
          "two.jpg" 2x,
        );
      background-image:
        image-set(
          "three.jpg" 1x,
          "four.jpg" 2x,
        );
    }`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, [
      'http://this/original.jpg',
      'http://this/one.jpg',
      'http://this/two.jpg',
      'http://this/three.jpg',
      'http://this/four.jpg',
    ])
  })

  it('extracts url from custom property with "url" function', () => {
    const cssText = `:root { --relative-image-url: url("./hello.jpeg"); --absolute-image-url: url("http://other/hello.jpeg"); }`
    const resourceUrls = extractCssDependencyUrls(cssText, {
      resourceUrl: 'http://this/theme/style.css',
      sourceUrl: 'http://this/index.html',
    })
    assert.deepStrictEqual(resourceUrls, ['http://this/hello.jpeg', 'http://other/hello.jpeg'])
  })

  it('extracts url from custom property with "image-set" function', () => {
    const cssText = `:root { --image-set: image-set(url("./hello.jpeg") 1x, "http://other/hello.jpeg" 1x); }`
    const resourceUrls = extractCssDependencyUrls(cssText, {
      resourceUrl: 'http://this/theme/style.css',
      sourceUrl: 'http://this/index.html',
    })
    assert.deepStrictEqual(resourceUrls, ['http://this/hello.jpeg', 'http://other/hello.jpeg'])
  })

  it('extracts unfinished url from custom property "url" function', () => {
    const cssText = `:root { --relative-image-url: url( ./hello.jpeg`
    const resourceUrls = extractCssDependencyUrls(cssText, {
      resourceUrl: 'http://this/theme/style.css',
      sourceUrl: 'http://this/index.html',
    })
    assert.deepStrictEqual(resourceUrls, ['http://this/hello.jpeg'])
  })

  it('extracts url from "font-face" atrule', () => {
    const cssText = `@font-face {
      font-family: 'Zilla Slab';
      font-style: normal;
      font-weight: 400;
      src: local('Zilla Slab'), local('ZillaSlab-Regular'), url('zilla_slab.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, ['http://this/zilla_slab.woff2'])
  })

  it('extracts urls "font-face" atrule with multiple "src" properties', () => {
    const cssText = `
   @font-face {
     font-family: 'FontAwesome';
     src: url('//use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.eot');
     src: url('//use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.eot?#iefix') format('embedded-opentype'),
          url('//use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.woff2') format('woff2'),
          url('//use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.woff') format('woff'),
          url('//use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.ttf') format('truetype'),
          url('//use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.svg#fontawesomeregular') format('svg');
     font-weight: normal;
     font-style: normal;
   }`

    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, [
      'http://use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.eot',
      'http://use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.eot?',
      'http://use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.woff2',
      'http://use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.woff',
      'http://use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.ttf',
      'http://use.fontawesome.com/releases/v4.7.0/fonts/fontawesome-webfont.svg',
    ])
  })

  it('extracts url from "import" atrule with "url" function', () => {
    const cssText = `@import url('some.css');`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, ['http://this/some.css'])
  })

  it('extracts url from "import" atrule with string', () => {
    const cssText = `@import 'some.css';`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, ['http://this/some.css'])
  })

  it('extracts url from "supports" atrule', () => {
    const cssText = `@supports (display: grid) {
      div {
        display: grid;
        background: url('hello.jpg');
      }
    }`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, ['http://this/hello.jpg'])
  })

  it('extracts url from "media" atrule', () => {
    const cssText = `@media (max-width:991px) {
      .bla {
        background: url('hello.jpg');
      }
    }`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, ['http://this/hello.jpg'])
  })

  it("doesn't crash on nested brackets", () => {
    const cssText = `@svg-load url(./some.svg#hihi){ .path{} }`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, ['http://this/some.svg'])
  })

  it("doesn't return urls for a wrong function", () => {
    const cssText = `.btn{filter:Foo(startColorstr='#4567', endColorstr='#1234', GradientType=0)`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, [])
  })

  it("doesn't crash on parse error", () => {
    const cssText = `something that doesn't get parsed`
    const resourceUrls = extractCssDependencyUrls(cssText, {resourceUrl: 'http://this/style.css'})
    assert.deepStrictEqual(resourceUrls, [])
  })
})
