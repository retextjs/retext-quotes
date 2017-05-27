# retext-quotes [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

Check quotes and apostrophes, and warn if their style (`"straight"` or
`“smart”`) or level of nesting is not the preferred style.  All with
[**retext**][retext].

## Installation

[npm][npm-install]:

```bash
npm install retext-quotes
```

## Usage

Say we have the following file, `example.txt`:

```text
A sentence "with quotes, 'nested' quotes,
and '80s apostrophes."
```

And our script, `example.js`, looks like this:

```javascript
var vfile = require('to-vfile');
var report = require('vfile-reporter');
var unified = require('unified');
var english = require('retext-english');
var stringify = require('retext-stringify');
var quotes = require('retext-quotes');

unified()
  .use(english)
  .use(quotes)
  .use(stringify)
  .process(vfile.readSync('example.txt'), function (err, file) {
    console.error(report(err || file));
  });
```

Now, running `node example` yields:

```text
example.txt
  1:12-1:13  warning  Expected a smart quote: `“`, not `"`       quote       retext-quotes
  1:26-1:27  warning  Expected a smart quote: `‘`, not `'`       quote       retext-quotes
  1:33-1:34  warning  Expected a smart quote: `’`, not `'`       quote       retext-quotes
    2:5-2:6  warning  Expected a smart apostrophe: `’`, not `'`  apostrophe  retext-quotes
  2:22-2:23  warning  Expected a smart quote: `”`, not `"`       quote       retext-quotes

⚠ 5 warnings
```

This plugin can be configured to prefer “straight” quotes instead:

```diff
   .use(english)
-  .use(quotes)
+  .use(quotes, {preferred: 'straight'})
   .use(stringify)
```

Now, running `node example` again would yield:

```text
no issues found
```

You can also pass in different markers that count as “smart”:

```diff
   .use(english)
-  .use(quotes)
+  .use(quotes, {smart: ['«»', '‹›']})
   .use(stringify)
```

Running `node example` a final time yields:

```text
example.txt
  1:12-1:13  warning  Expected a smart quote: `«`, not `"`       quote       retext-quotes
  1:26-1:27  warning  Expected a smart quote: `‹`, not `'`       quote       retext-quotes
  1:33-1:34  warning  Expected a smart quote: `›`, not `'`       quote       retext-quotes
    2:5-2:6  warning  Expected a smart apostrophe: `’`, not `'`  apostrophe  retext-quotes
  2:22-2:23  warning  Expected a smart quote: `»`, not `"`       quote       retext-quotes

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
    — Style of quotes to prefer
*   `straight` (`Array.<string>`, default: `['"', '\'']`)
    — List of quotes to see as “straight”
*   `smart` (`Array.<string>`, default: `['“”', '‘’']`)
    — List of quotes to see as “smart”

## Related

*   [`retext-contractions`](https://github.com/wooorm/retext-contractions)
    — Check apostrophe use in contractions
*   [`retext-diacritics`](https://github.com/wooorm/retext-diacritics)
    — Check for proper use of diacritics
*   [`retext-sentence-spacing`](https://github.com/wooorm/retext-sentence-spacing)
    — Check spacing (one or two spaces) between sentences

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
