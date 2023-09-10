/**
 * @typedef {import('nlcst').Punctuation} Punctuation
 * @typedef {import('nlcst').Root} Root
 * @typedef {import('nlcst').Sentence} Sentence
 * @typedef {import('nlcst').Word} Word
 *
 * @typedef {import('vfile').VFile} VFile
 */

/**
 * @typedef Marker
 *   Marker.
 * @property {Style} style
 *   Whether the marker is `straight` or `smart`.
 * @property {string} marker
 *   The actual marker.
 * @property {'apostrophe' | 'close' | 'open' | undefined} type
 *   What the marker seems to be for.
 *
 *
 * @typedef Options
 *   Configuration.
 * @property {Style | null | undefined} [preferred='smart']
 *   Style of quotes to use (default: `'smart'`).
 * @property {ReadonlyArray<string> | null | undefined} [smart=['“”', '‘’']]
 *   List of quotes to see as “smart” (default: `['“”', '‘’']`).
 * @property {ReadonlyArray<string> | null | undefined} [straight=['"', "'"]]
 *   List of quotes to see as “straight” (default: `['"', "'"]`).
 *
 * @typedef {'smart' | 'straight'} Style
 *   Style.
 */

import {toString} from 'nlcst-to-string'
import {SKIP, visit} from 'unist-util-visit'

/** @type {Readonly<Options>} */
const emptyOptions = {}
/** @type {ReadonlyArray<string>} */
const defaultSmart = ['“”', '‘’']
/** @type {ReadonlyArray<string>} */
const defaultStraight = ['"', "'"]

/**
 * Check quotes and apostrophes.
 *
 * ###### Notes
 *
 * This plugin knows about apostrophes as well and prefers `'` when
 * `preferred: 'straight'`, and `’` otherwise.
 *
 * The values in `straight` and `smart` can be one or two characters.
 * When two, the first character determines the opening quote and the second
 * the closing quote at that level.
 * When one, both the opening and closing quote are that character.
 *
 * The order in which the preferred quotes appear in their respective list
 * determines which quotes to use at which level of nesting.
 * So, to prefer `‘’` at the first level of nesting, and `“”` at the second,
 * pass: `smart: ['‘’', '“”']`.
 *
 * If quotes are nested deeper than the given amount of quotes, the markers
 * wrap around: a third level of nesting when using `smart: ['«»', '‹›']`
 * should have double guillemets, a fourth single, a fifth double again, etc.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function retextQuotes(options) {
  const settings = options || emptyOptions
  const preferred = settings.preferred || 'smart'
  const smart = settings.smart || defaultSmart
  const straight = settings.straight || defaultStraight

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @param {VFile} file
   *   File.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree, file) {
    // Walk paragraphs first, that way if the stack isn’t closed properly we
    // can start fresh each paragraph.
    visit(tree, 'ParagraphNode', function (paragraph) {
      /** @type {Array<Marker>} */
      const stack = []

      visit(paragraph, 'PunctuationNode', function (node, index, parent) {
        const actual = toString(node)
        const style = check(actual, straight, smart)

        if (!style || !parent || index === undefined) {
          return
        }

        if (actual === "'" || actual === '’' || !style.type) {
          inferStyle(stack, style, node, index, parent)
        }

        // Open stack.
        if (style.type === 'open') {
          stack.push(style)
        }

        // Calculate preferred style.
        /** @type {string} */
        let expected

        if (style.type === 'apostrophe') {
          expected = preferred === 'smart' ? '’' : "'"
        } else {
          const markers = preferred === 'smart' ? smart : straight
          expected = markers[(stack.length + 1) % markers.length]

          if (expected.length > 1) {
            expected = expected.charAt(style.type === 'open' ? 0 : 1)
          }
        }

        // Close stack.
        // There could be a case here where opening and closing are mismatched,
        // like `“‘this”’`.
        // I think we’ve got the highest chance of removing them one at a time,
        // but haven’t really checked it.
        // We’ll see whether the simple solution holds.
        if (style.type === 'close') {
          stack.pop()
        }

        // Perfect!
        if (actual === expected) {
          return
        }

        // On to warning…
        const name = style.type === 'apostrophe' ? style.type : 'quote'

        const message = file.message(
          preferred === style.style
            ? 'Unexpected `' +
                actual +
                '` at this level of nesting, expected `' +
                expected +
                '`'
            : 'Unexpected ' +
                (preferred === 'smart' ? 'straight' : 'smart') +
                ' ' +
                name +
                ' `' +
                actual +
                '`, expected `' +
                expected +
                '`',
          {
            ancestors: [parent, node],
            place: node.position,
            source: 'retext-quotes',
            ruleId: name
          }
        )

        message.actual = actual
        message.expected = [expected]
        message.url = 'https://github.com/retextjs/retext-quotes#readme'
      })

      return SKIP
    })
  }

  /**
   * Check whether `straight` or `smart` contains `value`.
   *
   * @param {string} value
   *   Quote or apostrophe.
   * @param {ReadonlyArray<string>} straight
   *   Straight quotes.
   * @param {ReadonlyArray<string>} smart
   *   Smart quotes.
   * @returns {Marker | undefined}
   *   Marker.
   */
  function check(value, straight, smart) {
    return (
      contains(value, straight, 'straight') || contains(value, smart, 'smart')
    )
  }

  /**
   * Check if the marker is in `markers`.
   *
   * @param {string} value
   *   Marker.
   * @param {ReadonlyArray<string>} markers
   *   Markers.
   * @param {Style} style
   *   Style.
   * @returns {Marker | undefined}
   *   Marker.
   */
  function contains(value, markers, style) {
    let index = -1

    while (++index < markers.length) {
      const marker = markers[index]
      const both = marker.length > 1

      if (marker.charAt(0) === value) {
        return {marker, style, type: both ? 'open' : undefined}
      }

      if (both && marker.charAt(1) === value) {
        return {marker, style, type: 'close'}
      }
    }
  }

  /**
   * Infere the `style` of a quote.
   *
   * @param {ReadonlyArray<Marker>} stack
   *   Stack of markers.
   * @param {Marker} marker
   *   Marker.
   * @param {Readonly<Punctuation>} node
   *   Node.
   * @param {number} index
   *   Index of `node` in `parent`.
   * @param {Readonly<Sentence> | Readonly<Word>} parent
   *   Parent of `node`.
   * @returns {undefined}
   *   Nothing.
   */
  // eslint-disable-next-line max-params
  function inferStyle(stack, marker, node, index, parent) {
    const value = toString(node)
    const previous = parent.children[index - 1]
    const next = parent.children[index + 1]

    // Needed if this is ever externalised.
    /* c8 ignore next 3 */
    if (!node || node.type !== 'PunctuationNode') {
      return
    }

    if (value === "'" || value === '’') {
      // Apostrophe when in word.
      if (parent.type === 'WordNode') {
        marker.type = 'apostrophe'
        return
      }

      if (
        previous &&
        (previous.type === 'SourceNode' || previous.type === 'WordNode')
      ) {
        const before = toString(previous)

        // Apostrophe if the previous word ends in `s`, and there’s no open single
        // quote.
        // Example: `Mr. Jones' golf clubs` vs. `'Mr. Jones' golf clubs`.
        marker.type =
          before.charAt(before.length - 1).toLowerCase() === 's' &&
          open(stack, marker)
            ? 'apostrophe'
            : 'close'
        return
      }

      if (next && next.type === 'WordNode') {
        // Apostrophe if the next word is a decade.
        marker.type = /^\d\ds$/.test(toString(next)) ? 'apostrophe' : 'open'
        return
      }
    }

    marker.type = open(stack, marker) ? 'open' : 'close'
  }

  /**
   * @param {ReadonlyArray<Marker>} stack
   *   Stack of markers.
   * @param {Readonly<Marker>} marker
   *   Marker.
   * @returns {boolean}
   *   Whether the stack is open.
   */
  function open(stack, marker) {
    return (
      stack.length === 0 || stack[stack.length - 1].marker !== marker.marker
    )
  }
}
