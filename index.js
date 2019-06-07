'use strict'

var toString = require('nlcst-to-string')
var visit = require('unist-util-visit')
var convert = require('unist-util-is/convert')

var word = convert('WordNode')
var punctuation = convert('PunctuationNode')
var wordOrSource = convert(['WordNode', 'SourceNode'])

var decadeExpression = /^\d\ds$/
var source = 'retext-quotes'
var doubleQuotationMark = '"'
var singleQuotationMark = "'"
var leftDoubleQuotationMark = '“'
var rightDoubleQuotationMark = '”'
var leftSingleQuotationMark = '‘'
var rightSingleQuotationMark = '’'
var doubleQuotationMarks = leftDoubleQuotationMark + rightDoubleQuotationMark
var singleQuotationMarks = leftSingleQuotationMark + rightSingleQuotationMark
var opening = 'open'
var closing = 'close'
var apostrophe = 'apostrophe'
var quote = 'quote'

module.exports = quotes

// Check quote use.
function quotes(options) {
  var settings = options || {}
  var preferred = settings.preferred || 'smart'
  var smart = settings.smart || [doubleQuotationMarks, singleQuotationMarks]
  var straight = settings.straight || [doubleQuotationMark, singleQuotationMark]

  return transformer

  function transformer(tree, file) {
    // Walk paragraphs first, that way if the stack isn’t closed properly we
    // can start fresh each paragraph.
    visit(tree, 'ParagraphNode', visitor)

    function visitor(paragraph) {
      var stack = []

      visit(paragraph, 'PunctuationNode', each)

      return visit.SKIP

      function each(node, index, parent) {
        var actual = toString(node)
        var style = check(actual, straight, smart)
        var expected
        var message
        var markers
        var label

        if (!style) {
          return
        }

        if (
          actual === singleQuotationMark ||
          actual === rightSingleQuotationMark ||
          !style.type
        ) {
          inferStyle(style, stack, node, index, parent)
        }

        // Open stack.
        if (style.type === opening) {
          stack.push(style)
        }

        // Calculate preferred style.
        if (style.type === apostrophe) {
          expected =
            preferred === 'smart'
              ? rightSingleQuotationMark
              : singleQuotationMark
        } else {
          markers = preferred === 'smart' ? smart : straight
          expected = markers[(stack.length + 1) % markers.length]

          if (expected.length > 1) {
            expected = expected.charAt(style.type === opening ? 0 : 1)
          }
        }

        // Close stack.
        // There could be a case here where opening and closing are mismatched,
        // like `“‘this”’`.
        // I think we’ve got the highest chance of removing them one at a time,
        // but haven’t really checked it.
        // We’ll see whether the simple solution holds.
        if (style.type === closing) {
          stack.pop()
        }

        // Perfect!
        if (actual === expected) {
          return
        }

        // On to warning…
        label = style.type === apostrophe ? style.type : quote

        if (preferred === style.style) {
          message = file.message(
            'Expected `' +
              expected +
              '` to be used at this level of nesting, not `' +
              actual +
              '`',
            node
          )
        } else {
          message = file.message(
            'Expected a ' +
              preferred +
              ' ' +
              label +
              ': `' +
              expected +
              '`, not `' +
              actual +
              '`',
            node
          )
        }

        message.source = source
        message.ruleId = label
        message.actual = actual
        message.expected = [expected]
      }
    }
  }
}

// Check whether `straight` or `smart` contains `value`.
function check(value, straight, smart) {
  return (
    contains(value, straight, 'straight') || contains(value, smart, 'smart')
  )
}

// Check if the marker is in `markers`.
function contains(value, markers, label) {
  var length = markers.length
  var index = -1
  var marker
  var both

  while (++index < length) {
    marker = markers[index]
    both = marker.length > 1

    if (marker.charAt(0) === value) {
      return {style: label, type: both ? opening : null, marker: marker}
    }

    if (both && marker.charAt(1) === value) {
      return {style: label, type: closing, marker: marker}
    }
  }
}

// Infere the `style` of a quote.
// eslint-disable-next-line max-params
function inferStyle(style, stack, node, index, parent) {
  var siblings = parent.children
  var prev
  var next
  var value

  /* istanbul ignore if - Needed if this is ever externalised. */
  if (!node || !punctuation(node)) {
    return
  }

  value = toString(node)

  if (value === singleQuotationMark || value === rightSingleQuotationMark) {
    // Apostrophe when in word.
    if (word(parent)) {
      style.type = apostrophe
      return
    }

    prev = siblings[index - 1]
    next = siblings[index + 1]

    if (wordOrSource(prev)) {
      value = toString(prev)

      // Apostrophe if the previous word ends in `s`, and there’s no open single
      // quote.  Example: `Mr. Jones' golf clubs` vs. `'Mr. Jones' golf clubs`.
      if (
        value.charAt(value.length - 1).toLowerCase() === 's' &&
        open(stack, style)
      ) {
        style.type = apostrophe
      } else {
        style.type = closing
      }

      return
    }

    if (word(next)) {
      value = toString(next)

      // Apostrophe if the next word is a decade.
      style.type = decadeExpression.test(value) ? apostrophe : opening

      return
    }
  }

  style.type = open(stack, style) ? opening : closing
}

function open(stack, style) {
  return !stack.length || stack[stack.length - 1].marker !== style.marker
}
