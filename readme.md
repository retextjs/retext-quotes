# retext-quotes [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

Check quotes and apostrophes, and warn if their style (“straight”, as
in `"` and `'`, or “smart”, as in `“”` and and '‘’') or level of
nesting is not the preferred style.  All with [**retext**][retext].

## Installation

[npm][npm-install]:

```bash
npm install retext-quotes
```

## Usage

Dependencies.

```javascript
var retext = require('retext');
var english = require('retext-english');
var quotes = require('retext-quotes');
var report = require('vfile-reporter');

retext().use(english).use(quotes).process([
  'A sentence "with quotes, \'nested\' quotes,',
  'and \'80s apostrophes."'
].join('\n'), function (err, file) {
  console.log(report(err || file));
});
```

Yields:

```text
  1:12-1:13  warning  Expected a smart quote: `“`, not `"`       quote
  1:26-1:27  warning  Expected a smart quote: `‘`, not `'`       quote
  1:33-1:34  warning  Expected a smart quote: `’`, not `'`       quote
    2:5-2:6  warning  Expected a smart apostrophe: `’`, not `'`  apostrophe
  2:22-2:23  warning  Expected a smart quote: `”`, not `"`       quote

⚠ 5 warnings
```

This plugin can be configured to prefer “straight” quotes instead:

```diff
-retext().use(english).use(quotes).process([
+retext().use(english).use(quotes, {preferred: 'straight'}).process([
   'A sentence "with quotes, \'nested\' quotes,',
```

Yields:

```text
no issues found
```

Or, pass in different markers that count as “smart”:

```diff
-retext().use(english).use(quotes).process([
+retext().use(english).use(quotes, {smart: ['«»', '‹›']}).process([
   'A sentence "with quotes, \'nested\' quotes,',
```

Yields:

```text
  1:12-1:13  warning  Expected a smart quote: `«`, not `"`       quote
  1:26-1:27  warning  Expected a smart quote: `‹`, not `'`       quote
  1:33-1:34  warning  Expected a smart quote: `›`, not `'`       quote
    2:5-2:6  warning  Expected a smart apostrophe: `’`, not `'`  apostrophe
  2:22-2:23  warning  Expected a smart quote: `»`, not `"`       quote

⚠ 5 warnings
```

## API

### `retext().use(quotes[, options])`

Emit warnings when the use of quotes doesn’t match the preferred style.

This plug-in knows about apostrophes as well and prefers `'` when
`preferred: 'straight'`, and `’` otherwise.

The values in `straight` and `smart` can be one or two characters.
When two, the first character determines the opening quote and the
second the closing quote at that level.  When one, both the opening
and closing quote are that character.

Additionally, the order in which the preferred quotes appear in their
respective list determines which quotes to use at which level of nesting.
So, to prefer `‘’` at the first level of nesting, and `“”` at the second,
pass: `smart: ['‘’', '“”']`.

If quotes are nested deeper than the given amount of quotes, the markers
wrap around: a third level of nesting when using `smart: ['«»', '‹›']`
should have double guillemets, a fourth single, a fifth double again, etc.

###### `options`

*   `preferred` (`'smart'` or `'straight'`, default: `'smart'`)
    — Style of quotes to prefer;
*   `straight` (`Array.<string>`, default: `['"', '\'']`)
    — List of quotes to see as “straight”;
*   `smart` (`Array.<string>`, default: `['“”', '‘’']`)
    — List of quotes to see as “smart”.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/wooorm/retext-quotes.svg

[travis]: https://travis-ci.org/wooorm/retext-quotes

[codecov-badge]: https://img.shields.io/codecov/c/github/wooorm/retext-quotes.svg

[codecov]: https://codecov.io/github/wooorm/retext-quotes

[npm-install]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: http://wooorm.com

[retext]: https://github.com/wooorm/retext-quotes
