import assert from 'node:assert/strict'
import test from 'node:test'
import {retext} from 'retext'
import retextSyntaxUrls from 'retext-syntax-urls'
import retextQuotes from './index.js'

const mixed = [
  '“One ‘sentence’. Two sentences.”',
  '"One \'sentence\'. Two sentences."'
].join('\n\n')

const apostrophes = [
  "Mr. Jones' golf clubs.",
  "'Mr. Jones' golf clubs.",
  'Mr. Jones’ golf clubs.',
  '‘Mr. Jones’ golf clubs.'
].join('\n\n')

const nesting = [
  '“One ‘sentence’. Two sentences.”',
  '‘One “sentence”. Two sentences.’',
  '"One \'sentence\'. Two sentences."',
  '\'One "sentence". Two sentences.\''
].join('\n\n')

const moreApostrophes = 'Isn’t it funny? It was acceptable in the ’80s'

const soManyOpenings = '“Open this, ‘Open that, “open here, ‘open there'

const thisAndThat = '"this and \'that\'"'

test('retextQuotes', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('retext-quotes')).sort(), [
      'default'
    ])
  })

  await t.test('should emit a message w/ metadata', async function () {
    const file = await retext().use(retextQuotes).process('Isn\'t it "funny"?')

    assert.deepEqual(
      JSON.parse(JSON.stringify({...file.messages[0], ancestors: []})),
      {
        ancestors: [],
        column: 4,
        fatal: false,
        message: "Unexpected straight apostrophe `'`, expected `’`",
        line: 1,
        name: '1:4-1:5',
        place: {
          start: {line: 1, column: 4, offset: 3},
          end: {line: 1, column: 5, offset: 4}
        },
        reason: "Unexpected straight apostrophe `'`, expected `’`",
        ruleId: 'apostrophe',
        source: 'retext-quotes',
        actual: "'",
        expected: ['’'],
        url: 'https://github.com/retextjs/retext-quotes#readme'
      }
    )
  })

  await t.test(
    'should catch straight quotes when preferring smart',
    async function () {
      const file = await retext().use(retextQuotes).process(mixed)

      assert.deepEqual(file.messages.map(String), [
        '3:1-3:2: Unexpected straight quote `"`, expected `“`',
        "3:6-3:7: Unexpected straight quote `'`, expected `‘`",
        "3:15-3:16: Unexpected straight quote `'`, expected `’`",
        '3:32-3:33: Unexpected straight quote `"`, expected `”`'
      ])
    }
  )

  await t.test(
    'should catch smart quotes when preferring straight',
    async function () {
      const file = await retext()
        .use(retextQuotes, {preferred: 'straight'})
        .process(mixed)

      assert.deepEqual(file.messages.map(String), [
        '1:1-1:2: Unexpected smart quote `“`, expected `"`',
        "1:6-1:7: Unexpected smart quote `‘`, expected `'`",
        "1:15-1:16: Unexpected smart quote `’`, expected `'`",
        '1:32-1:33: Unexpected smart quote `”`, expected `"`'
      ])
    }
  )

  await t.test(
    'should detect common hard cases of apostrophes (when smart)',
    async function () {
      const file = await retext().use(retextQuotes).process(moreApostrophes)

      assert.deepEqual(file.messages.map(String), [])
    }
  )

  await t.test(
    'should detect common hard cases of apostrophes (when straight)',
    async function () {
      const file = await retext()
        .use(retextQuotes, {preferred: 'straight'})
        .process(moreApostrophes)

      assert.deepEqual(file.messages.map(String), [
        "1:4-1:5: Unexpected smart apostrophe `’`, expected `'`",
        "1:42-1:43: Unexpected smart apostrophe `’`, expected `'`"
      ])
    }
  )

  await t.test(
    'should detect apostrophes correctly (when preferring smart)',
    async function () {
      const file = await retext()
        .use(retextQuotes, {preferred: 'smart'})
        .process(apostrophes)

      assert.deepEqual(file.messages.map(String), [
        "1:10-1:11: Unexpected straight apostrophe `'`, expected `’`",
        "3:1-3:2: Unexpected straight quote `'`, expected `“`",
        "3:11-3:12: Unexpected straight quote `'`, expected `”`",
        '7:1-7:2: Unexpected `‘` at this level of nesting, expected `“`',
        '7:11-7:12: Unexpected `’` at this level of nesting, expected `”`'
      ])
    }
  )

  await t.test(
    'should detect apostrophes correctly (when preferring straight)',
    async function () {
      const file = await retext()
        .use(retextQuotes, {preferred: 'straight'})
        .process(apostrophes)

      assert.deepEqual(file.messages.map(String), [
        '3:1-3:2: Unexpected `\'` at this level of nesting, expected `"`',
        '3:11-3:12: Unexpected `\'` at this level of nesting, expected `"`',
        "5:10-5:11: Unexpected smart apostrophe `’`, expected `'`",
        '7:1-7:2: Unexpected smart quote `‘`, expected `"`',
        '7:11-7:12: Unexpected smart quote `’`, expected `"`'
      ])
    }
  )

  await t.test(
    'should detect nesting correctly (when preferring smart)',
    async function () {
      const file = await retext().use(retextQuotes).process(nesting)

      assert.deepEqual(file.messages.map(String), [
        '3:1-3:2: Unexpected `‘` at this level of nesting, expected `“`',
        '3:6-3:7: Unexpected `“` at this level of nesting, expected `‘`',
        '3:15-3:16: Unexpected `”` at this level of nesting, expected `’`',
        '3:32-3:33: Unexpected `’` at this level of nesting, expected `”`',
        '5:1-5:2: Unexpected straight quote `"`, expected `“`',
        "5:6-5:7: Unexpected straight quote `'`, expected `‘`",
        "5:15-5:16: Unexpected straight quote `'`, expected `’`",
        '5:32-5:33: Unexpected straight quote `"`, expected `”`',
        "7:1-7:2: Unexpected straight quote `'`, expected `“`",
        '7:6-7:7: Unexpected straight quote `"`, expected `‘`',
        '7:15-7:16: Unexpected straight quote `"`, expected `’`',
        "7:32-7:33: Unexpected straight quote `'`, expected `”`"
      ])
    }
  )

  await t.test(
    'should detect nesting correctly (when preferring straight)',
    async function () {
      const file = await retext()
        .use(retextQuotes, {preferred: 'straight'})
        .process(nesting)

      assert.deepEqual(file.messages.map(String), [
        '1:1-1:2: Unexpected smart quote `“`, expected `"`',
        "1:6-1:7: Unexpected smart quote `‘`, expected `'`",
        "1:15-1:16: Unexpected smart quote `’`, expected `'`",
        '1:32-1:33: Unexpected smart quote `”`, expected `"`',
        '3:1-3:2: Unexpected smart quote `‘`, expected `"`',
        "3:6-3:7: Unexpected smart quote `“`, expected `'`",
        "3:15-3:16: Unexpected smart quote `”`, expected `'`",
        '3:32-3:33: Unexpected smart quote `’`, expected `"`',
        '7:1-7:2: Unexpected `\'` at this level of nesting, expected `"`',
        '7:6-7:7: Unexpected `"` at this level of nesting, expected `\'`',
        '7:15-7:16: Unexpected `"` at this level of nesting, expected `\'`',
        '7:32-7:33: Unexpected `\'` at this level of nesting, expected `"`'
      ])
    }
  )

  await t.test('should deal with funky nesting', async function () {
    const file = await retext().use(retextQuotes).process(soManyOpenings)

    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test(
    'should suggest based on the order of given straight quotes',
    async function () {
      const file = await retext()
        .use(retextQuotes, {preferred: 'straight', straight: ["'", '"']})
        .process(thisAndThat)

      assert.deepEqual(file.messages.map(String), [
        '1:1-1:2: Unexpected `"` at this level of nesting, expected `\'`',
        '1:11-1:12: Unexpected `\'` at this level of nesting, expected `"`',
        '1:16-1:17: Unexpected `\'` at this level of nesting, expected `"`',
        '1:17-1:18: Unexpected `"` at this level of nesting, expected `\'`'
      ])
    }
  )

  await t.test(
    'should suggest based on the order (and markers) of given smart quotes',
    async function () {
      const file = await retext()
        .use(retextQuotes, {smart: ['«»', '‹›']})
        .process(thisAndThat)

      assert.deepEqual(file.messages.map(String), [
        '1:1-1:2: Unexpected straight quote `"`, expected `«`',
        "1:11-1:12: Unexpected straight quote `'`, expected `‹`",
        "1:16-1:17: Unexpected straight quote `'`, expected `›`",
        '1:17-1:18: Unexpected straight quote `"`, expected `»`'
      ])
    }
  )

  await t.test(
    'should integrate with `retext-syntax-urls` and check source nodes',
    async function () {
      // GH-7.
      const file = await retext()
        .use(retextSyntaxUrls)
        .use(retextQuotes, {preferred: 'straight'})
        .process(thisAndThat)

      assert.deepEqual(file.messages.map(String), [])
    }
  )
})
