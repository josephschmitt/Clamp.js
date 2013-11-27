Clamps (ie. cuts off) an HTML element's content by adding ellipsis to it if the 
content inside is too long.


# Sample Usage

<pre>
//Single line
$clamp(myHeader, {clamp: 1});

//Multi-line
$clamp(myHeader, {clamp: 3});

//Auto-clamp based on available height
$clamp(myParagraph, {clamp: 'auto'});

//Auto-clamp based on a fixed element height
$clamp(myParagraph, {clamp: '35px'});
</pre>

The $clamp method is the primary way of interacting with Clamp.js, and it takes two
arguments. The first is the element which should be clamped, and the second is an
Object with options in JSON notation.


# Options

**clamp** _(Number | String | 'auto')_. This controls where and when to clamp the 
text of an element. Submitting a number controls the number of lines that should
be displayed. Second, you can submit a CSS value (in px or em) that controls the
height of the element as a String. Finally, you can submit the word 'auto' as a string.
Auto will try to fill up the available space with the content and then automatically
clamp once content no longer fits. This last option should only be set if a static 
height is being set on the element elsewhere (such as through CSS) otherwise no 
clamping will be done.

**useNativeClamp** _(Boolean)_. Enables or disables using the native -webkit-line-clamp
in a supported browser (ie. Webkit). It defaults to true if you're using Webkit,
but it can behave wonky sometimes so you can set it to false to use the JavaScript-
based solution.

**truncationChar** _(String)_. The character to insert at the end of the HTML element
after truncation is performed. This defaults to an ellipsis (…).

**truncationHTML** _(String)_. A string of HTML to insert before the truncation character.
This is useful if you'd like to add a "Read more" link or some such thing at the end of
your clamped node.

**splitOnChars** _(Array)_. Determines what characters to use to chunk an element into
smaller pieces. Version 0.1 of Clamp.js would always remove each individual character
to check for fit. With v0.2, you now have an option to pass a list of characters it
can use. For example, it you pass an array of ['.', ',', ' '] then it will first remove
sentences, then remove comma-phrases, and remove words, and finally remove individual
characters to try and find the correct height. This will lead to increased performance
and less looping when removing larger pieces of text (such as in paragraphs). The default
is set to remove sentences (periods), hypens, en-dashes, em-dashes, and finally words 
(spaces). Removing by character is always enabled as the last attempt no matter what
is submitted in the array.

**animate** _(Boolean)_. Silly little easter-egg that, when set to true, will animate
removing individual characters from the end of the element until the content fits.
Defaults to false.
