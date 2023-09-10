# retext-quotes

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[retext][]** plugin to check quotes and apostrophes.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(retextQuotes[, options])`](#unifieduseretextquotes-options)
    *   [`Options`](#options)
*   [Messages](#messages)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([retext][]) plugin to check quotes and
apostrophes.
It warns if their style (`"straight"` or `“smart”`) or level of nesting is not
the preferred style.

## When should I use this?

You can opt-into this plugin when you’re dealing with content that might contain
punctuation mistakes, and have authors that can fix that content.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install retext-quotes
```

In Deno with [`esm.sh`][esmsh]:

```js
import retextQuotes from 'https://esm.sh/retext-quotes@6'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import retextQuotes from 'https://esm.sh/retext-quotes@6?bundle'
</script>
```

## Use

Say our document `example.txt` contains:

```txt
A sentence "with quotes, 'nested' quotes,
and '80s apostrophes."
```

…and our module `example.js` contains:

```js
import retextEnglish from 'retext-english'
import retextQuotes from 'retext-quotes'
import retextStringify from 'retext-stringify'
import {unified} from 'unified'
import {read} from 'to-vfile'
import {reporter} from 'vfile-reporter'

const file = await unified()
  .use(retextEnglish)
  .use(retextQuotes)
  .use(retextStringify)
  .process(await read('example.txt'))

console.error(reporter(file))
```

…then running `node example.js` yields:

```txt
example.txt
  1:12-1:13  warning  Expected a smart quote: `“`, not `"`       quote       retext-quotes
  1:26-1:27  warning  Expected a smart quote: `‘`, not `'`       quote       retext-quotes
  1:33-1:34  warning  Expected a smart quote: `’`, not `'`       quote       retext-quotes
    2:5-2:6  warning  Expected a smart apostrophe: `’`, not `'`  apostrophe  retext-quotes
  2:22-2:23  warning  Expected a smart quote: `”`, not `"`       quote       retext-quotes

⚠ 5 warnings
```

## API

This package exports no identifiers.
The default export is [`retextQuotes`][api-retext-quotes].

### `unified().use(retextQuotes[, options])`

Check quotes and apostrophes.

###### Parameters

*   `options` ([`Options`][api-options], optional)
    — configuration

###### Returns

Transform ([`Transformer`][unified-transformer]).

###### Notes

This plugin knows about apostrophes as well and prefers `'` when
`preferred: 'straight'`, and `’` otherwise.

The values in `straight` and `smart` can be one or two characters.
When two, the first character determines the opening quote and the second
the closing quote at that level.
When one, both the opening and closing quote are that character.

The order in which the preferred quotes appear in their respective list
determines which quotes to use at which level of nesting.
So, to prefer `‘’` at the first level of nesting, and `“”` at the second,
pass: `smart: ['‘’', '“”']`.

If quotes are nested deeper than the given amount of quotes, the markers
wrap around: a third level of nesting when using `smart: ['«»', '‹›']`
should have double guillemets, a fourth single, a fifth double again, etc.

### `Options`

Configuration (TypeScript type).

###### Fields

*   `preferred` (`'smart'` or `'straight'`, default: `'smart'`)
    — style of quotes to use
*   `smart` (`Array<string>`, default: `['“”', '‘’']`)
    — list of quotes to see as “smart”
*   `smart` (`Array<string>`, default: `['"', "'"]`)
    — list of quotes to see as “straight”

## Messages

Each message is emitted as a [`VFileMessage`][vfile-message] on `file`, with
`source` set to `'retext-quotes'`, `ruleId` to `'apostrophe'` or `'quote'`,
`actual` to the unexpected character, and `expected` to suggestions.

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `retext-quotes@^6`,
compatible with Node.js 16.

## Related

*   [`retext-contractions`](https://github.com/retextjs/retext-contractions)
    — check apostrophe use in contractions
*   [`retext-diacritics`](https://github.com/retextjs/retext-diacritics)
    — check for proper use of diacritics
*   [`retext-sentence-spacing`](https://github.com/retextjs/retext-sentence-spacing)
    — check spacing between sentences

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

[size-badge]: https://img.shields.io/bundlejs/size/retext-quotes

[size]: https://bundlejs.com/?q=retext-quotes

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/retextjs/retext/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[health]: https://github.com/retextjs/.github

[contributing]: https://github.com/retextjs/.github/blob/main/contributing.md

[support]: https://github.com/retextjs/.github/blob/main/support.md

[coc]: https://github.com/retextjs/.github/blob/main/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[retext]: https://github.com/retextjs/retext

[unified]: https://github.com/unifiedjs/unified

[unified-transformer]: https://github.com/unifiedjs/unified#transformer

[vfile-message]: https://github.com/vfile/vfile-message

[api-options]: #options

[api-retext-quotes]: #unifieduseretextquotes-options
