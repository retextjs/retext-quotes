'use strict';

var test = require('tape');
var retext = require('retext');
var quotes = require('./');

var mixed = [
  '“One ‘sentence’. Two sentences.”',
  '"One \'sentence\'. Two sentences."'
].join('\n\n');

var apostrophes = [
  'Mr. Jones\' golf clubs.',
  '\'Mr. Jones\' golf clubs.',
  'Mr. Jones’ golf clubs.',
  '‘Mr. Jones’ golf clubs.'
].join('\n\n');

var nesting = [
  '“One ‘sentence’. Two sentences.”',
  '‘One “sentence”. Two sentences.’',
  '"One \'sentence\'. Two sentences."',
  '\'One "sentence". Two sentences.\''
].join('\n\n');

var moreApostrophes = 'Isn’t it funny? It was acceptable in the ’80s';

test('quotes(value)', function (t) {
  t.deepEqual(
    retext().use(quotes).processSync(mixed).messages.map(String),
    [
      '3:1-3:2: Expected a smart quote: `“`, not `"`',
      '3:6-3:7: Expected a smart quote: `‘`, not `\'`',
      '3:15-3:16: Expected a smart quote: `’`, not `\'`',
      '3:32-3:33: Expected a smart quote: `”`, not `"`'
    ],
    'should catch straight quotes when preferring smart'
  );

  t.deepEqual(
    retext().use(quotes, {preferred: 'straight'}).processSync(mixed).messages.map(String),
    [
      '1:1-1:2: Expected a straight quote: `"`, not `“`',
      '1:6-1:7: Expected a straight quote: `\'`, not `‘`',
      '1:15-1:16: Expected a straight quote: `\'`, not `’`',
      '1:32-1:33: Expected a straight quote: `"`, not `”`'
    ],
    'should catch smart quotes when preferring straight'
  );
  t.deepEqual(
    retext().use(quotes).processSync(moreApostrophes).messages,
    [],
    'should detect common hard cases of apostrophes (when smart)'
  );

  t.deepEqual(
    retext().use(quotes, {preferred: 'straight'}).processSync(moreApostrophes).messages.map(String),
    [
      '1:4-1:5: Expected a straight apostrophe: `\'`, not `’`',
      '1:42-1:43: Expected a straight apostrophe: `\'`, not `’`'
    ],
    'should detect common hard cases of apostrophes (when straight)'
  );

  t.deepEqual(
    retext().use(quotes, {preferred: 'smart'}).processSync(apostrophes).messages.map(String),
    [
      '1:10-1:11: Expected a smart apostrophe: `’`, not `\'`',
      '3:1-3:2: Expected a smart quote: `“`, not `\'`',
      '3:11-3:12: Expected a smart quote: `”`, not `\'`',
      '7:1-7:2: Expected `“` to be used at this level of nesting, not `‘`',
      '7:11-7:12: Expected `”` to be used at this level of nesting, not `’`'
    ],
    'should detect apostrophes correctly (when preferring smart)'
  );

  t.deepEqual(
    retext().use(quotes, {preferred: 'straight'}).processSync(apostrophes).messages.map(String),
    [
      '3:1-3:2: Expected `"` to be used at this level of nesting, not `\'`',
      '3:11-3:12: Expected `"` to be used at this level of nesting, not `\'`',
      '5:10-5:11: Expected a straight apostrophe: `\'`, not `’`',
      '7:1-7:2: Expected a straight quote: `"`, not `‘`',
      '7:11-7:12: Expected a straight quote: `"`, not `’`'
    ],
    'should detect apostrophes correctly (when preferring straight)'
  );

  t.deepEqual(
    retext().use(quotes).processSync(nesting).messages.map(String),
    [
      '3:1-3:2: Expected `“` to be used at this level of nesting, not `‘`',
      '3:6-3:7: Expected `‘` to be used at this level of nesting, not `“`',
      '3:15-3:16: Expected `’` to be used at this level of nesting, not `”`',
      '3:32-3:33: Expected `”` to be used at this level of nesting, not `’`',
      '5:1-5:2: Expected a smart quote: `“`, not `"`',
      '5:6-5:7: Expected a smart quote: `‘`, not `\'`',
      '5:15-5:16: Expected a smart quote: `’`, not `\'`',
      '5:32-5:33: Expected a smart quote: `”`, not `"`',
      '7:1-7:2: Expected a smart quote: `“`, not `\'`',
      '7:6-7:7: Expected a smart quote: `‘`, not `"`',
      '7:15-7:16: Expected a smart quote: `’`, not `"`',
      '7:32-7:33: Expected a smart quote: `”`, not `\'`'
    ],
    'should detect nesting correctly (when preferring smart)'
  );

  t.deepEqual(
    retext().use(quotes, {preferred: 'straight'}).processSync(nesting).messages.map(String),
    [
      '1:1-1:2: Expected a straight quote: `"`, not `“`',
      '1:6-1:7: Expected a straight quote: `\'`, not `‘`',
      '1:15-1:16: Expected a straight quote: `\'`, not `’`',
      '1:32-1:33: Expected a straight quote: `"`, not `”`',
      '3:1-3:2: Expected a straight quote: `"`, not `‘`',
      '3:6-3:7: Expected a straight quote: `\'`, not `“`',
      '3:15-3:16: Expected a straight quote: `\'`, not `”`',
      '3:32-3:33: Expected a straight quote: `"`, not `’`',
      '7:1-7:2: Expected `"` to be used at this level of nesting, not `\'`',
      '7:6-7:7: Expected `\'` to be used at this level of nesting, not `"`',
      '7:15-7:16: Expected `\'` to be used at this level of nesting, not `"`',
      '7:32-7:33: Expected `"` to be used at this level of nesting, not `\'`'
    ],
    'should detect nesting correctly (when preferring straight)'
  );

  t.deepEqual(
    retext().use(quotes).processSync('“Open this, ‘Open that, “open here, ‘open there').messages,
    [],
    'should deal with funky nesting'
  );

  t.deepEqual(
    retext().use(quotes, {
      preferred: 'straight',
      straight: ['\'', '"']
    }).processSync('"this and \'that\'"').messages.map(String),
    [
      '1:1-1:2: Expected `\'` to be used at this level of nesting, not `"`',
      '1:11-1:12: Expected `"` to be used at this level of nesting, not `\'`',
      '1:16-1:17: Expected `"` to be used at this level of nesting, not `\'`',
      '1:17-1:18: Expected `\'` to be used at this level of nesting, not `"`'
    ],
    'should suggest based on the order of given straight quotes'
  );

  t.deepEqual(
    retext().use(quotes, {
      smart: ['«»', '‹›']
    }).processSync('"this and \'that\'"').messages.map(String),
    [
      '1:1-1:2: Expected a smart quote: `«`, not `"`',
      '1:11-1:12: Expected a smart quote: `‹`, not `\'`',
      '1:16-1:17: Expected a smart quote: `›`, not `\'`',
      '1:17-1:18: Expected a smart quote: `»`, not `"`'
    ],
    'should suggest based on the order (and markers) of given smart quotes'
  );

  t.end();
});
