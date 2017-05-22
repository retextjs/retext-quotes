'use strict';

var toString = require('nlcst-to-string');
var visit = require('unist-util-visit');
var is = require('unist-util-is');

var DECADE = /^\d\ds$/;

module.exports = quotes;

/* Check quote use. */
function quotes(options) {
  var settings = options || {};
  var preferred = settings.preferred || 'smart';
  var smart = settings.smart || ['“”', '‘’'];
  var straight = settings.straight || ['"', '\''];

  return transformer;

  function transformer(tree, file) {
    /* Walk paragraphs first, that way if the stack isn’t closed
     * properly we can start fresh each paragraph. */
    visit(tree, 'ParagraphNode', visitor);

    function visitor(paragraph) {
      var stack = [];

      visit(paragraph, 'PunctuationNode', each);

      function each(node, index, parent) {
        var value = toString(node);
        var style = check(value, straight, smart);
        var replacement;
        var message;
        var markers;
        var label;

        if (!style) {
          return;
        }

        if (value === '\'' || value === '’' || !style.type) {
          inferStyle(style, stack, node, index, parent);
        }

        /* Open stack. */
        if (style.type === 'open') {
          stack.push(style);
        }

        /* Calculate preferred style. */
        if (style.type === 'apostrophe') {
          replacement = preferred === 'smart' ? '’' : '\'';
        } else {
          markers = preferred === 'smart' ? smart : straight;
          replacement = markers[(stack.length + 1) % markers.length];

          if (replacement.length > 1) {
            replacement = replacement.charAt(style.type === 'open' ? 0 : 1);
          }
        }

        /* Close stack.
         * There could be a case here where opening and closing
         * are mismatched, like `“‘this”’`.  I think we’ve got
         * the highest chance of removing them one at a time,
         * but haven’t really checked it.  We’ll see whether the
         * simple solution holds. */
        if (style.type === 'close') {
          stack.pop();
        }

        /* Perfect! */
        if (replacement === value) {
          return;
        }

        /* On to warning... */
        label = style.type === 'apostrophe' ? style.type : 'quote';

        if (preferred === style.style) {
          message = file.warn(
            'Expected `' + replacement + '` to be used at this ' +
            'level of nesting, not `' + value + '`',
            node
          );
        } else {
          message = file.warn(
            'Expected a ' +
            preferred + ' ' + label + ': `' +
            replacement + '`, not `' + value + '`',
            node
          );
        }

        message.source = 'retext-quotes';
        message.ruleId = label;
      }
    }
  }
}

/* Check whether `straight` or `smart` contains `value`. */
function check(value, straight, smart) {
  return contains(value, straight, 'straight') || contains(value, smart, 'smart');
}

/* Check if the marker is in `markers`. */
function contains(value, markers, label) {
  var length = markers.length;
  var index = -1;
  var marker;
  var both;

  while (++index < length) {
    marker = markers[index];
    both = marker.length > 1;

    if (marker.charAt(0) === value) {
      return {
        style: label,
        type: both ? 'open' : null,
        marker: marker
      };
    }

    if (both && marker.charAt(1) === value) {
      return {
        style: label,
        type: 'close',
        marker: marker
      };
    }
  }
}

/* eslint-disable max-params */

/* Infere the `style` of a quote. */
function inferStyle(style, stack, node, index, parent) {
  var siblings = parent.children;
  var prev;
  var next;
  var value;

  /* istanbul ignore if - Needed if this is ever externalised. */
  if (!node || node.type !== 'PunctuationNode') {
    return;
  }

  value = toString(node);

  if (value === '\'' || value === '’') {
    /* Apostrophe when in word. */
    if (is('WordNode', parent)) {
      style.type = 'apostrophe';
      return;
    }

    prev = siblings[index - 1];
    next = siblings[index + 1];

    if (is('WordNode', prev)) {
      value = toString(prev);

      /* Apostrophe if the previous word ends in `s`, and
       * there’s no open single quote.  Example:
       *`Mr. Jones' golf clubs` vs. `'Mr. Jones' golf clubs`. */
      if (
        value.charAt(value.length - 1).toLowerCase() === 's' &&
        open(stack, style)
      ) {
        style.type = 'apostrophe';
      } else {
        style.type = 'close';
      }

      return;
    }

    if (is('WordNode', next)) {
      value = toString(next);

      /* Apostrophe if the next word is a decade. */
      style.type = DECADE.test(value) ? 'apostrophe' : 'open';

      return;
    }
  }

  style.type = open(stack, style) ? 'open' : 'close';
}

function open(stack, style) {
  return !stack.length || stack[stack.length - 1].marker !== style.marker;
}
