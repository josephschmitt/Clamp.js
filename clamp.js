/*!
* Clamp.js 0.5
*
* Copyright 2011, Joseph Schmitt http://reusablebits.com, http://josephschmitt.me
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*/

(function(){
    /**
     * Clamps a text node.
     * @param {HTMLElement} element. Element containing the text node to clamp.
     * @param {Object} options. Options to pass to the clamper.
     */

    var clampUtils = {
      /**
      * Returns the line-height of an element as an integer.
      */
      getLineHeight: function (elem) {
        var lh = this.computeStyle(elem, 'line-height');
        if (lh == 'normal') {
            // Normal line heights vary from browser to browser. The spec recommends
            // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
            lh = parseInt(this.computeStyle(elem, 'font-size')) * 1.2;
        }
        return parseInt(lh);
      },

      /**
       * Return the current style for an element.
       * @param {HTMLElement} elem The element to compute.
       * @param {string} prop The style property.
       * @returns {number}
       */
      computeStyle: function (elem, prop) {
          if (!window.getComputedStyle) {
              window.getComputedStyle = function(el, pseudo) {
                  this.el = el;
                  this.getPropertyValue = function(prop) {
                      var re = /(\-([a-z]){1})/g;
                      if (prop == 'float') prop = 'styleFloat';
                      if (re.test(prop)) {
                          prop = prop.replace(re, function () {
                              return arguments[2].toUpperCase();
                          });
                      }
                      return el.currentStyle && el.currentStyle[prop] ? el.currentStyle[prop] : null;
                  }
                  return this;
              }
          }

          return window.getComputedStyle(elem, null).getPropertyValue(prop);
      },

      /**
       * Returns the maximum number of lines of text that should be rendered based
       * on the current height of the element and the line-height of the text.
       */
      getMaxLines: function (element, height) {
          var availHeight = height || element.clientHeight,
              lineHeight = clampUtils.getLineHeight(element);
          return Math.max(Math.floor(availHeight/lineHeight), 0);
      },

      /**
       * Returns the maximum height a given element should have based on the line-
       * height of the text and the given clamp value.
       */
      getMaxHeight: function (element, clmp) {
          var lineHeight = clampUtils.getLineHeight(element);
          return lineHeight * clmp;
      }
    }

    function clamp(element, options) {
        options = options || {};

        var self = this,
            win = window,
            opt = {
                lines:              options.lines || 2,
                useNativeClamp:     typeof(options.useNativeClamp) != 'undefined' ? options.useNativeClamp : true,
                splitOnChars:       options.splitOnChars || ['.', '-', '–', '—', ' '], //Split on sentences (periods), hypens, en-dashes, em-dashes, and words (spaces).
                animate:            options.animate || false
            },

            sty = element.style,
            original = element.innerHTML,

            supportsNativeClamp = typeof(element.style.webkitLineClamp) != 'undefined',
            clampValue = opt.lines,
            isCSSValue = clampValue.indexOf && (clampValue.indexOf('px') > -1 || clampValue.indexOf('em') > -1);


// UTILITY FUNCTIONS __________________________________________________________


// MEAT AND POTATOES (MMMM, POTATOES...) ______________________________________
        var splitOnChars = opt.splitOnChars.slice(0),
            splitChar = splitOnChars[0],
            chunks,
            lastChunk;

        /**
         * Gets an element's last child. That may be another node or a node's contents.
         */
        function getLastChild(elem) {
            //Current element has children, need to go deeper and get last child as a text node
            if (elem.lastChild.children && elem.lastChild.children.length > 0) {
                return getLastChild(Array.prototype.slice.call(elem.children).pop());
            }
            //This is the absolute last child, a text node, but something's wrong with it. Remove it and keep trying
            else if (!elem.lastChild || !elem.lastChild.nodeValue || elem.lastChild.nodeValue == '' || elem.lastChild.nodeValue == '…') {
                elem.lastChild.parentNode.removeChild(elem.lastChild);
                return getLastChild(element);
            }
            //This is the last child we want, return it
            else {
                return elem.lastChild;
            }
        }

        /**
         * Removes one character at a time from the text until its width or
         * height is beneath the passed-in max param.
         */
        function truncate(target, maxHeight) {
            if (!maxHeight) {return;}

            /**
             * Resets global variables.
             */
            function reset() {
                splitOnChars = opt.splitOnChars.slice(0);
                splitChar = splitOnChars[0];
                chunks = null;
                lastChunk = null;
            }

            var nodeValue = target.nodeValue.replace(/…/, '');

            //Grab the next chunks
            if (!chunks) {
                //If there are more characters to try, grab the next one
                if (splitOnChars.length > 0) {
                    splitChar = splitOnChars.shift();
                }
                //No characters to chunk by. Go character-by-character
                else {
                    splitChar = '';
                }

                chunks = nodeValue.split(splitChar);
            }

            //If there are chunks left to remove, remove the last one and see if
            // the nodeValue fits.
            if (chunks.length > 1) {
                lastChunk = chunks.pop();
                applyEllipsis(target, chunks.join(splitChar));
            }
            //No more chunks can be removed using this character
            else {
                chunks = null;
            }

            //Search produced valid chunks
            if (chunks) {
                //It fits
                if (element.clientHeight <= maxHeight) {
                    //There's still more characters to try splitting on, not quite done yet
                    if (splitOnChars.length >= 0 && splitChar != '') {
                        applyEllipsis(target, chunks.join(splitChar) + splitChar + lastChunk);
                        chunks = null;
                    }
                    //Finished!
                    else {
                        return false;
                    }
                }
            }
            //No valid chunks produced
            else {
                //No valid chunks even when splitting by letter, time to move
                //on to the next node
                if (splitChar == '') {
                    applyEllipsis(target, '');
                    target = getLastChild(element);

                    reset();
                }
            }

            //If you get here it means still too big, let's keep truncating
            if (opt.animate) {
                setTimeout(function() {
                    truncate(target, maxHeight);
                }, opt.animate === true ? 10 : opt.animate);
            }
            else {
                truncate(target, maxHeight);
            }
        }

        function applyEllipsis(elem, str) {
            elem.nodeValue = str + '…';
        }


// CONSTRUCTOR ________________________________________________________________

        if (clampValue == 'auto') {
            clampValue = clampUtils.getMaxLines(element);
        }
        else if (isCSSValue) {
            clampValue = clampUtils.getMaxLines(element, parseInt(clampValue));
        }

        if (supportsNativeClamp && opt.useNativeClamp) {
            sty.overflow = 'hidden';
            sty.textOverflow = 'ellipsis';
            sty.webkitBoxOrient = 'vertical';
            sty.display = '-webkit-box';
            sty.webkitLineClamp = clampValue;

            if (isCSSValue) {
                sty.height = opt.lines + 'px';
            }
        }
        else {
            var height = clampUtils.getMaxHeight(element, clampValue);
            if (height <= element.clientHeight) {
                truncate(getLastChild(element), height);
            }
        }
    }

    window.$clamp = clamp;
    window.clampUtils = clampUtils;
})();

