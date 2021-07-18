# retext-quotes

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**retext**][retext] plugin to check quotes and apostrophes, and warn if their
style (`"straight"` or `“smart”`) or level of nesting is not the preferred
style.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install retext-quotes
```

## Use

Say we have the following file, `example.txt`:

```txt
A sentence "with quotes, 'nested' quotes,
and '80s apostrophes."
```

…and our script, `example.js`, looks like this:

```js
import {readSync} from 'to-vfile'
import {reporter} from 'vfile-reporter'
import {unified} from 'unified'
import retextEnglish from 'retext-english'
import retextQuotes from 'retext-quotes'
import retextStringify from 'retext-stringify'

const file = readSync('example.txt')

unified()
  .use(retextEnglish)
  .use(retextQuotes)
  .use(retextStringify)
  .process(file)
  .then((file) => {
    console.error(reporter(file))
  })
```

Now, running `node example` yields:

```txt
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
   .use(retextEnglish)
-  .use(retextQuotes)
+  .use(retextQuotes, {preferred: 'straight'})
   .use(retextStringify)
```

Now, running `node example` again would yield:

```txt
no issues found
```

You can also pass in different markers that count as “smart”:

```diff
   .use(retextEnglish)
-  .use(retextQuotes)
+  .use(retextQuotes, {smart: ['«»', '‹›']})
   .use(retextStringify)
```

Running `node example` a final time yields:

```txt
example.txt
  1:12-1:13  warning  Expected a smart quote: `«`, not `"`       quote       retext-quotes
  1:26-1:27  warning  Expected a smart quote: `‹`, not `'`       quote       retext-quotes
  1:33-1:34  warning  Expected a smart quote: `›`, not `'`       quote       retext-quotes
    2:5-2:6  warning  Expected a smart apostrophe: `’`, not `'`  apostrophe  retext-quotes
  2:22-2:23  warning  Expected a smart quote: `»`, not `"`       quote       retext-quotes

⚠ 5 warnings
```

## API

This package exports no identifiers.
The default export is `retextQuotes`.

### `unified().use(retextQuotes[, options])`

Check quotes and apostrophes.
Emit warnings when they don’t match the preferred style.

This plugin knows about apostrophes as well and prefers `'` when `preferred:
'straight'`, and `’` otherwise.

The values in `straight` and `smart` can be one or two characters.
When two, the first character determines the opening quote and the second the
closing quote at that level.
When one, both the opening and closing quote are that character.

The order in which the preferred quotes appear in their respective list
determines which quotes to use at which level of nesting.
So, to prefer `‘’` at the first level of nesting, and `“”` at the second, pass:
`smart: ['‘’', '“”']`.

If quotes are nested deeper than the given amount of quotes, the markers wrap
around: a third level of nesting when using `smart: ['«»', '‹›']` should have
double guillemets, a fourth single, a fifth double again, etc.

###### `options.preferred`

Style of quotes to prefer (`'smart'` or `'straight'`, default: `'smart'`).

###### `options.straight`

List of quotes to see as “straight” (`Array.<string>`, default: `['"', '\'']`).

###### `options.smart`

List of quotes to see as “smart” (`Array.<string>`, default: `['“”', '‘’']`).

### Messages

Each message is emitted as a [`VFileMessage`][message] on `file`, with the
following fields:

###### `message.source`

Name of this plugin (`'retext-quotes'`).

###### `message.ruleId`

Category of message (`'apostrophe'` or `'quote'`)

###### `message.actual`

Current not ok character (`string`).

###### `message.expected`

Suggested replacement character (`Array.<string>`).

## Related

*   [`retext-contractions`](https://github.com/retextjs/retext-contractions)
    — Check apostrophe use in contractions
*   [`retext-diacritics`](https://github.com/retextjs/retext-diacritics)
    — Check for proper use of diacritics
*   [`retext-sentence-spacing`](https://github.com/retextjs/retext-sentence-spacing)
    — Check spacing (one or two spaces) between sentences

## Contribute

See [`contributing.md`][contributing] in [`retextjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/retextjs/retext-quotes/workflows/main/badge.svg

[build]: https://github.com/retextjs/retext-quotes/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/retextjs/retext-quotes.svg

[coverage]: https://codecov.io/github/retextjs/retext-quotes

[downloads-badge]: https://img.shields.io/npm/dm/retext-quotes.svg

[downloads]: https://www.npmjs.com/package/retext-quotes

[size-badge]: https://img.shields.io/bundlephobia/minzip/retext-quotes.svg

[size]: https://bundlephobia.com/result?p=retext-quotes

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/retextjs/retext/discussions

[npm]: https://docs.npmjs.com/cli/install

[health]: https://github.com/retextjs/.github

[contributing]: https://github.com/retextjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/retextjs/.github/blob/HEAD/support.md

[coc]: https://github.com/retextjs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[retext]: https://github.com/retextjs/retext

[message]: https://github.com/vfile/vfile-message
