import test from 'tape'
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

test('retext-quotes', (t) => {
  retext()
    .use(retextQuotes)
    .process('Isn\'t it "funny"?', (error, file) => {
      console.log(error)
      t.deepEqual(
        JSON.parse(JSON.stringify([error].concat(file.messages))),
        [
          null,
          {
            name: '1:4-1:5',
            message: "Expected a smart apostrophe: `’`, not `'`",
            reason: "Expected a smart apostrophe: `’`, not `'`",
            line: 1,
            column: 4,
            source: 'retext-quotes',
            ruleId: 'apostrophe',
            position: {
              start: {line: 1, column: 4, offset: 3},
              end: {line: 1, column: 5, offset: 4}
            },
            fatal: false,
            actual: "'",
            expected: ['’']
          },
          {
            name: '1:10-1:11',
            message: 'Expected a smart quote: `“`, not `"`',
            reason: 'Expected a smart quote: `“`, not `"`',
            line: 1,
            column: 10,
            source: 'retext-quotes',
            ruleId: 'quote',
            position: {
              start: {line: 1, column: 10, offset: 9},
              end: {line: 1, column: 11, offset: 10}
            },
            fatal: false,
            actual: '"',
            expected: ['“']
          },
          {
            name: '1:16-1:17',
            message: 'Expected a smart quote: `”`, not `"`',
            reason: 'Expected a smart quote: `”`, not `"`',
            line: 1,
            column: 16,
            source: 'retext-quotes',
            ruleId: 'quote',
            position: {
              start: {line: 1, column: 16, offset: 15},
              end: {line: 1, column: 17, offset: 16}
            },
            fatal: false,
            actual: '"',
            expected: ['”']
          }
        ],
        'should emit messages'
      )
    })

  retext()
    .use(retextQuotes)
    .process(mixed, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [
          null,
          '3:1-3:2: Expected a smart quote: `“`, not `"`',
          "3:6-3:7: Expected a smart quote: `‘`, not `'`",
          "3:15-3:16: Expected a smart quote: `’`, not `'`",
          '3:32-3:33: Expected a smart quote: `”`, not `"`'
        ],
        'should catch straight quotes when preferring smart'
      )
    })

  retext()
    .use(retextQuotes, {preferred: 'straight'})
    .process(mixed, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [
          null,
          '1:1-1:2: Expected a straight quote: `"`, not `“`',
          "1:6-1:7: Expected a straight quote: `'`, not `‘`",
          "1:15-1:16: Expected a straight quote: `'`, not `’`",
          '1:32-1:33: Expected a straight quote: `"`, not `”`'
        ],
        'should catch smart quotes when preferring straight'
      )
    })

  retext()
    .use(retextQuotes)
    .process(moreApostrophes, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [null],
        'should detect common hard cases of apostrophes (when smart)'
      )
    })

  retext()
    .use(retextQuotes, {preferred: 'straight'})
    .process(moreApostrophes, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [
          null,
          "1:4-1:5: Expected a straight apostrophe: `'`, not `’`",
          "1:42-1:43: Expected a straight apostrophe: `'`, not `’`"
        ],
        'should detect common hard cases of apostrophes (when straight)'
      )
    })

  retext()
    .use(retextQuotes, {preferred: 'smart'})
    .process(apostrophes, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [
          null,
          "1:10-1:11: Expected a smart apostrophe: `’`, not `'`",
          "3:1-3:2: Expected a smart quote: `“`, not `'`",
          "3:11-3:12: Expected a smart quote: `”`, not `'`",
          '7:1-7:2: Expected `“` to be used at this level of nesting, not `‘`',
          '7:11-7:12: Expected `”` to be used at this level of nesting, not `’`'
        ],
        'should detect apostrophes correctly (when preferring smart)'
      )
    })

  retext()
    .use(retextQuotes, {preferred: 'straight'})
    .process(apostrophes, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [
          null,
          '3:1-3:2: Expected `"` to be used at this level of nesting, not `\'`',
          '3:11-3:12: Expected `"` to be used at this level of nesting, not `\'`',
          "5:10-5:11: Expected a straight apostrophe: `'`, not `’`",
          '7:1-7:2: Expected a straight quote: `"`, not `‘`',
          '7:11-7:12: Expected a straight quote: `"`, not `’`'
        ],
        'should detect apostrophes correctly (when preferring straight)'
      )
    })

  retext()
    .use(retextQuotes)
    .process(nesting, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [
          null,
          '3:1-3:2: Expected `“` to be used at this level of nesting, not `‘`',
          '3:6-3:7: Expected `‘` to be used at this level of nesting, not `“`',
          '3:15-3:16: Expected `’` to be used at this level of nesting, not `”`',
          '3:32-3:33: Expected `”` to be used at this level of nesting, not `’`',
          '5:1-5:2: Expected a smart quote: `“`, not `"`',
          "5:6-5:7: Expected a smart quote: `‘`, not `'`",
          "5:15-5:16: Expected a smart quote: `’`, not `'`",
          '5:32-5:33: Expected a smart quote: `”`, not `"`',
          "7:1-7:2: Expected a smart quote: `“`, not `'`",
          '7:6-7:7: Expected a smart quote: `‘`, not `"`',
          '7:15-7:16: Expected a smart quote: `’`, not `"`',
          "7:32-7:33: Expected a smart quote: `”`, not `'`"
        ],
        'should detect nesting correctly (when preferring smart)'
      )
    })

  retext()
    .use(retextQuotes, {preferred: 'straight'})
    .process(nesting, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [
          null,
          '1:1-1:2: Expected a straight quote: `"`, not `“`',
          "1:6-1:7: Expected a straight quote: `'`, not `‘`",
          "1:15-1:16: Expected a straight quote: `'`, not `’`",
          '1:32-1:33: Expected a straight quote: `"`, not `”`',
          '3:1-3:2: Expected a straight quote: `"`, not `‘`',
          "3:6-3:7: Expected a straight quote: `'`, not `“`",
          "3:15-3:16: Expected a straight quote: `'`, not `”`",
          '3:32-3:33: Expected a straight quote: `"`, not `’`',
          '7:1-7:2: Expected `"` to be used at this level of nesting, not `\'`',
          '7:6-7:7: Expected `\'` to be used at this level of nesting, not `"`',
          '7:15-7:16: Expected `\'` to be used at this level of nesting, not `"`',
          '7:32-7:33: Expected `"` to be used at this level of nesting, not `\'`'
        ],
        'should detect nesting correctly (when preferring straight)'
      )
    })

  retext()
    .use(retextQuotes)
    .process(soManyOpenings, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [null],
        'should deal with funky nesting'
      )
    })

  retext()
    .use(retextQuotes, {preferred: 'straight', straight: ["'", '"']})
    .process(thisAndThat, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [
          null,
          '1:1-1:2: Expected `\'` to be used at this level of nesting, not `"`',
          '1:11-1:12: Expected `"` to be used at this level of nesting, not `\'`',
          '1:16-1:17: Expected `"` to be used at this level of nesting, not `\'`',
          '1:17-1:18: Expected `\'` to be used at this level of nesting, not `"`'
        ],
        'should suggest based on the order of given straight quotes'
      )
    })

  retext()
    .use(retextQuotes, {smart: ['«»', '‹›']})
    .process(thisAndThat, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [
          null,
          '1:1-1:2: Expected a smart quote: `«`, not `"`',
          "1:11-1:12: Expected a smart quote: `‹`, not `'`",
          "1:16-1:17: Expected a smart quote: `›`, not `'`",
          '1:17-1:18: Expected a smart quote: `»`, not `"`'
        ],
        'should suggest based on the order (and markers) of given smart quotes'
      )
    })

  // GH-7.
  retext()
    .use(retextSyntaxUrls)
    .use(retextQuotes, {preferred: 'straight'})
    .process(thisAndThat, (error, file) => {
      t.deepEqual(
        [error].concat(file.messages.map((d) => String(d))),
        [null],
        'should integrate with `retext-syntax-urls` and check source nodes'
      )
    })

  t.end()
})
