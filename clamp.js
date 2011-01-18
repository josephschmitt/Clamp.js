/*!
* Clamp.js 0.1
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
    function clamp(element, options) {
        options = options || {};

        var self = this,
            win = window,
            opt = {
                clamp:              options.clamp || 2,
                useNativeClamp:     typeof(options.useNativeClamp) != 'undefined' ? options.useNativeClamp : true,
                animate:            options.animate || false
            },

            sty = element.style,
            original = element.innerHTML,

            supportsNativeClamp = typeof(element.style.webkitLineClamp) != 'undefined',
            clampValue = opt.clamp,
            isCSSValue = clampValue.indexOf && (clampValue.indexOf('px') > -1 || clampValue.indexOf('em') > -1);


// UTILITY FUNCTIONS __________________________________________________________

        /**
         * Return the current style for an element.
         * @param {HTMLElement} elem The element to compute.
         * @param {string} prop The style property.
         * @returns {number}
         */
        function computeStyle(elem, prop) {
            if (!win.getComputedStyle) {
                win.getComputedStyle = function(el, pseudo) {
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

            return win.getComputedStyle(elem, null).getPropertyValue(prop);
        }

        /**
         * Returns the maximum number of lines of text that should be rendered based
         * on the current height of the element and the line-height of the text.
         */
        function getMaxLines(height) {
            var availHeight = height || element.clientHeight,
                lineHeight = getLineHeight(element);

            return Math.max(Math.floor(availHeight/lineHeight), 0);
        }

        /**
         * Returns the maximum height a given element should have based on the line-
         * height of the text and the given clamp value.
         */
        function getMaxHeight(clmp) {
            var lineHeight = getLineHeight(element);
            return lineHeight * clmp;
        }

        /**
         * Returns the line-height of an element as an integer.
         */
        function getLineHeight(elem) {
            var lh = computeStyle(elem, 'line-height');
            if (lh == 'normal') {
                // Normal line heights vary from browser to browser. The spec recommends
                // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
                lh = parseInt(computeStyle(elem, 'font-size')) * 1.2;
            }
            return parseInt(lh);
        }


// MEAT AND POTATOES (MMMM, POTATOES...) ______________________________________
        var attempts = 5,
            splitOnWords = true,
            lastWord;
        /**
         * Removes one character at a time from the text until its width or
         * height is beneath the passed-in max param.
         */
        function truncate(maxHeight) {
            if (!maxHeight) {return;}
            
            function getLastChild(elem) {
                if (elem.children.length > 0) {
                    return getLastChild(Array.prototype.slice.call(elem.children).pop());
                }
                else if (!elem.lastChild || !elem.lastChild.nodeValue || elem.lastChild.nodeValue == '' || elem.lastChild.nodeValue == '…') {
                    elem.parentNode.removeChild(elem);
                    return getLastChild(element);
                }
                else {
                    return elem.lastChild;
                }
            }
            
            var lastChild = getLastChild(element),
                phrase = lastChild.nodeValue.split('…').join(''),
                words = phrase.split(' ');
            
            if (splitOnWords) {
                lastWord = words.pop();
                phrase = words.join(' ');
            }
            else {
                phrase = words.join(' ')
                if (lastWord) {
                    phrase += ' ' + lastWord;
                    lastWord = false;
                }
                else {
                    phrase = phrase.substr(0, phrase.length-1);
                }
            }
            
            applyEllipsis(lastChild, phrase);
            
            //It fits
            if (element.clientHeight <= maxHeight) {
                //Try again, this time splitting on chars
                if (splitOnWords) {
                    splitOnWords = false;
                }
                //Finished
                else {
                    return false;
                }
            }
            
            console.log('---------------------');
            if (opt.animate) {
                setTimeout(function() {
                    truncate(maxHeight, splitOnWords);
                }, 1);
            }
            else {
                truncate(maxHeight, splitOnWords);
            }
        }
        
        /**
         * @TODO: remove trailing white space.
         * @TODO: remove trailing puncuation (especially periods).
         */
        function applyEllipsis(elem, str) {
            elem.nodeValue = str + '…';
        }


// CONSTRUCTOR ________________________________________________________________

        if (clampValue == 'auto') {
            clampValue = getMaxLines();
        }
        else if (isCSSValue) {
            clampValue = getMaxLines(parseInt(clampValue));
        }

        if (supportsNativeClamp && opt.useNativeClamp) {
            sty.overflow = 'hidden';
            sty.textOverflow = 'ellipsis';
            sty.webkitBoxOrient = 'vertical';
            sty.display = '-webkit-box';
            sty.webkitLineClamp = clampValue;

            if (isCSSValue) {
                sty.height = opt.clamp + 'px';
            }
        }
        else {
            var height = getMaxHeight(clampValue);
            truncate(height, true);
        }
    }

    window.$clamp = clamp;
})();