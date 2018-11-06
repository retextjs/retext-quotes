# retext-quotes [![Build][build-badge]][build] [![Coverage][coverage-badge]][coverage] [![Downloads][downloads-badge]][downloads] [![Chat][chat-badge]][chat]

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

##### `options`

Optional configuration.

###### `options.preferred`

Style of quotes to prefer (`'smart'` or `'straight'`, default: `'smart'`).

###### `options.straight`

List of quotes to see as “straight” (`Array.<string>`, default: `['"', '\'']`).

###### `options.smart`

List of quotes to see as “smart” (`Array.<string>`, default: `['“”', '‘’']`).

## Related

*   [`retext-contractions`](https://github.com/retextjs/retext-contractions)
    — Check apostrophe use in contractions
*   [`retext-diacritics`](https://github.com/retextjs/retext-diacritics)
    — Check for proper use of diacritics
*   [`retext-sentence-spacing`](https://github.com/retextjs/retext-sentence-spacing)
    — Check spacing (one or two spaces) between sentences

## Contribute

See [`contributing.md` in `retextjs/retext`][contributing] for ways to get
started.

This organisation has a [Code of Conduct][coc].  By interacting with this
repository, organisation, or community you agree to abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/retextjs/retext-quotes.svg

[build]: https://travis-ci.org/retextjs/retext-quotes

[coverage-badge]: https://img.shields.io/codecov/c/github/retextjs/retext-quotes.svg

[coverage]: https://codecov.io/github/retextjs/retext-quotes

[downloads-badge]: https://img.shields.io/npm/dm/retext-quotes.svg

[downloads]: https://www.npmjs.com/package/retext-quotes

[chat-badge]: https://img.shields.io/badge/join%20the%20community-on%20spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/retext

[npm-install]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[retext]: https://github.com/retextjs/retext

[contributing]: https://github.com/retextjs/retext/blob/master/contributing.md

[coc]: https://github.com/retextjs/retext/blob/master/code-of-conduct.md
