/**
 * @typedef {import('nlcst').Root} Root
 * @typedef {import('nlcst').Sentence} Sentence
 * @typedef {import('nlcst').Word} Word
 * @typedef {import('nlcst').Punctuation} Punctuation
 *
 * @typedef {'smart'|'straight'} Preference
 *
 * @typedef Options
 *   Configuration.
 * @property {Preference} [preferred='smart']
 *   Style of quotes to prefer.
 * @property {string[]} [straight=['"', "'"]]
 *   List of quotes to see as “straight”.
 * @property {string[]} [smart=['“”', '‘’']]
 *   List of quotes to see as “smart”.
 */

import {toString} from 'nlcst-to-string'
import {visit, SKIP} from 'unist-util-visit'
import {convert} from 'unist-util-is'

const word = convert('WordNode')
const punctuation = convert('PunctuationNode')
const wordOrSource = convert(['WordNode', 'SourceNode'])

const source = 'retext-quotes'
const url = 'https://github.com/retextjs/retext-quotes#readme'

/**
 * Plugin to check quote use.
 *
 * @type {import('unified').Plugin<[Options?], Root>}
 */
export default function retextQuotes(options = {}) {
  /**
   * @typedef Marker
   * @property {Preference} style
   * @property {string} marker
   * @property {'open'|'close'|'apostrophe'|undefined} type
   */

  const preferred = options.preferred || 'smart'
  const smart = options.smart || ['“”', '‘’']
  const straight = options.straight || ['"', "'"]

  return (tree, file) => {
    // Walk paragraphs first, that way if the stack isn’t closed properly we
    // can start fresh each paragraph.
    visit(tree, 'ParagraphNode', (paragraph) => {
      /** @type {Marker[]} */
      const stack = []

      visit(paragraph, 'PunctuationNode', (node, index, parent_) => {
        const parent = /** @type {Sentence|Word} */ (parent_)
        const actual = toString(node)
        const style = check(actual, straight, smart)

        if (!style || !parent || index === null) {
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
        const label = style.type === 'apostrophe' ? style.type : 'quote'

        Object.assign(
          file.message(
            preferred === style.style
              ? 'Expected `' +
                  expected +
                  '` to be used at this level of nesting, not `' +
                  actual +
                  '`'
              : 'Expected a ' +
                  preferred +
                  ' ' +
                  label +
                  ': `' +
                  expected +
                  '`, not `' +
                  actual +
                  '`',
            node,
            source + ':' + label
          ),
          {actual, expected: [expected], url}
        )
      })

      return SKIP
    })
  }

  /**
   * Check whether `straight` or `smart` contains `value`.
   *
   * @param {string} value
   * @param {string[]} straight
   * @param {string[]} smart
   * @returns {Marker|undefined}
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
   * @param {string[]} markers
   * @param {Preference} label
   * @returns {Marker|undefined}
   */
  function contains(value, markers, label) {
    let index = -1

    while (++index < markers.length) {
      const marker = markers[index]
      const both = marker.length > 1

      if (marker.charAt(0) === value) {
        return {style: label, type: both ? 'open' : undefined, marker}
      }

      if (both && marker.charAt(1) === value) {
        return {style: label, type: 'close', marker}
      }
    }
  }

  /**
   * Infere the `style` of a quote.
   *
   * @param {Marker[]} stack
   * @param {Marker} style
   * @param {Punctuation} node
   * @param {number} index
   * @param {Sentence|Word} parent
   * @returns {void}
   */
  // eslint-disable-next-line max-params
  function inferStyle(stack, style, node, index, parent) {
    const value = toString(node)
    const previous = parent.children[index - 1]
    const next = parent.children[index + 1]

    // Needed if this is ever externalised.
    /* c8 ignore next 3 */
    if (!node || !punctuation(node)) {
      return
    }

    if (value === "'" || value === '’') {
      // Apostrophe when in word.
      if (word(parent)) {
        style.type = 'apostrophe'
        return
      }

      if (wordOrSource(previous)) {
        const before = toString(previous)

        // Apostrophe if the previous word ends in `s`, and there’s no open single
        // quote.  Example: `Mr. Jones' golf clubs` vs. `'Mr. Jones' golf clubs`.
        style.type =
          before.charAt(before.length - 1).toLowerCase() === 's' &&
          open(stack, style)
            ? 'apostrophe'
            : 'close'

        return
      }

      if (word(next)) {
        // Apostrophe if the next word is a decade.
        style.type = /^\d\ds$/.test(toString(next)) ? 'apostrophe' : 'open'

        return
      }
    }

    style.type = open(stack, style) ? 'open' : 'close'
  }

  /**
   * @param {Marker[]} stack
   * @param {Marker} style
   * @returns {boolean}
   */
  function open(stack, style) {
    return stack.length === 0 || stack[stack.length - 1].marker !== style.marker
  }
}
