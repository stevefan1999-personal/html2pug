import { defaultOptions, Parser } from "../src/parser"

test('Should be in an instance of Parser', () => {
  expect(new Parser(defaultOptions)).toBeInstanceOf(Parser)
})

describe("Handle attributes", () => {
  const p = new Parser(defaultOptions);
  test('check class', () => {
    const html = `<div class="foo"/>`
    const output = p.parse(html)
    expect(output).toBe(`.foo`)
  })
  test('check special class names (:)', () => {

    const html = `<div class="foo:hover"/>`
    const output = p.parse(html)
    expect(output).toBe(`div(class="foo:hover")`)
  })
  test('check special class names (/)', () => {

    const html = `<div class="x-translate-1/2"/>`
    const output = p.parse(html)
    expect(output).toBe(`div(class="x-translate-1/2")`)
  })
  test('check special class names (.)', () => {

    const html = `<div class="p-1.5"/>`
    const output = p.parse(html)
    expect(output).toBe(`div(class="p-1.5")`)
  })
  test('check special class names and regular class names', () => {

    const html = `<div class="p-a foo:hover"/>`
    const output = p.parse(html)
    expect(output).toBe(`.p-a(class="foo:hover")`)
  })
  test('with id attribute', () => {
    const html = `<div id="app" class="p-a foo:hover"/>`
    const output = p.parse(html)
    expect(output).toBe(`#app.p-a(class="foo:hover")`)
  })
  test('without id attribute', () => {
    const html = `<div class="foo:hover"/>`
    const output = p.parse(html)
    expect(output).toBe(`div(class="foo:hover")`)
  })
  test('attributes', () => {
    const html = `<div data-position="0" class="foo:hover"/>`
    const output = p.parse(html)
    expect(output).toBe(`div(data-position="0" class="foo:hover")`)
  })
})

describe("Handle text", () => {
  const options = Object.assign({}, defaultOptions, { whitespaceChar: '..' })
  test('simple text', () => {
    const p = new Parser();
    const html = `<div class="foo:hover">Hello World</div>`
    const output = p.parse(html)
    expect(output).toBe(`div(class="foo:hover") Hello World`)
  })
  test('trailing space', () => {
    const p = new Parser(defaultOptions);
    const html = `<div>Hello World </div>`
    const output = p.parse(html)
    expect(output).toBe(`div Hello World `)
  })
  test('text wrapped with spaces', () => {
    const p = new Parser(options);
    const html = `<div><a>Hello World</a> | <a>Hello Universe</a></div>`
    const output = p.parse(html)
    let exp = [
      'div',
      '..a Hello World',
      '..|  | ',
      '..a Hello Universe'
    ].join('\n')
    expect(output).toBe(exp)
  })

  test('pre single line', () => {
    const p = new Parser(defaultOptions);
    const html = `<pre>Hello World</pre>`
    const output = p.parse(html)
    expect(output).toBe('pre Hello World')
  })
  test('pre multiline', () => {
    const p = new Parser(options);
    let html = `
<pre>
  Hello World
  Hello Universe
</pre>`
    let output = p.parse(html)
    let exp = [
      'pre.',
      '..Hello World',
      '..Hello Universe'
    ].join('\n')
    expect(output).toBe(exp)
  })
  test('pre multiline empty line', () => {
    const p = new Parser(options);

    let html = `
<pre>
  Hello World

  Hello Universe
</pre>`
    let output = p.parse(html)

    let exp = [
      'pre.',
      '..Hello World',
      '..',
      '..Hello Universe'
    ].join('\n')
    expect(output).toBe(exp)
  })
  test('complex structure', () => {
    const p = new Parser(options);
    let html = `
  <div class="sm:mr-6">
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="..." clip-rule="evenodd" />
      <path d="..." />
    </svg>
    Full-time
  </div>`

    let output = p.parse(html)
    let exp = [
      `div(class="sm:mr-6")`,
      `..svg.w-6.h-6(fill="currentColor" viewBox="0 0 20 20")`,
      `....path(fill-rule="evenodd" d="..." clip-rule="evenodd")`,
      `....path(d="...")`,
      `..| Full-time`
    ].join('\n')
    expect(output).toBe(exp)
  })
  test('complex structure with tabs', () => {
    const p = new Parser(options);
    let html = `
  <div class="sm:mr-6">
  \t<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
  \t\t<path fill-rule="evenodd" d="..." clip-rule="evenodd" />
  \t\t<path d="..." />
  \t</svg>
  \tFull-time
  </div>`

    let output = p.parse(html)
    let exp = [
      `div(class="sm:mr-6")`,
      `..svg.w-6.h-6(fill="currentColor" viewBox="0 0 20 20")`,
      `....path(fill-rule="evenodd" d="..." clip-rule="evenodd")`,
      `....path(d="...")`,
      `..| Full-time`
    ].join('\n')
    expect(output).toBe(exp)
  })
})

describe("Handle shortcut", () => {

  test('shorthand not allowed', () => {
    const options = Object.assign({}, defaultOptions, { whitespaceChar: '..', collapse: false })
    const p = new Parser(options);
    const html = `<div id="app"><span>Hello World</span></div>`
    const output = p.parse(html)
    let exp = [
      `#app`,
      `..span Hello World`
    ].join('\n')
    expect(output).toBe(exp)
  })
  test('simple shorthand inline', () => {
    const p = new Parser();
    const html = `<span class="sm:hover x-translate-1/2">Stuff</span>`
    const output = p.parse(html)
    const exp = `span(class="sm:hover x-translate-1/2") Stuff`
    expect(output).toBe(exp)
  })
  test('simple shorthand multiline', () => {
    const p = new Parser();
    const html = `<span class="sm:hover x-translate-1/2">
      Stuff
    </span>`
    const output = p.parse(html)
    const exp = `span(class="sm:hover x-translate-1/2") Stuff`
    expect(output).toBe(exp)
  })
  test('simple shorthand multiline not allowed', () => {
    const options = Object.assign({}, defaultOptions, { whitespaceChar: '..', collapse: false })
    const p = new Parser(options);
    const html = `<span class="sm:hover x-translate-1/2">
      Stuff
    </span>`
    const output = p.parse(html)
    const exp = [`span(class="sm:hover x-translate-1/2")`, `..| Stuff`].join('\n')
    expect(output).toBe(exp)
  })
  test('shorthand multiple children', () => {
    const p = new Parser();
    const html = `<div id="app"><span>Hello World</span></div>`
    const output = p.parse(html)
    const exp = `#app: span Hello World`
    expect(output).toBe(exp)
  })
  test('complex shorthand', () => {
    const p = new Parser();
    const html = `<nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active" aria-current="page">Home</li>
      </ol>
    </nav>`
    const output = p.parse(html)
    const exp = `nav(aria-label="breadcrumb"): ol.breadcrumb: li.breadcrumb-item.active(aria-current="page") Home`
    expect(output).toBe(exp)
  })
})

test('complex shorthand', () => {
  const p = new Parser();
  const html = `<!DOCTYPE html>
<html lang="en">

  <head>
    <title>Jade</title>
    <script type="text/javascript">
      const foo = true;
      let bar = function() {};
      if (foo) {
        bar(1 + 5)
      }
    </script>
  </head>

  <body>
    <h1>Pug - node template engine</h1>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active" aria-current="page">Home</li>
      </ol>
    </nav>
    <div class="col" id="container">
      <p>You are amazing</p>
      <p>
        Jade is a terse and simple
        templating language with a
        strong focus on performance
        and powerful features.
      </p>
    </div>
  </body>

</html>`

  const output = p.parse(html)
  const exp = [
    `doctype html`,
    `html`,
    `  head`,
    `    title Jade`,
    `    script(type="text/javascript").`,
    `      const foo = true;`,
    `      let bar = function() {};`,
    `      if (foo) {`,
    `      bar(1 + 5)`,
    `      }`,
    `  body`,
    `    h1 Pug - node template engine`,
    `    nav(aria-label="breadcrumb"): ol.breadcrumb: li.breadcrumb-item.active(aria-current="page") Home`,
    `    #container.col`,
    `      p You are amazing`,
    `      p`,
    `        | Jade is a terse and simple`,
    `        | templating language with a`,
    `        | strong focus on performance`,
    `        | and powerful features.`
  ].join('\n')
  expect(output).toBe(exp)
})