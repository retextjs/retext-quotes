'use strict'

var test = require('tape')
var retext = require('retext')
var urls = require('retext-syntax-urls')
var quotes = require('.')

var mixed = [
  '“One ‘sentence’. Two sentences.”',
  '"One \'sentence\'. Two sentences."'
].join('\n\n')

var apostrophes = [
  "Mr. Jones' golf clubs.",
  "'Mr. Jones' golf clubs.",
  'Mr. Jones’ golf clubs.',
  '‘Mr. Jones’ golf clubs.'
].join('\n\n')

var nesting = [
  '“One ‘sentence’. Two sentences.”',
  '‘One “sentence”. Two sentences.’',
  '"One \'sentence\'. Two sentences."',
  '\'One "sentence". Two sentences.\''
].join('\n\n')

var moreApostrophes = 'Isn’t it funny? It was acceptable in the ’80s'

var soManyOpenings = '“Open this, ‘Open that, “open here, ‘open there'

var thisAndThat = '"this and \'that\'"'

test('quotes(value)', function (t) {
  retext()
    .use(quotes)
    .process('Isn\'t it "funny"?', function (error, file) {
      t.deepEqual(
        JSON.parse(JSON.stringify([error].concat(file.messages))),
        [
          null,
          {
            message: "Expected a smart apostrophe: `’`, not `'`",
            name: '1:4-1:5',
            reason: "Expected a smart apostrophe: `’`, not `'`",
            line: 1,
            column: 4,
            location: {
              start: {line: 1, column: 4, offset: 3},
              end: {line: 1, column: 5, offset: 4}
            },
            source: 'retext-quotes',
            ruleId: 'apostrophe',
            fatal: false,
            actual: "'",
            expected: ['’']
          },
          {
            message: 'Expected a smart quote: `“`, not `"`',
            name: '1:10-1:11',
            reason: 'Expected a smart quote: `“`, not `"`',
            line: 1,
            column: 10,
            location: {
              start: {line: 1, column: 10, offset: 9},
              end: {line: 1, column: 11, offset: 10}
            },
            source: 'retext-quotes',
            ruleId: 'quote',
            fatal: false,
            actual: '"',
            expected: ['“']
          },
          {
            message: 'Expected a smart quote: `”`, not `"`',
            name: '1:16-1:17',
            reason: 'Expected a smart quote: `”`, not `"`',
            line: 1,
            column: 16,
            location: {
              start: {line: 1, column: 16, offset: 15},
              end: {line: 1, column: 17, offset: 16}
            },
            source: 'retext-quotes',
            ruleId: 'quote',
            fatal: false,
            actual: '"',
            expected: ['”']
          }
        ],
        'should emit messages'
      )
    })

  retext()
    .use(quotes)
    .process(mixed, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
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
    .use(quotes, {preferred: 'straight'})
    .process(mixed, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
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
    .use(quotes)
    .process(moreApostrophes, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
        [null],
        'should detect common hard cases of apostrophes (when smart)'
      )
    })

  retext()
    .use(quotes, {preferred: 'straight'})
    .process(moreApostrophes, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
        [
          null,
          "1:4-1:5: Expected a straight apostrophe: `'`, not `’`",
          "1:42-1:43: Expected a straight apostrophe: `'`, not `’`"
        ],
        'should detect common hard cases of apostrophes (when straight)'
      )
    })

  retext()
    .use(quotes, {preferred: 'smart'})
    .process(apostrophes, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
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
    .use(quotes, {preferred: 'straight'})
    .process(apostrophes, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
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
    .use(quotes)
    .process(nesting, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
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
    .use(quotes, {preferred: 'straight'})
    .process(nesting, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
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
    .use(quotes)
    .process(soManyOpenings, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
        [null],
        'should deal with funky nesting'
      )
    })

  retext()
    .use(quotes, {preferred: 'straight', straight: ["'", '"']})
    .process(thisAndThat, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
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
    .use(quotes, {smart: ['«»', '‹›']})
    .process(thisAndThat, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
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
    .use(urls)
    .use(quotes, {preferred: 'straight'})
    .process(thisAndThat, function (error, file) {
      t.deepEqual(
        [error].concat(file.messages.map(String)),
        [null],
        'should integrate with `retext-syntax-urls` and check source nodes'
      )
    })

  t.end()
})
