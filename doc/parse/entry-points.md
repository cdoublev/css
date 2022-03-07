
# The CSS parser entry points

- [parse a component value](#parse-a-component-value)
- [parse a list of component values](#parse-a-list-of-component-values)
- [parse a comma-separated list of component values](#parse-a-comma-separated-list-of-component-values)
- [parse a declaration](#parse-a-declaration)
- [parse a rule](#parse-a-rule)
- [parse a list of declarations](#parse-a-list-of-declarations)
- [parse a style block's contents](#parse-a-style-block-s-contents)
- [parse a list of rules](#parse-a-list-of-rules)
- [parse a stylesheet](#parse-a-stylesheet)
- [parse something according to a CSS grammar](#parse-something-according-to-a-CSS-grammar)
- [parse a comma-separated list according to a CSS grammar](#parse-a-comma-separated-list-according-to-a-CSS-grammar)
- [parse a CSS (property) value](#parse-a-CSS-property-value)
- [parse a CSS declaration](#parse-a-CSS-declaration)
- [parse a CSS declaration block](#parse-a-CSS-declaration-block)
- [parse a CSS rule](#parse-a-CSS-rule)
- [parse a CSS rule block contents](#parse-a-css-rule-block-contents)
- [parse a CSS stylesheet](#parse-a-CSS-stylesheet)
- [parse a CSS media query](#parse-a-CSS-media-query)
- [parse a CSS media query list](#parse-a-CSS-media-query-list)
- [parse a CSS selector list](#parse-a-CSS-selector-list)
- [parse a CSS forgiving selector list](#parse-a-CSS-forgiving-selector-list)
- [parse a CSS relative selector list](#parse-a-CSS-relative-selector-list)
- [parse a CSS forgiving relative selector list](#parse-a-CSS-forgiving-relative-selector-list)
- [parse a CSS page selector list](#parse-a-CSS-page-selector)
- [parse a CSS `@page`](#parse-a-CSS-page)

***

<table id="parse-a-component-value">
  <tr><th>Algorithm</th><td>Parse a component value</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-component-value">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/css-values-5/#substitute-an-attr">
            CSS Values - substitute an <code>attr()</code>
          </a> (computed value)
        </li>
        <li>
          <a href="https://drafts.csswg.org/mediaqueries-4/">
            CSS Media Queries - (set) <code>CSSCustomMediaRule.name</code>
          </a> (not published yet)
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-list-of-component-values">
  <tr><th>Algorithm</th><td>Parse a list of component values</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-component-values">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-CSS-property-value">
            CSSOM - parse a CSS (property) value
          </a>
        </li>
        <li>
          <a href="#parse-something-according-to-a-CSS-grammar">
            CSS Syntax - parse something according to a CSS grammar
          </a>
        </li>
        <li>
          <a href="#parse-a-comma-separated-list-according-to-a-CSS-grammar">
            CSS Syntax - parse a comma-separated list according to a CSS grammar
          </a> (via <i>parse something according to a CSS grammar</i>)
        </li>
        <li>
          <a href="#parse-a-CSS-page">
            CSS Page - parse a CSS <code>@page</code>
          </a> (via <i>parse something according to a CSS grammar</i>)
          <p>❌: see issue in <a href="#parse-a-CSS-page">parse a CSS page</a>.</p>
        </li>
        <li>
          <a href="#parse-a-CSS-selector-list">
            CSS Selectors - parse a CSS selector list
          </a> (via <i>parse something according to a CSS grammar</i>)
        </li>
        <li>
          <a href="#parse-a-CSS-forgiving-selector-list">
            CSS Selectors - parse a CSS forgiving selector list
          </a> (<i>via parse a comma-separated list according to a CSS grammar</i>)
        </li>
        <li>
          <a href="#parse-a-CSS-relative-selector-list">
            CSS Selectors - parse a CSS relative selector list
          </a> (via <i>parse something according to a CSS grammar</i>)
        </li>
        <li>
          <a href="#parse-a-CSS-forgiving-relative-selector-list">
            CSS Selectors - parse a CSS forgiving relative selector list
          </a> (<i>via parse a comma-separated list according to a CSS grammar</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-counter-styles-3/#the-csscounterstylerule-interface">
            CSS Counter Styles - (set) <code>CSSCounterStyleRule.&lt;descriptor></code>
          </a>
          <p>❌: it should use <i>parse something according to a CSS grammar</i> using <i>the descriptor’s grammar</i></p>
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-font-loading-3/#fontface-interface">
            CSS Font Loading - (set) <code>FontFace.&lt;descriptor></code>
          </a> (via <i>parse something according to a CSS grammar</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-pseudo-4/#dom-element-pseudo">
            CSS Pseudo - <code>CSSPseudoElement.pseudo()</code>
          </a> (via <i>parse something according to a CSS grammar</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-conditional-3/#dom-css-supports">
            CSS Conditionals - <code>CSS.supports()</code>
          </a> (via <i>parse something according to a CSS grammar</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-conditional-3/#dom-cssconditionrule-conditiontext">
            CSS Conditionals - <code>CSSConditionRule.conditionText</code>
          </a> (via <i>parse something according to a CSS grammar</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty">
            CSSOM - <code>CSSStyleDeclaration.setProperty()</code>
          </a> (via <i>parse a CSS (property) value</i>)
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th> <td>none</td></tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>❌: CSS Syntax defines <i>parse a list of component values</i> as the entry point to use <a href="https://drafts.csswg.org/css-syntax-3/#parser-entry-points"><i>for parsing a stand-alone selector</i></a>, but where does a <i>stand-alone selector is used</i>? If it is a style rule's prelude, it should use <a href="#parse-a-CSS-selector-list">parse a CSS selector list</a>.</p>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-comma-separated-list-of-component-values">
  <tr><th>Algorithm</th><td>Parse a comma-separated list of component values</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-comma-separated-list-of-component-values">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-comma-separated-list-according-to-a-CSS-grammar">
            CSS Syntax - parse a comma-separated list according to a CSS grammar
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#parse-a-media-query">
            CSSOM - <code>parse a CSS media query</code>
          </a>
          <p>❌: see issue in <a href="#parse-a-CSS-media-query-list">parse a CSS media query list</a>.</p>
        </li>
        <li>
          <a href="#parse-a-CSS-media-query-list">
            CSS Media Queries - parse a CSS media query list</code>
          </a>
          <p>❌: see issue in <a href="#parse-a-CSS-media-query-list">parse a CSS media query list</a>.</p>
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-medialist-appendmedium">
            CSSOM - <code>MediaList.appendMedium()</code>
          </a> (via <i>parse a CSS media query</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-medialist-deletemedium">
            CSSOM - <code>MediaList.deleteMedium()</code>
          </a> (via <i>parse a CSS media query</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#the-medialist-interface">
            CSSOM - (set) <code>MediaList.mediaText</code>
          </a> (via <i>parse a CSS media query list</i>)
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Public uses</th>
    <td>
      <ul>
        <li>
          <a href="https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-media-query-list">
            HTML - valid media query list
          </a> (<code>Element.media</code> should be a valid <code>&lt;media-query-list></code>)
          <p>❌: CSS Syntax defines <i>parse a list of component values</i> as <a href="https://drafts.csswg.org/css-syntax-3/#parser-entry-points">the entry point</a> to use, but it should use <i>parse a comma-separated list according to a CSS grammar</i> using <code>&lt;media-query></code> (see issue in <a href="#parse-a-CSS-media-query-list">parse a CSS media query list</a>).</p>
        </li>
        <li>
          <a href="https://html.spec.whatwg.org/multipage/images.html#parse-a-sizes-attribute">
            HTML - parse a sizes attribute
          </a> (of <code>Element.sizes</code>)
          <p>❌: it should use <i>parse a comma-separated list according to a CSS grammar</i> using <code>&lt;source-size></code> because it would avoid some processings in the current procedure.</p>
        </li>
      </ul>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-declaration">
  <tr><th>Algorithm</th><td>Parse a declaration</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-declaration">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/css-conditional-3/#typedef-supports-decl">
            Conditional - parse a CSS <code>&lt;supports-decl></code>
          </a>
          <p>❌: CSS Syntax defines this algorithm as the entry point to use <i>in <code>@supports</code> conditions</i>, but it should use <i><a href="#parse-something-according-to-a-CSS-grammar">parse something according to a CSS grammar</i> using the grammar of the declaration property and the declaration value, or an updated version of <i>step 3.1 of <a href="#parse-a-CSS-declaration-block">parse a CSS declaration block</a></i> that would reference this algorithm, as well as <a href="https://drafts.csswg.org/css-conditional-3/#support-definition">6.1 Supports</a> in CSS Conditional, which defines that <i>a CSS processor is considered to support a declaration (consisting of a property and value) if it accepts that declaration</i>.</p>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-rule">
  <tr><th>Algorithm</th><td>Parse a rule</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-rule">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-CSS-rule">
            CSSOM - parse a CSS rule
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#insert-a-css-rule">
            CSSOM - insert a CSS rule
          </a> (via <i>parse a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssstylesheet-insertrule">
            CSSOM - <code>CSSStyleSheet.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssgroupingrule-insertrule">
            CSSOM - <code>CSSGroupingRule.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-nesting-1/#dom-cssstylerule-insertrule">
            CSS Nesting - <code>CSSStyleRule.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-insertrule">
            CSS Nesting - <code>CSSNestingRule.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-list-of-declarations">
  <tr><th>Algorithm</th><td>Parse a list of declarations</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-declarations">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-CSS-declaration-block">
            CSSOM - parse a CSS declaration block
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-style-block-s-contents">
  <tr><th>Algorithm</th><td>Parse a style block's contents</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-style-blocks-contents">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-css-style-block-s-contents">
            CSS Syntax - parse a CSS style block's contents
          </a>
          <p>❌: CSS Syntax associates "style block" to <i>parse a list of declarations</i> in <a href="https://drafts.csswg.org/css-syntax-3/#qualified-rule">5. Parsing</a>:</p>
          <blockquote cite="https://drafts.csswg.org/css-syntax-3/#qualified-rule">Note: Most qualified rules will be style rules, where the prelude is a selector [SELECT] and the block a <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-declarations">list of declarations</a>.</blockquote>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-list-of-rules">
  <tr><th>Algorithm</th><td>Parse a list of rules</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-rules">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-css-rule-block-contents">
            CSS Syntax - parse a CSS rule block contents</code>
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssstylesheet-replace">
            CSSOM - <code>CSSStyleSheet.replace()</code>
          </a>
          <p>❌: it should use <a href="#parse-a-CSS-rule">parse a CSS rule</a> otherwise the rules will not be validated according to the context and production rules, and the rule's block contents will be left unparsed as a list of component values (see <a href="https://github.com/w3c/csswg-drafts/issues/6995">Issue #6995</a>).</p>
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssstylesheet-replacesync">
            CSSOM - <code>CSSStyleSheet.replaceSync()</code>
          </a>
          <p>❌: see above issue.</p>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-stylesheet">
  <tr><th>Algorithm</th><td>Parse a stylesheet</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-css-stylesheet">
            CSS Syntax - parse a CSS stylesheet
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-cascade-4/#fetch-an-import">
            CSS Cascade - fetch an <code>@import</code>
          </a>
          <p>❌: it should use <a href="#parse-a-CSS-stylesheet">parse a CSS stylesheet</a> otherwise the rules will not be validated according to the context and production rules, and the rule's block contents will be left unparsed as a list of component values.</p>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-something-according-to-a-CSS-grammar">
  <tr><th>Algorithm</th><td>Parse something according to a CSS grammar</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-comma-separated-list-according-to-a-CSS-grammar">
            CSS Syntax - parse a comma-separated list according to a CSS grammar
          </a>
        </li>
        <li>
          <a href="#parse-a-CSS-page">
            CSS Page - parse a CSS <code>@page</code>
          </a>
          <p>❌: see issue in <a href="#parse-a-CSS-page">parse a CSS page</a>.</p>
        </li>
        <li>
          <a href="#parse-a-CSS-selector-list">
            CSS Selectors - parse a CSS selector list
          </a>
        </li>
        <li>
          <a href="#parse-a-CSS-relative-selector-list">
            CSS Selectors - parse a CSS relative selector list</code>
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-conditional-3/#the-css-namespace">
            CSS Conditionals - <code>CSS.supports()</code>
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-conditional-3/#dom-cssconditionrule-conditiontext">
            CSS Conditionals - <code>CSSConditionRule.conditionText</code>
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-font-loading-3/#fontface-interface">
            CSS Font Loading - (set) <code>FontFace.&lt;descriptor></code>
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-pseudo-4/#CSSPseudoElement-interface">
            CSS Pseudo - <code>CSSPseudoElement.pseudo()</code>
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Public uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/cssom/#extensions-to-the-window-interface">
            HTML - <code>Window.getComputedStyle()</code>
          </a>
        </li>
        <li>
          <a href="https://w3c.github.io/manifest/#dfn-process-a-color-member">
            Web Manifest - process a color member
          </a>
        </li>
      </ul>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-comma-separated-list-according-to-a-CSS-grammar">
  <tr><th>Algorithm</th><td>Parse a comma-separated list according to a CSS grammar</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#css-parse-a-comma-separated-list-according-to-a-css-grammar">
        CSS Syntax
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-CSS-forgiving-selector-list">
            CSS Selectors - parse a CSS forgiving selector list
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-property-value">
  <tr><th>Algorithm</th><td>Parse a CSS (property) value</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/cssom/#parse-a-css-value">
        CSSOM
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty">
            CSSOM - <code>CSSStyleDeclaration.setProperty()</code>
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>❌: it should be named <i>parse a CSS property value</i> because a CSS value (not defined anywhere) can be a CSS property or descriptor value, a CSS prelude value, a (unparsed) CSS rule or CSS rule list, a (unparsed) CSS declaration or CSS declaration list, ie. <strong>a list of component values</strong>.</p>
      <p>❌: step 1-2 should be replaced by <i>parse something according to a CSS grammar</i> using the corresponding grammar for the property.</p>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-declaration">
  <tr><th>Algorithm</th><td>Parse a CSS declaration</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/cssom/#parse-a-css-declaration-block">
        CSSOM
      </a> (step 3.1)
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-CSS-declaration-block">
            CSSOM - Parse a CSS declaration block
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-conditional-3/#typedef-supports-decl">
            Conditional - parse a CSS <code>&lt;supports-decl></code>
          </a>
          <p>❌: see issue in <a href="#parse-a-declaration">parse a declaration</a>.</p>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>❌: it should be defined with <i>parse something according to a CSS grammar</i> using the corresponding grammar for the declaration property, or with <i>parse a CSS (property) value</i> for the declaration property and value.</p>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-declaration-block">
  <tr><th>Algorithm</th><td>Parse a CSS declaration block</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/cssom/#parse-a-css-declaration-block">
        CSSOM
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/cssom/#ref-for-css-declaration-block⑥">
            CSSOM - create a CSS declaration block</code>
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#ref-for-css-declaration-block⑤">
            CSSOM - attribute change steps
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-csstext">
            CSSOM - (set) <code>CSSStyleDeclaration.cssText</code>
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Public uses</th>
    <td>
      <ul>
        <li>
          <a href="https://html.spec.whatwg.org/multipage/dom.html#the-style-attribute">
            HTML - parse <code>Element.style</code>
          </a> (via <i>create a CSS declaration block</i> or its <i>attribute change steps</i>)
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>📝: it is not equivalent to <i>parse something according to a CSS grammar</i> using <code>&lt;declaration-list></code>.</p>
      <p>❌: it should be named <i>parse a CSS declaration list</i> because a block implies the presence of its associated tokens but a CSS declaration list has none (the list <i>is</i> the value/content of the block), then it could be parsed with <i>parse something according to a CSS grammar</i> using <code>&lt;declaration-list></code>. To avoid a conflict and the confusion with the current <code>&lt;declaration-list></code>, the latter should be renamed to eg. <code>&lt;rule-block></code> (a list of declarations and at-rules).</p>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-rule">
  <tr><th>Algorithm</th><td>Parse a CSS rule</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/cssom/#parse-a-css-rule">
        CSSOM
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/cssom/#insert-a-css-rule">
            CSSOM - insert a CSS rule
          </a> (step 3)
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssstylesheet-insertrule">
            CSSOM - <code>CSSStyleSheet.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssgroupingrule-insertrule">
            CSSOM - <code>CSSGroupingRule.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-nesting-1/#dom-cssstylerule-insertrule">
            CSS Nesting - <code>CSSStyleRule.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-insertrule">
            CSS Nesting - <code>CSSNestingRule.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>📝: it is equivalent to <i>parse something according to a CSS grammar</i> using the grammar for the rule, eg. <code>@page</code>.</p>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-css-rule-block-contents">
  <tr><th>Algorithm</th><td>Parse a CSS rule block contents</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      Syntax (
        <a href="https://drafts.csswg.org/css-syntax-3/#typedef-stylesheet">
          <code>&lt;stylesheet></code>
        </a>,
        <a href="https://drafts.csswg.org/css-syntax-3/#typedef-rule-list">
          <code>&lt;rule-list></code>
        </a>,
        <a href="https://drafts.csswg.org/css-syntax-3/#typedef-style-block">
          <code>&lt;style-block></code>
        </a>,
        <a href="https://drafts.csswg.org/css-syntax-3/#typedef-declaration-list">
          <code>&lt;declaration-list></code>
        </a>
      )
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/cssom/#parse-a-css-rule">
            CSSOM - parse a CSS rule
          </a> (step 3)
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#insert-a-css-rule">
            CSSOM - insert a CSS rule
          </a> (via <i>parse a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssstylesheet-insertrule">
            CSSOM - <code>CSSStyleSheet.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssgroupingrule-insertrule">
            CSSOM - <code>CSSGroupingRule.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-nesting-1/#dom-cssstylerule-insertrule">
            CSS Nesting - <code>CSSStyleRule.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-insertrule">
            CSS Nesting - <code>CSSNestingRule.insertRule()</code>
          </a> (via <i>insert a CSS rule</i>)
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>📝: it is equivalent to <i>parse something according to a CSS grammar</i> using <code>&lt;stylesheet></code>, <code>&lt;rule-list></code>, <code>&lt;style-block></code>, or <code>&lt;declaration-list></code>.</p>
      <p>❌: <code>&lt;style-block></code> is missing in the title of <a href="https://drafts.csswg.org/css-syntax-3/#declaration-rule-list">8.1. Defining Block Contents: the <code>&lt;declaration-list></code>, <code>&lt;rule-list></code>, and <code>&lt;stylesheet></code> productions</a>.</p>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-stylesheet">
  <tr><th>Algorithm</th><td>Parse a CSS stylesheet</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet">
        Syntax
      </a>
    </td>
  </tr>
  <tr><th>Internal uses</th><td>none</td></tr>
  <tr>
    <th>Public uses</th>
    <td>
      <ul>
        <li>
          <a href="https://html.spec.whatwg.org/multipage/links.html#link-type-stylesheet">
            HTML - <code>Link</code> and <code>HTMLLinkElement</code> with <code>rel=stylesheet</code>
          </a> (via <i>Create a CSS style sheet</i>)
        </li>
        <li>
          <a href="https://html.spec.whatwg.org/multipage/semantics.html#update-a-style-block">
            HTML - update a style block
          </a> (<code>HTMLStyleElement</code>, via <i>Create a CSS style sheet</i>)
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>❌: it should run in <a href="https://drafts.csswg.org/cssom/#create-a-css-style-sheet">Create a (non-constructed) CSS style sheet</a> (see <a href="https://github.com/whatwg/html/issues/2997">Issue #2997</a>).</p>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-media-query">
  <tr><th>Algorithm</th><td>Parse a CSS media query</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/cssom/#parse-a-media-query">
        CSSOM
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-medialist-appendmedium">
            CSSOM - <code>MediaList.appendMedium()</code>
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-medialist-deletemedium">
            CSSOM - <code>MediaList.deleteMedium()</code>
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>See comments in <a href="#parse-a-CSS-media-query-list">parse a CSS media query list</a>.</p>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-media-query-list">
  <tr><th>Algorithm</th><td>Parse a CSS media query list</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/cssom/#parse-a-media-query-list">
        CSSOM
      </a>,
      <a href="https://drafts.csswg.org/mediaqueries-5/#typedef-media-query-list">
        CSS Media Queries
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/cssom/#parse-a-media-query">
            CSSOM - parse a CSS media query
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/cssom/#the-medialist-interface">
            CSSOM - (set) <code>MediaList.mediaText</code>
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Public uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/cssom-view/#dom-window-matchmedia">
            CSSOM View - <code>Window.matchMedia()</code>
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>❌: CSS Media Queries defines the procedure with <i>parse a comma-separated list of component values</i> composed with <i>parse something according to a CSS grammar</i> using <code>&lt;media-query></code>, but it should use <i>parse a comma-separated list according to a CSS grammar</i> using <code>&lt;media-query></code>` instead, because a whitespace as input (eg. from <code>Element.media</code>) will be parsed to an empty list instead of <code>not all</code>, and it should define this production specific rule: <i>an empty list must default to <code>all</code> and an invalid <code>&lt;media-query></code> must default to <code>not all</code></i>.</p>
    </td>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-selector-list">
  <tr><th>Algorithm</th><td>Parse a CSS selector list</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/cssom/#parse-a-group-of-selectors">
        CSSOM
      </a>,
      <a href="https://drafts.csswg.org/selectors-4/#parse-a-selector">
        CSS Selectors
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssstylerule-selectortext">
            CSSOM - <code>CSSStyleRule.selectorText</code>
          </a>
        </li>
        <li>
          <a href="https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-selectortext">
            CSS Nesting - <code>CSSNestingRule.selectorText</code>
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Public uses</th>
    <td>
      <ul>
        <li>
          <a href="https://dom.spec.whatwg.org/#scope-match-a-selectors-string">
            HTML - scope-match a selectors string
          </a> (<code>Element.querySelector()</code>, <code>Element.querySelectorAll()</code>)
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>❌: it is named <i>parse a group of selectors</i> in CSSOM (outdated, see <a href="https://github.com/w3c/csswg-drafts/issues/6927">Issue #6927</a>), but it should be <i>parse a CSS selector list</i>.</p>
      <p>📝: it could also be defined with <i>parse something according to a CSS grammar</i> using <code>&lt;selector-list></code> and the following specific rule: <i>if a selector is an invalid selector for any other reason (such as, for example, containing an undeclared namespace prefix), return failure</i>.</p>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-forgiving-selector-list">
  <tr><th>Algorithm</th><td>Parse a CSS forgiving selector list</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/selectors-4/#parse-as-a-forgiving-selector-list">
        CSS Selectors
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/selectors-4/#matches">
            CSS Selectors - parse a CSS <code>&lt;:is()></code>
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-relative-selector-list">
  <tr><th>Algorithm</th><td>Parse a CSS relative selector list</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/selectors-4/#parse-a-relative-selector">
        CSS Selectors
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#">?</a>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td></td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-forgiving-relative-selector-list">
  <tr><th>Algorithm</th><td>Parse a CSS forgiving relative selector list</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/selectors-4/#typedef-forgiving-relative-selector-list">
        CSS Selectors
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/selectors-4/#relational">
            CSS Selectors - parse a CSS <code>&lt;:has()></code>
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-page-selector-list">
  <tr><th>Algorithm</th><td>Parse a CSS page selector list</td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/cssom/#parse-a-list-of-css-page-selectors">
        CSSOM
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="https://drafts.csswg.org/cssom/#dom-cssgroupingrule-selectortext">
            CSSOM - (set) <code>CSSPageRule.selectorText</code></i>
          </a>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
</table>

[Top ↑](#the-css-parser-entry-points)

***

<table id="parse-a-CSS-page">
  <tr><th>Algorithm</th><td>Parse a CSS <code>@page</code></td></tr>
  <tr>
    <th>Definition</th>
    <td>
      <a href="https://drafts.csswg.org/css-page-3/#ref-for-at-ruledef-page%E2%91%A7">
        CSS Page
      </a>
    </td>
  </tr>
  <tr>
    <th>Internal uses</th>
    <td>
      <ul>
        <li>
          <a href="#parse-a-css-rule">CSSOM - Parse a CSS rule</a>
        </li>
      </ul>
    </td>
  </tr>
  <tr><th>Public uses</th><td>none</td></tr>
  <tr>
    <th>Comments</th>
    <td>
      <p>❌: it should use step 3 of <i>parse a CSS rule</i> because <code>@page</code> appears at the top level of the style sheet and <i>parse a CSS stylesheet</i> defines that its input must be parsed with <i>parse a stylesheet</i>, which will <i>consume a list of rules</i>, therefore there will be no such thing as a stream of tokens when <i>parsing a list of component values</i>, the second step of <i>parse something according to a CSS grammar</i>.</p>
    </td>
  </tr>
</table>

[Top ↑](#the-css-parser-entry-points)
