
const { serializeCSSComponentValue, serializeIdentifier } = require('../serialize.js')
const CSSFunctionDeclarations = require('./CSSFunctionDeclarations.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const { isOmitted } = require('../utils/value.js')
const { parseBlockContents } = require('../parse/parser.js')

/**
 * @see {@link https://drafts.csswg.org/css-mixins-1/#cssfunctionrule}
 */
class CSSFunctionRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { parentStyleSheet } = this
        const { prelude: [{ name, value: parameters }, returnType], value } = privateData
        const type = isOmitted(returnType) ? '*' : serializeCSSComponentValue(returnType[1])
        const rules = parseBlockContents(value, this).map(rule => {
            if (Array.isArray(rule)) {
                return CSSFunctionDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this._parameters = parameters
        this.name = serializeIdentifier({ value: name })
        this.returnType = type === 'type(*)' ? '*' : type
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _parameters, cssRules, name, returnType } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        let string = `@function ${name}(${serializeCSSComponentValue(_parameters)}) `
        if (returnType !== '*') {
            string += `returns ${returnType} `
        }
        string += rules ? `{ ${rules } }` : '{}'
        return string
    }

    /**
     * @returns {FunctionParameter[]}
     * @see {@link https://drafts.csswg.org/css-mixins-1/#dom-cssfunctionrule-getparameters}
     */
    getParameters() {
        const parameters = []
        this._parameters.forEach(([name, type, defaultValue]) => {
            defaultValue = isOmitted(defaultValue) ? null : serializeCSSComponentValue(defaultValue[1]),
            name =  serializeIdentifier(name)
            if (isOmitted(type)) {
                type = '*'
            } else if (type.types[0] === '<function>') {
                type = serializeCSSComponentValue(type.value)
            } else {
                type = serializeCSSComponentValue(type)
            }
            parameters.push({ defaultValue, name, type })
        })
        return parameters
    }
}

module.exports = {
    implementation: CSSFunctionRuleImpl,
}
